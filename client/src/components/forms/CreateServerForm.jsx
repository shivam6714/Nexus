import { useState } from "react";

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
        <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-input-group">
                <label className="modal-label">Server Name</label>
                <input
                    className="modal-input"
                    type="text"
                    placeholder="Enter server name"
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

            <div className="modal-footer">
                <button type="submit" className="modal-button modal-button-primary">
                    Create Server
                </button>
            </div>
        </form>
    );
}

export default CreateServerForm;