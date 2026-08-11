import { useState } from "react";
import "./CreateChannelForm.css";

function CreateChannelForm({ onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("text");

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            name,
            description,
            type,
        });

        setName("");
        setDescription("");
        setType("text");
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

            <label>Channel Type</label>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "normal", fontSize: "14px" }}>
                    <input
                        type="radio"
                        name="channelType"
                        value="text"
                        checked={type === "text"}
                        onChange={(e) => setType(e.target.value)}
                    />
                    Text
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "normal", fontSize: "14px" }}>
                    <input
                        type="radio"
                        name="channelType"
                        value="voice"
                        checked={type === "voice"}
                        onChange={(e) => setType(e.target.value)}
                    />
                    Voice
                </label>
            </div>

            <button type="submit">
                Create Channel
            </button>
        </form>
    );
}

export default CreateChannelForm;