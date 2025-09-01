// ----- Core & Libs -----
const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const fs = require('fs');

// SQLite
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

// ----- Setup -----
dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://oralvis-healthcare.netlify.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Multer (temp folder before pushing to Cloudinary)
const upload = multer({ dest: path.join(__dirname, "uploads") });

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DB
const dbPath = path.join(__dirname, "oralvis.db");
let db = null;

const initDBAndServer = async () => {
    try {
        db = await open({ filename: dbPath, driver: sqlite3.Database });

        // Create Tables
        await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Technician','Dentist'))
      );
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientName TEXT NOT NULL,
        patientId TEXT NOT NULL,
        scanType TEXT NOT NULL,
        region TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        uploadedBy INTEGER NOT NULL,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploadedBy) REFERENCES users(id)
      );
    `);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server Is Started on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.log(`DB Error ${e.message}`);
        process.exit(1);
    }
};
initDBAndServer();

// ----- Helpers / Middleware -----

// JWT auth
const authenticateToken = (req, res, next) => {
    let token;
    const authHeader = req.headers["authorization"];
    if (authHeader) token = authHeader.split(" ")[1];

    if (!token) {
        res.status(401).send("Invalid JWT Token");
        return;
    }
    jwt.verify(token, process.env.JWT_SECRET || "LOGIN", (error, payload) => {
        if (error) {
            res.status(401).send("Invalid JWT Token");
        } else {
            req.user = { id: payload.id, role: payload.role, email: payload.email };
            next();
        }
    });
};

// Role guard
const authorizeRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).send("Forbidden");
    next();
};

// ----- Health / Root -----
app.get("/", (req, res) => {
    res.send("🚀 OralVis API is running...");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// ----- Auth -----

// Register (POST /register)
// body: { name, email, password, role: 'Technician' | 'Dentist' }
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).send("All fields are required");
    }
    if (!["Technician", "Dentist"].includes(role)) {
        return res.status(400).send("Invalid role");
    }
    if (password.length < 6) {
        return res.status(400).send("Password is too short");
    }

    try {
        const existing = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existing) return res.status(400).json({ success: false, message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        await db.run(
            `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashed, role]
        );

        res.json({ success: true, message: "User created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// Login (POST /login)
// body: { email, password }
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid user",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid password",
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "LOGIN", {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Login successful",
      jwtToken: token,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      status: 500,
      message: "Server error",
      error: err.message
    });
  }
});


// ----- Technician: Upload Scan -----

// POST /technician/upload (protected, role: Technician)
// form-data fields: patientName, patientId, scanType, region, scan(file)
app.post(
    "/technician/upload",
    authenticateToken,
    authorizeRole("Technician"),
    upload.single("scan"),
    async (req, res) => {
        try {
            const { patientName, patientId, scanType, region } = req.body;
            const file = req.file;

            if (!patientName || !patientId || !scanType || !region) {
                return res.status(400).send("All fields are required");
            }
            if (!file) return res.status(400).send("No file uploaded");

            // Upload to Cloudinary
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "oralvis_scans",
            });

            // Optional: Delete local file after upload
            fs.unlink(file.path, (err) => {
                if (err) console.error('Failed to delete local file:', err);
            });
            // Save record in DB
            await db.run(
                `INSERT INTO scans (patientName, patientId, scanType, region, imageUrl, uploadedBy)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [patientName, patientId, scanType, region, result.secure_url, req.user.id]
            );

            res.status(200).json({ message: "Scan uploaded successfully", imageUrl: result.secure_url });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Upload failed", details:error.message } );
        }
    }
);

// ----- Dentist: View Scans -----

// GET /dentist/scans (protected, role: Dentist)
app.get("/dentist/scans", authenticateToken, authorizeRole("Dentist"), async (req, res) => {
    try {
        const scans = await db.all(
            `SELECT s.*, u.name as uploadedByName, u.email as uploadedByEmail
       FROM scans s
       LEFT JOIN users u ON u.id = s.uploadedBy
       ORDER BY s.uploadedAt DESC`
        );
        res.json(scans);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching scans");
    }
});
