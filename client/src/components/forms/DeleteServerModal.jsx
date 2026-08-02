import React from "react";
import "./ServerOptions.css";

const DeleteServerModal = ({ onCancel, onConfirm }) => {
    return (
        <div style={{ padding: "20px", color: "white" }}>
            <h2>Delete Server</h2>
            <p style={{ marginTop: "10px", color: "#b9bbbe", lineHeight: "1.5" }}>
                You are the last member of this server.<br/>
                Leaving will permanently delete the server.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
                <button onClick={onCancel} className="server-option-btn secondary" style={{ margin: 0, width: "auto", padding: "10px 24px" }}>Cancel</button>
                <button onClick={onConfirm} className="server-option-btn danger" style={{ backgroundColor: "#ed4245", margin: 0, width: "auto", padding: "10px 24px" }}>Delete Server</button>
            </div>
        </div>
    );
};

export default DeleteServerModal;
