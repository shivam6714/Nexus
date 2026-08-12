import React from "react";

const ServerActionsModal = ({ onServerInfo, onManageServer, onLeaveServer }) => {
    return (
        <div className="modal-form">
            <p style={{ marginTop: "-8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                Manage the current server.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                <button
                    className="modal-button modal-button-secondary"
                    style={{ textAlign: "left", padding: "12px 16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}
                    onClick={onServerInfo}
                >
                    Server Info
                </button>
                
                <button
                    className="modal-button modal-button-secondary"
                    style={{ textAlign: "left", padding: "12px 16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}
                    onClick={onManageServer}
                >
                    Manage Server
                </button>

                <button
                    className="modal-button modal-button-danger"
                    style={{ textAlign: "left", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginTop: "8px" }}
                    onClick={onLeaveServer}
                >
                    Leave Server
                </button>
            </div>
        </div>
    );
};

export default ServerActionsModal;
