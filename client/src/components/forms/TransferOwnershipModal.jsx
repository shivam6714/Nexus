import React, { useState } from "react";
import { getImageUrl } from "../../utils/imageUrl";

const TransferOwnershipModal = ({ members, currentOwnerId, onTransfer, onClose }) => {
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    // Filter out the current owner
    const eligibleMembers = members.filter((m) => m._id !== currentOwnerId);

    return (
        <div className="modal-form">
            <p style={{ marginTop: "-8px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Select a member to transfer server ownership to. This action cannot be undone, and you will become a regular member.
            </p>

            <div 
                className="member-select-list" 
                style={{ 
                    marginTop: "20px", 
                    maxHeight: "300px", 
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    paddingRight: "8px"
                }}
            >
                {eligibleMembers.length === 0 ? (
                    <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
                        No other members in this server.
                    </div>
                ) : (
                    eligibleMembers.map((member) => (
                        <div 
                            key={member._id}
                            onClick={() => setSelectedMemberId(member._id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                background: selectedMemberId === member._id ? "var(--bg-modifier-selected)" : "var(--bg-secondary)",
                                border: `1px solid ${selectedMemberId === member._id ? "var(--primary-light)" : "transparent"}`,
                                transition: "all 0.2s ease"
                            }}
                        >
                            {member.avatar ? (
                                <img 
                                    src={getImageUrl(member.avatar)}
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
