import { useState, useEffect } from "react";

const formatMessageTime = (createdAt) => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const isToday = 
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = 
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) {
        return `Today at ${timeString}`;
    } else if (isYesterday) {
        return `Yesterday at ${timeString}`;
    } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} at ${timeString}`;
    }
};

function MessageBubble({ message, currentUserId, onEdit, onDelete, onReply, onReact, highlightedMessageId, onJumpToMessage }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || "");
    const [showReactions, setShowReactions] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowImageModal(false);
            }
        };

        if (showImageModal) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showImageModal]);

    const isOwner =
        message.sender &&
        currentUserId &&
        (message.sender._id === currentUserId || message.sender === currentUserId);

    const handleSave = () => {
        const trimmedContent = editContent.trim();
        // Allow empty content if there is an attachment
        if ((trimmedContent || message.attachment) && trimmedContent !== message.content) {
            onEdit(message._id, trimmedContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(message.content || "");
        setIsEditing(false);
    };

    const handleImageClick = () => {
        if (message.attachment) {
            setShowImageModal(true);
        }
    };

    return (
        <div
            id={`message-${message._id}`}
            className="message-bubble"
            style={{
                position: "relative",
                backgroundColor: highlightedMessageId === message._id ? "rgba(42, 59, 237, 0.4)" : "#24262a",
                transition: "background-color 0.2s ease",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "10px",
                width: "100%",
                boxSizing: "border-box",
                wordBreak: "break-word"
            }}
            onMouseOver={(e) => {
                if (highlightedMessageId !== message._id) {
                    e.currentTarget.style.backgroundColor = "#2a2c30";
                }
            }}
            onMouseOut={(e) => {
                if (highlightedMessageId !== message._id) {
                    e.currentTarget.style.backgroundColor = "#24262a";
                }
            }}
        >
            {message.replyTo && message.replyTo.sender && (
                <div
                    onClick={() => onJumpToMessage && onJumpToMessage(message.replyTo._id)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#b9bbbe",
                        fontSize: "12px",
                        marginBottom: "4px",
                        gap: "6px",
                        cursor: "pointer",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        marginLeft: "-4px"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    title="Jump to original message"
                >
                    <div style={{ width: "20px", height: "1px", backgroundColor: "#4f545c", borderLeft: "2px solid #4f545c", borderTop: "2px solid #4f545c", borderRadius: "4px 0 0 0", marginTop: "10px" }} />
                    <div
                        style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            backgroundColor: "#5865f2",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "9px",
                            fontWeight: "bold",
                            flexShrink: 0,
                            overflow: "hidden"
                        }}
                    >
                        {message.replyTo.sender.avatar ? (
                            <img
                                src={`http://localhost:5000${message.replyTo.sender.avatar}`}
                                alt="avatar"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            message.replyTo.sender.username?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>
                    <strong>{message.replyTo.sender.username}</strong>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px", cursor: "pointer" }}>
                        {message.replyTo.content || "Attachment"}
                    </span>
                </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#5865f2",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            fontWeight: "bold",
                            flexShrink: 0,
                            overflow: "hidden"
                        }}
                    >
                        {message.sender.avatar ? (
                            <img
                                src={`http://localhost:5000${message.sender.avatar}`}
                                alt="avatar"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            message.sender.username?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <strong>{message.sender.username}</strong>
                        {formatMessageTime(message.createdAt) && (
                            <span style={{ fontSize: "11.5px", color: "#949ba4", fontWeight: "500" }}>
                                {formatMessageTime(message.createdAt)}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px", fontSize: "12px", position: "relative" }}>
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => setShowReactions(!showReactions)}
                                style={{ background: "none", border: "none", color: "#b9bbbe", cursor: "pointer", padding: 0 }}
                                title="Add reaction"
                            >
                                😊+
                            </button>
                            {showReactions && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    backgroundColor: "#2f3136",
                                    border: "1px solid #202225",
                                    borderRadius: "4px",
                                    padding: "4px",
                                    display: "flex",
                                    gap: "4px",
                                    zIndex: 10,
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                                }}>
                                    {["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                if (onReact) onReact(message._id, emoji);
                                                setShowReactions(false);
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                padding: "4px",
                                                borderRadius: "4px"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#40444b"}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => onReply(message)}
                                style={{ background: "none", border: "none", color: "#b9bbbe", cursor: "pointer", padding: 0 }}
                            >
                                Reply
                            </button>
                        </>
                    )}
                    {isOwner && !isEditing && (
                        <>
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
                        </>
                    )}
                </div>
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
                <div style={{ margin: "4px 0 0 0" }}>
                    {message.content && (
                        <p style={{ margin: 0, wordBreak: "break-word" }}>
                            {message.content}
                            {message.edited && (
                                <span style={{ fontSize: "11px", color: "#72767d", marginLeft: "6px" }}>(edited)</span>
                            )}
                        </p>
                    )}

                    {message.attachment && !imageError && (
                        <img
                            src={`http://localhost:5000${message.attachment}`}
                            alt="Attachment"
                            style={{
                                maxWidth: "400px",
                                maxHeight: "400px",
                                width: "auto",
                                height: "auto",
                                objectFit: "contain",
                                borderRadius: "8px",
                                display: "block",
                                marginTop: "8px",
                                cursor: "pointer"
                            }}
                            onClick={handleImageClick}
                            onError={() => setImageError(true)}
                        />
                    )}

                    {message.attachment && imageError && (
                        <div style={{ fontSize: "12px", color: "#f23f42", marginTop: message.content ? "8px" : "0" }}>
                            Image failed to load
                        </div>
                    )}

                    {message.reactions && message.reactions.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                            {message.reactions.map((reaction, index) => {
                                const hasReacted = currentUserId && reaction.users.some(u =>
                                    u === currentUserId ||
                                    (u._id && u._id === currentUserId) ||
                                    (u.toString() === currentUserId.toString())
                                );

                                return (
                                    <button
                                        key={index}
                                        onClick={() => onReact && onReact(message._id, reaction.emoji)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: hasReacted ? "rgba(88, 101, 242, 0.3)" : "#2f3136",
                                            border: `1px solid ${hasReacted ? "#5865F2" : "transparent"}`,
                                            borderRadius: "4px",
                                            padding: "2px 6px",
                                            cursor: "pointer",
                                            color: hasReacted ? "#ffffff" : "#dcddde",
                                            fontSize: "12px"
                                        }}
                                    >
                                        <span>{reaction.emoji}</span>
                                        <span style={{ fontWeight: "bold" }}>{reaction.users.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {showImageModal && message.attachment && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setShowImageModal(false)}
                >
                    <button
                        onClick={() => setShowImageModal(false)}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "transparent",
                            border: "none",
                            color: "white",
                            fontSize: "30px",
                            cursor: "pointer",
                            zIndex: 10000,
                        }}
                        title="Close"
                    >
                        &times;
                    </button>
                    <img
                        src={`http://localhost:5000${message.attachment}`}
                        alt="Attachment Fullscreen"
                        style={{
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            objectFit: "contain",
                            cursor: "default"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

export default MessageBubble;