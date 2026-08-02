import React, { useState } from "react";
import "./ServerOptions.css";

const ServerSettingsModal = ({ server, currentUser, onRename, onLeave }) => {
    const [newName, setNewName] = useState(server?.name || "");
    const isOwner = server?.owner === currentUser?._id;

    const handleRename = () => {
        if (!newName.trim() || newName.trim() === server?.name) return;
        onRename(newName.trim());
    };

    return (
        <div className="server-options">
            <h2>Server Settings</h2>
            <p>Manage {server?.name}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                {isOwner && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New server name"
                            style={{
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #202225",
                                backgroundColor: "#e3e5e8",
                                color: "#313338"
                            }}
                        />
                        <button
                            className="server-option-btn primary"
                            onClick={handleRename}
                            disabled={newName.trim() === server?.name || !newName.trim()}
                        >
                            Rename Server
                        </button>
                    </div>
                )}
                
                <button
                    className="server-option-btn danger"
                    onClick={onLeave}
                    style={{ backgroundColor: "#ed4245", color: "white", marginTop: "16px" }}
                >
                    Leave Server
                </button>
            </div>
        </div>
    );
};

export default ServerSettingsModal;
