import { Component, use } from 'react';
import Cookies from 'js-cookie';
import './login.css';

class Login extends Component {

    state = {
        name: '',
        email: '',
        password: '',
        role: '',
        showRegister: false
    }

    componentDidMount() {
        const token = Cookies.get("Token");
        if (token) {
            const lastPath = sessionStorage.getItem("lastPath") || "/";
            const target = lastPath !== "/login" ? lastPath : "/";
            window.location.replace(target);
        }
    }


    onChangeName = event => this.setState({ name: event.target.value });
    onChangeEmail = event => this.setState({ email: event.target.value });
    onChangePassword = event => this.setState({ password: event.target.value });
    onChangeRole = event => this.setState({ role: event.target.value });

    onClickSubmit = event => {
        event.preventDefault();
        // console.log('clicked');
        const { email, password } = this.state;
        const userdata = { email, password };

        fetch(`${import.meta.env.VITE_API_URL}/login`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userdata)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    // Set cookies FIRST
                    const token = data.jwtToken;
                    Cookies.set('Token', token, { expires: 1 });
                    localStorage.setItem('Token', token);
                    Cookies.set("user", JSON.stringify({ email: data.email, role: data.role }), { expires: 1 });
                    
                    alert('Login Successful');
                    const path = data.role === 'Technician' ? '/technician' : '/dentist';
                    window.location.href = path;
                } else {
                    alert('Login Failed');
                }
            })
            .catch(err => console.log(err));
        // const {email, password} = this.state;
        // const userdata = {email, password};

    }

    onClickRegister = (event) => {
        event.preventDefault();
        const { name, email, password, role } = this.state;
        const userdata = { name, email, password, role };
        // Remove password from logs in production!
        console.log({ name, email, role, password });

        fetch(`${import.meta.env.VITE_API_URL}/register`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userdata),
        })
            .then(async (response) => {
                const data = await response.json();
                console.log("Server response:", data);

                if (data.success) {
                    alert("Registration Successful");
                    this.setState({
                        name: "",
                        email: "",
                        password: "",
                        role: "",
                        showRegister: false,
                    });
                } else {
                    alert(data.message || "Registration Failed");
                }
            })
            .catch((err) => {
                console.error("Registration error:", err);
                alert("An error occurred during registration.");
            });
    }

    onRegister = () => this.setState(prevState => ({ showRegister: !prevState.showRegister }));

    render() {
        const { name, email, password, role, showRegister } = this.state;
        return (
            <div className="login-container">
                <div className="auth-card">
                    {!showRegister && (
                        <div>
                            <h1 className="auth-title">Login</h1>
                            <form className="auth-form" onSubmit={this.onClickSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input 
                                        className="form-input"
                                        type="email" 
                                        placeholder="Enter Email" 
                                        value={email} 
                                        onChange={this.onChangeEmail}
                                        autoComplete="username" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input 
                                        className="form-input"
                                        type="password" 
                                        placeholder="Enter Password" 
                                        value={password} 
                                        onChange={this.onChangePassword}
                                        autoComplete="current-password" 
                                    />
                                </div>
                                <button className="submit-btn" type="submit">Login</button>
                            </form>
                            <p className="auth-switch">
                                Don't have an account? <span className="auth-link" onClick={this.onRegister}>Register</span>
                            </p>
                        </div>
                    )}
                    {showRegister && (
                        <div>
                            <h1 className="auth-title">Register</h1>
                            <form className="auth-form" onSubmit={this.onClickRegister}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Enter Name"
                                        value={name}
                                        onChange={this.onChangeName}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        placeholder="Enter Email"
                                        value={email}
                                        onChange={this.onChangeEmail}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={this.onChangePassword}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        value={role}
                                        onChange={this.onChangeRole}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Dentist">Dentist</option>
                                        <option value="Technician">Technician</option>
                                    </select>
                                </div>
                                <button className="submit-btn" type="submit">Register</button>
                            </form>
                            <p className="auth-switch">
                                Already have an account? <span className="auth-link" onClick={this.onRegister}>Login</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
export default Login;