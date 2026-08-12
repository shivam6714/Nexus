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
                backgroundColor: highlightedMessageId === message._id ? "var(--bg-modifier-selected)" : "transparent",
                transition: "background-color 0.1s ease",
                padding: "2px 48px 2px 72px", /* Left padding accommodates avatar */
                marginTop: "16px", /* Space out messages */
                width: "100%",
                boxSizing: "border-box",
                wordBreak: "break-word"
            }}
            onMouseOver={(e) => {
                if (highlightedMessageId !== message._id) {
                    e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)";
                }
            }}
            onMouseOut={(e) => {
                if (highlightedMessageId !== message._id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                }
            }}
        >
            {message.replyTo && message.replyTo.sender && (
                <div
                    onClick={() => onJumpToMessage && onJumpToMessage(message.replyTo._id)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "var(--text-muted)",
                        fontSize: "12px",
                        marginBottom: "4px",
                        gap: "6px",
                        cursor: "pointer",
                        padding: "2px 4px",
                        borderRadius: "var(--radius-xs)",
                        marginLeft: "-4px"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    title="Jump to original message"
                >
                    <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border-subtle)", borderLeft: "2px solid var(--border-subtle)", borderTop: "2px solid var(--border-subtle)", borderRadius: "4px 0 0 0", marginTop: "10px" }} />
                    <div
                        style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            backgroundColor: "var(--brand-primary)",
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
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px", cursor: "pointer", color: "var(--text-secondary)" }}>
                        {message.replyTo.content || "Attachment"}
                    </span>
                </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div
                        style={{
                            position: "absolute",
                            left: "16px",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "var(--brand-primary)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            fontWeight: "bold",
                            flexShrink: 0,
                            overflow: "hidden",
                            marginTop: "2px",
                            cursor: "pointer"
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", lineHeight: "1.375rem" }}>
                            <strong style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: "500", cursor: "pointer" }}>{message.sender.username}</strong>
                            {formatMessageTime(message.createdAt) && (
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "400" }}>
                                    {formatMessageTime(message.createdAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px", fontSize: "12px", position: "relative" }}>
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => setShowReactions(!showReactions)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "var(--radius-xs)" }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                title="Add reaction"
                            >
                                😊+
                            </button>
                            {showReactions && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    backgroundColor: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "var(--radius-sm)",
                                    padding: "4px",
                                    display: "flex",
                                    gap: "4px",
                                    zIndex: 10,
                                    boxShadow: "var(--shadow-md)"
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
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => onReply(message)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "var(--radius-xs)" }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                Reply
                            </button>
                        </>
                    )}
                    {isOwner && !isEditing && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "var(--radius-xs)" }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(message._id)}
                                style={{ background: "none", border: "none", color: "var(--status-danger)", cursor: "pointer", padding: "4px", borderRadius: "var(--radius-xs)" }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(218, 55, 60, 0.1)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div style={{ paddingLeft: "56px", marginTop: "4px" }}>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            border: "none",
                            backgroundColor: "var(--bg-tertiary)",
                            color: "var(--text-primary)",
                            resize: "vertical",
                            minHeight: "44px",
                            fontFamily: "inherit",
                            fontSize: "15px",
                            lineHeight: "1.5",
                            outline: "none"
                        }}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
                        <button
                            onClick={handleSave}
                            style={{ background: "var(--brand-primary)", color: "white", border: "none", padding: "4px 12px", borderRadius: "3px", cursor: "pointer" }}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{ background: "transparent", color: "var(--text-muted)", border: "none", padding: "4px 12px", cursor: "pointer", textDecoration: "underline" }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ margin: "2px 0 0 0" }}>
                    {message.content && (
                        <p style={{ margin: 0, wordBreak: "break-word", color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.5" }}>
                            {message.content}
                            {message.edited && (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>(edited)</span>
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
                        <div style={{ fontSize: "12px", color: "var(--status-danger)", marginTop: message.content ? "8px" : "0" }}>
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
                                            background: hasReacted ? "rgba(88, 101, 242, 0.15)" : "var(--bg-tertiary)",
                                            border: `1px solid ${hasReacted ? "var(--brand-primary)" : "transparent"}`,
                                            borderRadius: "var(--radius-sm)",
                                            padding: "2px 6px",
                                            cursor: "pointer",
                                            color: hasReacted ? "var(--text-primary)" : "var(--text-secondary)",
                                            fontSize: "12px",
                                            transition: "all 0.1s ease"
                                        }}
                                        onMouseOver={(e) => {
                                            if (!hasReacted) {
                                                e.currentTarget.style.border = "1px solid var(--border-subtle)";
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!hasReacted) {
                                                e.currentTarget.style.border = "1px solid transparent";
                                            }
                                        }}
                                    >
                                        <span>{reaction.emoji}</span>
                                        <span style={{ fontWeight: "600" }}>{reaction.users.length}</span>
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