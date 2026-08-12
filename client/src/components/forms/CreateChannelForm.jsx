import { useState } from "react";

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
        <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-input-group">
                <label className="modal-label">Channel Name</label>
                <input
                    className="modal-input"
                    type="text"
                    placeholder="general"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="modal-input-group">
                <label className="modal-label">Description</label>
                <textarea
                    className="modal-input"
                    placeholder="Optional description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ minHeight: "80px", resize: "none" }}
                />
            </div>

            <div className="modal-input-group">
                <label className="modal-label">Channel Type</label>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-primary)", fontSize: "14px" }}>
                        <input
                            type="radio"
                            name="channelType"
                            value="text"
                            checked={type === "text"}
                            onChange={(e) => setType(e.target.value)}
                        />
                        Text
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-primary)", fontSize: "14px" }}>
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
            </div>

            <div className="modal-footer">
                <button type="submit" className="modal-button modal-button-primary">
                    Create Channel
                </button>
            </div>
        </form>
    );
}

export default CreateChannelForm;