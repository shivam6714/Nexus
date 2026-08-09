import { useState } from "react";

function MessageBubble({ message, currentUserId, onEdit, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const isOwner =
        message.sender &&
        currentUserId &&
        (message.sender._id === currentUserId || message.sender === currentUserId);

    const handleSave = () => {
        const trimmedContent = editContent.trim();
        if (trimmedContent && trimmedContent !== message.content) {
            onEdit(message._id, trimmedContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    return (
        <div className="message-bubble" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{message.sender.username}</strong>
                {isOwner && !isEditing && (
                    <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ background: "none", border: "none", color: "#b9bbbe", cursor: "pointer", padding: 0 }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(message._id)}
                            style={{ background: "none", border: "none", color: "#f23f42", cursor: "pointer", padding: 0 }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div style={{ marginTop: "8px" }}>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #202225",
                            backgroundColor: "#40444b",
                            color: "#dcddde",
                            resize: "vertical",
                            minHeight: "60px",
                            fontFamily: "inherit"
                        }}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
                        <button
                            onClick={handleSave}
                            style={{ background: "#5865F2", color: "white", border: "none", padding: "4px 12px", borderRadius: "3px", cursor: "pointer" }}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{ background: "transparent", color: "#b9bbbe", border: "none", padding: "4px 12px", cursor: "pointer", textDecoration: "underline" }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ margin: "4px 0 0 0", wordBreak: "break-word" }}>
                    {message.content}
                    {message.edited && (
                        <span style={{ fontSize: "11px", color: "#72767d", marginLeft: "6px" }}>(edited)</span>
                    )}
                </p>
            )}
        </div>
    );
}

export default MessageBubble;