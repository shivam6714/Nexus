import React from "react";
// Re-use existing server options styles for consistency
import "./ServerOptions.css";

const ServerActionsModal = ({ onServerInfo, onManageServer, onLeaveServer }) => {
    return (
        <div className="server-options">
            <h2>Server Actions</h2>
            <p>Manage the current server.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                <button
                    className="server-option-btn secondary"
                    onClick={onServerInfo}
                >
                    Server Info
                </button>

                {/* Additional future actions like Server Settings or Roles can be cleanly inserted here */}
                
                <button
                    className="server-option-btn primary"
                    onClick={onManageServer}
                >
                    Manage Server
                </button>

                <button
                    className="server-option-btn danger"
                    onClick={onLeaveServer}
                    style={{ backgroundColor: "#ed4245", color: "white", marginTop: "16px" }}
                >
                    Leave Server
                </button>
            </div>
        </div>
    );
};

export default ServerActionsModal;
