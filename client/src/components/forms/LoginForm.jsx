import { useState } from "react";
import "./LoginForm.css";

function LoginForm({ onSubmit }) {
    const [formData, setFormData] = useState({
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
                Log In
            </button>
        </form>
    );
}

export default LoginForm;