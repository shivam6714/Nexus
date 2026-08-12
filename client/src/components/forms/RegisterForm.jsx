import { useState } from "react";
import "./RegisterForm.css";

function RegisterForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !formData.username.trim() ||
            !formData.email.trim() ||
            !formData.password.trim()
        ) {
            return;
        }

        onSubmit(formData);
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
                <label className="auth-label">USERNAME</label>
                <input
                    type="text"
                    name="username"
                    className="auth-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="auth-input-group">
                <label className="auth-label">EMAIL</label>
                <input
                    type="email"
                    name="email"
                    className="auth-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="auth-input-group">
                <label className="auth-label">PASSWORD</label>
                <input
                    type="password"
                    name="password"
                    className="auth-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" className="auth-button">
                Continue
            </button>
        </form>
    );
}

export default RegisterForm;