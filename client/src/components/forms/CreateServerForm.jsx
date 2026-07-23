import { useState } from "react";
import "./CreateServerForm.css";

function CreateServerForm({ onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            name,
            description,
        });

        setName("");
        setDescription("");
    };

    return (
        <form
            className="create-server-form"
            onSubmit={handleSubmit}
        >
            <label>Server Name</label>

            <input
                type="text"
                placeholder="Enter server name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <label>Description</label>

            <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">
                Create Server
            </button>
        </form>
    );
}

export default CreateServerForm;