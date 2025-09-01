import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    Cookies.remove("Token");
    localStorage.removeItem("Token");
    Cookies.remove("user"); // clear user info too
    navigate("/login");
  };

  return (
    <>
      <div className="home-container">
        <div className="home-content">
          <div className="welcome-section">
            <h1 className="welcome-title">OralVis Healthcare</h1>
            <p className="welcome-subtitle">
              Advanced Oral Health Visualization Platform
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🦷</div>
              <h3 className="feature-title">Scan Analysis</h3>
              <p className="feature-description">
                Advanced AI-powered oral scan analysis and diagnostics
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Reports</h3>
              <p className="feature-description">
                Generate comprehensive patient reports and documentation
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Collaboration</h3>
              <p className="feature-description">
                Seamless collaboration between dentists and technicians
              </p>
            </div>
          </div>

          <p className="home-message">
            Please login to access the platform features
          </p>
          <button className="home-login-btn" type="button" onClick={handleLoginClick}>
            Login to Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
