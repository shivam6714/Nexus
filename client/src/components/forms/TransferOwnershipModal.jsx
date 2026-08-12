import React, { useState } from "react";
const TransferOwnershipModal = ({ members, currentOwnerId, onTransfer, onClose }) => {
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    // Filter out the current owner
    const eligibleMembers = members.filter((m) => m._id !== currentOwnerId);

    return (
        <div className="modal-form">
            <p style={{ marginTop: "-8px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                You must transfer ownership before leaving. Select a new owner from the list below:
            </p>

            <div
                style={{
                    maxHeight: "240px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    backgroundColor: "var(--bg-tertiary)",
                    padding: "8px",
                    borderRadius: "var(--radius-sm)"
                }}
            >
                {eligibleMembers.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0", margin: 0, fontSize: "14px" }}>
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
                                borderRadius: "var(--radius-xs)",
                                cursor: "pointer",
                                backgroundColor: selectedMemberId === member._id ? "var(--bg-modifier-selected)" : "transparent",
                                transition: "background-color 0.1s ease-in-out"
                            }}
                        >
                            {member.avatar ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${member.avatar}`}
                                    alt={member.username}
                                    style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--brand-primary)",
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
                            <span style={{ color: "var(--text-primary)", fontWeight: "500", fontSize: "15px" }}>{member.username}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="modal-footer">
                <button
                    onClick={onClose}
                    className="modal-button modal-button-secondary"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onTransfer(selectedMemberId)}
                    disabled={!selectedMemberId}
                    className="modal-button modal-button-danger"
                    style={{
                        opacity: selectedMemberId ? 1 : 0.5,
                        cursor: selectedMemberId ? "pointer" : "not-allowed"
                    }}
                >
                    Transfer & Leave
                </button>
            </div>
        </div>
    );
};

export default TransferOwnershipModal;
