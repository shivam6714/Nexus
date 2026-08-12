import React, { useState } from "react";

const ServerSettingsModal = ({ server, currentUser, onRename, onLeave }) => {
    const [newName, setNewName] = useState(server?.name || "");
    const isOwner = server?.owner === currentUser?._id;

    const handleRename = () => {
        if (!newName.trim() || newName.trim() === server?.name) return;
        onRename(newName.trim());
    };

    return (
        <div className="modal-form">
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "-8px" }}>
                Manage {server?.name}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                {isOwner && (
                    <div className="modal-input-group">
                        <label className="modal-label">Server Name</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <input
                                className="modal-input"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="New server name"
                                style={{ flex: 1 }}
                            />
                            <button
                                className="modal-button modal-button-primary"
                                onClick={handleRename}
                                disabled={newName.trim() === server?.name || !newName.trim()}
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                )}
                
                <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "8px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Danger Zone</span>
                    <button
                        className="modal-button modal-button-danger"
                        onClick={onLeave}
                    >
                        Leave Server
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerSettingsModal;
