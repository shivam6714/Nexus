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
        <form className="register-form" onSubmit={handleSubmit}>
            <h2>Create your Nexus account</h2>

            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
            />

            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />

            <button type="submit">
                Register
            </button>
        </form>
    );
}

export default RegisterForm;