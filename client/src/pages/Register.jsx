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
            <RegisterForm onSubmit={handleRegister} />
        </div>
    );
}

export default Register;