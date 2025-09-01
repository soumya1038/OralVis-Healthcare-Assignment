import { useState } from "react";
import { jsPDF } from "jspdf";
import "./EachData.css";

const EachData = (props) => {
  const { item } = props;
  const {
    id,
    imageUrl,
    patientId,
    patientName,
    region,
    scanType,
    uploadedAt,
  } = item;

  const [showModal, setShowModal] = useState(false);

  // 📄 Function to download PDF report
  const handleDownloadReport = async () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Patient Scan Report", 20, 20);

    // Patient details
    doc.setFontSize(12);
    doc.text(`Name: ${patientName}`, 20, 40);
    doc.text(`Patient ID: ${patientId}`, 20, 50);
    doc.text(`Scan Type: ${scanType}`, 20, 60);
    doc.text(`Region: ${region}`, 20, 70);
    doc.text(
      `Uploaded: ${new Date(uploadedAt).toLocaleString()}`,
      20,
      80
    );

    // Add Image
    try {
      const imgData = await fetch(imageUrl)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );

      doc.addImage(imgData, "JPEG", 20, 100, 170, 100); // x, y, width, height
    } catch (error) {
      console.error("Image load failed:", error);
      doc.text("Image could not be loaded.", 20, 100);
    }

    // Save PDF
    doc.save(`${patientName}_Report.pdf`);
  };

  return (
    <>
      <div className="scan-card">
        {/* Image */}
        <img
          className="scan-image"
          src={imageUrl}
          alt={`${patientName} scan`}
        />

        {/* Details */}
        <div className="card-content">
          <h2 className="patient-name">{patientName}</h2>
          <p className="patient-detail">ID: {patientId}</p>
          <p className="patient-detail">Type: {scanType}</p>
          <p className="patient-detail">Region: {region}</p>
          <p className="upload-date">
            Uploaded: {new Date(uploadedAt).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button
            onClick={() => setShowModal(true)}
            className="action-btn view-btn"
          >
            <span>🔍</span> View Full Image
          </button>
          <button
            onClick={handleDownloadReport}
            className="action-btn download-btn"
          >
            <span>⬇️</span> Download Report
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img
              src={imageUrl}
              alt="Full Scan"
              className="modal-image"
            />
            <button
              onClick={() => setShowModal(false)}
              className="modal-close"
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EachData;
