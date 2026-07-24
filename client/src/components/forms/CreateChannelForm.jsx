import { useState } from "react";
import "./CreateChannelForm.css";

function CreateChannelForm({ onSubmit }) {
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
            className="create-channel-form"
            onSubmit={handleSubmit}
        >
            <label>Channel Name</label>

            <input
                type="text"
                placeholder="general"
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
                Create Channel
            </button>
        </form>
    );
}

export default CreateChannelForm;