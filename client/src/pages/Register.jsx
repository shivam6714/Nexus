import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/forms/RegisterForm";
import { registerUser } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const handleRegister = async (formData) => {
        try {
            await registerUser(formData);

            

            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error);

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Create an account</h1>
                <p className="auth-subtitle">
                    Join Nexus today
                </p>

                <RegisterForm onSubmit={handleRegister} />

                <div className="auth-switch">
                    Already have an account? <a href="/login" className="auth-switch-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a>
                </div>
            </div>
        </div>
    );
}

export default Register;