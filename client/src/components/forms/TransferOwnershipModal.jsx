import React, { useState } from "react";
import "./ServerOptions.css"; // Reuse existing button styles

const TransferOwnershipModal = ({ members, currentOwnerId, onTransfer, onClose }) => {
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    // Filter out the current owner
    const eligibleMembers = members.filter((m) => m._id !== currentOwnerId);

    return (
        <div className="server-options" style={{ width: "400px" }}>
            <h2>Transfer Ownership</h2>
            <p style={{ color: "#b9bbbe", marginBottom: "16px" }}>
                You must transfer ownership before leaving. Select a new owner from the list below:
            </p>

            <div
                style={{
                    maxHeight: "240px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    backgroundColor: "#2b2d31",
                    padding: "8px",
                    borderRadius: "8px",
                    marginBottom: "20px"
                }}
            >
                {eligibleMembers.length === 0 ? (
                    <p style={{ color: "#72767d", textAlign: "center", padding: "20px 0" }}>
                        No eligible members found.
                    </p>
                ) : (
                    eligibleMembers.map((member) => (
                        <div
                            key={member._id}
                            onClick={() => setSelectedMemberId(member._id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                backgroundColor: selectedMemberId === member._id ? "#404249" : "transparent",
                                transition: "background-color 0.1s ease-in-out"
                            }}
                        >
                            {member.avatar ? (
                                <img
                                    src={`http://localhost:5000${member.avatar}`}
                                    alt={member.username}
                                    style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: "#5865f2",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {member.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span style={{ color: "#f2f3f5", fontWeight: "500" }}>{member.username}</span>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                    onClick={onClose}
                    className="server-option-btn secondary"
                    style={{ margin: 0, width: "auto", padding: "10px 24px" }}
                >
                    Cancel
                </button>
                <button
                    onClick={() => onTransfer(selectedMemberId)}
                    disabled={!selectedMemberId}
                    className="server-option-btn danger"
                    style={{
                        margin: 0,
                        width: "auto",
                        padding: "10px 24px",
                        backgroundColor: selectedMemberId ? "#ed4245" : "#7a2729",
                        color: selectedMemberId ? "white" : "#a19999",
                        cursor: selectedMemberId ? "pointer" : "not-allowed",
                        opacity: selectedMemberId ? 1 : 0.7
                    }}
                >
                    Transfer & Leave
                </button>
            </div>
        </div>
    );
};

export default TransferOwnershipModal;
