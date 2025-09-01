import { Component } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import './technician.css';

class TechnicianUpload extends Component {
  state = {
    patientName: '',
    patientId: '',
    scanType: '',
    region: '',
    file: null,
  }

  onChageName = event => this.setState({ patientName: event.target.value })
  onChageId = event => this.setState({ patientId: event.target.value })
  onChageScantype = event => this.setState({ scanType: event.target.value })
  onChageRegion = event => this.setState({ region: event.target.value })
  onChageFile = event => this.setState({ file: event.target.files[0] })

  onSubmitUpload = async event => {
    event.preventDefault()
    const { patientName, patientId, scanType, region, file } = this.state
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    // console.log(patientId, patientName, scanType, region, file);
    try {
      const formData = new FormData();
      formData.append("patientName", patientName);
      formData.append("patientId", patientId);
      formData.append("scanType", scanType);
      formData.append("region", region);
      formData.append("scan", file);  // 👈 MUST match .single("scan")


      const res = await axios.post(`${import.meta.env.VITE_API_URL}/technician/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
      });

      // console.log(res.data);
      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  }

  render() {
    const { patientName, patientId, scanType, region, file } = this.state;
    return (
      <div>
        <Navbar />
        <div className="technician-container">
          <div className="upload-wrapper">
            <div className="upload-header">
              <h2 className="upload-title">Upload New Patient Scan</h2>
              <p className="upload-subtitle">Add new scan data to the system</p>
            </div>

            <form className="upload-form" onSubmit={this.onSubmitUpload}>
              <div className="form-row">
                <label className="form-label">Patient Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={patientName}
                  onChange={this.onChageName}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label">Patient ID</label>
                <input
                  className="form-input"
                  type="text"
                  value={patientId}
                  onChange={this.onChageId}
                  placeholder="Enter patient ID"
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label">Scan Type</label>
                <select className="form-select" onChange={this.onChageScantype} value={scanType} required>
                  <option value="">Select scan type</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct">CT Scan</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label">Region</label>
                <select className="form-select" onChange={this.onChageRegion} value={region} required>
                  <option value="">Select region</option>
                  <option value="fullMouth">Full Mouth</option>
                  <option value="upperJaw">Upper Jaw</option>
                  <option value="lowerJaw">Lower Jaw</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label">Scan Image</label>
                <div className={`file-upload-area ${file ? 'file-selected' : ''}`}>
                  <input
                    className="file-input"
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif"
                    onChange={this.onChageFile}
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    {file && file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="upload-preview"
                      />
                    ) : (
                      <>
                        <div className="file-upload-icon">📁</div>
                        <div className="file-upload-text">
                          {file ? file.name : 'Click to upload or drag and drop'}
                        </div>
                        <div className="file-upload-hint">
                          PNG, JPG, JPEG, GIF up to 10MB
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>



              <button className="submit-btn" type="submit">
                📤 Upload Scan
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default TechnicianUpload;
