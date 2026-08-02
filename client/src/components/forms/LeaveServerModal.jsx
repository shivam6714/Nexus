import React from "react";
import "./ServerOptions.css";

const LeaveServerModal = ({ onCancel, onConfirm }) => {
    return (
        <div style={{ padding: "20px", color: "white" }}>
            <h2>Are you sure you want to leave this server?</h2>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={onCancel} className="server-option-btn secondary">Cancel</button>
                <button onClick={onConfirm} className="server-option-btn danger" style={{ backgroundColor: "#ed4245" }}>Leave Server</button>
            </div>
        </div>
    );
};

export default LeaveServerModal;
