import { useState } from "react";
import "./JoinServerForm.css";

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
        <form className="join-server-form" onSubmit={handleSubmit}>
            <h2>Join a Server</h2>

            <p>Enter an invite code to join an existing server.</p>

            <input
                type="text"
                placeholder="NXS-ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
            />

            <button type="submit">
                Join Server
            </button>
        </form>
    );
}

export default JoinServerForm;