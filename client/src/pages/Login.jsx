import { useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import { loginUser } from "../services/authService";
import "../styles/auth.css";

function Login() {
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        try {
            const data = await loginUser(credentials);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/chat");
        } catch (error) {
            console.error("Login failed:", error);

            alert(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">
                    We're so excited to see you again!
                </p>

                <LoginForm onSubmit={handleLogin} />
                
                <div className="auth-switch">
                    Need an account? <a href="/register" className="auth-switch-link" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</a>
                </div>
            </div>
        </div>
    );
}

export default Login;