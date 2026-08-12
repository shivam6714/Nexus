import { useState } from "react";

function JoinServerForm({ onSubmit }) {
    const [inviteCode, setInviteCode] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!inviteCode.trim()) return;

        onSubmit({
            inviteCode: inviteCode.trim(),
        });

        setInviteCode("");
    };

    return (
        <form className="modal-form" onSubmit={handleSubmit}>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "-8px" }}>
                Enter an invite code to join an existing server.
            </p>

            <div className="modal-input-group">
                <label className="modal-label">INVITE LINK</label>
                <input
                    className="modal-input"
                    type="text"
                    placeholder="NXS-ABC123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                />
            </div>

            <div className="modal-footer">
                <button type="submit" className="modal-button modal-button-primary">
                    Join Server
                </button>
            </div>
        </form>
    );
}

export default JoinServerForm;