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
        <form className="login-form" onSubmit={handleSubmit}>
            

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
                Login
            </button>
        </form>
    );
}

export default LoginForm;