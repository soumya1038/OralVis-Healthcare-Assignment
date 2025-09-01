import {Component} from 'react';
import Navbar from './Navbar';
import EachData from './EachData';
import './dentist.css';
class Dentist extends Component {
    state = {
        data: []
    }

    componentDidMount() {
        this.getUploadData();
    }

    getUploadData = async () => {
        try {
            const token = localStorage.getItem("Token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/dentist/scans`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // include the token in the Authorization header
                }
            });
            const data = await response.json();
            // console.log(data);
            this.setState({ data: data });
        } catch (error) {
            console.error(error);
        }
    }

    handleDeleteScan = async (scanId) => {
        if (!window.confirm('Are you sure you want to delete this scan?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem("Token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/dentist/scans/${scanId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            
            if (response.ok) {
                alert('Scan deleted successfully');
                this.getUploadData(); // Refresh the data
            } else {
                alert('Failed to delete scan');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting scan');
        }
    }



    render() {
        const {data} = this.state;
        return (
            <div>
                <Navbar/>
                <div className="dentist-container">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">Dentist Dashboard</h1>
                        <p className="dashboard-subtitle">Patient Scans Overview</p>
                    </div>
                    
                    <div className="stats-section">
                        <div className="stat-card">
                            <div className="stat-number">{data.length}</div>
                            <div className="stat-label">Total Scans</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{new Set(data.map(item => item.patientId)).size}</div>
                            <div className="stat-label">Unique Patients</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{data.filter(item => new Date(item.uploadedAt).toDateString() === new Date().toDateString()).length}</div>
                            <div className="stat-label">Today's Scans</div>
                        </div>
                    </div>
                    
                    <div className="scans-container">
                        {data.length > 0 ? (
                            <ul className="scans-grid">
                                {data.map(item => (
                                    <li key={item.id} className="scan-item">
                                        <EachData item={item} onDelete={this.handleDeleteScan} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🦷</div>
                                <h3 className="empty-title">No Scans Available</h3>
                                <p className="empty-message">No patient scans have been uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Dentist;