import "./ChannelSidebar.css";
import { useNavigate } from "react-router-dom";

function DMSidebar({
    conversations,
    selectedConversationId,
    onlineUsers = [],
}) {
    const navigate = useNavigate();

    return (
        <aside className="channel-sidebar">
            <div className="channel-header">
                <h3>Direct Messages</h3>
            </div>

            <div className="channel-list">
                {conversations.length === 0 ? (
                    <div style={{ padding: "16px", color: "#949ba4", fontSize: "14px", textAlign: "center" }}>
                        No conversations yet.
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isOnline = onlineUsers.includes(conv.otherParticipant?._id);
                        return (
                            <button
                                key={conv.conversationId}
                                className={`channel-button ${selectedConversationId === conv.conversationId ? "active" : ""}`}
                                onClick={() => navigate(`/chat/dm/${conv.conversationId}`, { state: { dmUser: conv.otherParticipant } })}
                                style={{ padding: '8px 10px', height: 'auto', gap: '12px' }}
                            >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <img
                                        src={conv.otherParticipant?.avatar ? `${import.meta.env.VITE_API_URL}${conv.otherParticipant.avatar}` : `https://ui-avatars.com/api/?name=${conv.otherParticipant?.username || "User"}&background=random`}
                                        alt={conv.otherParticipant?.username || "User"}
                                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: isOnline ? 'var(--status-online)' : 'var(--status-idle)',
                                        border: '2px solid var(--bg-secondary)'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
                                    <span style={{ fontWeight: '600', color: selectedConversationId === conv.conversationId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {conv.otherParticipant?.username || "User"}
                                    </span>
                                {conv.lastMessagePreview && (
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left', marginTop: '2px' }}>
                                        {conv.lastMessagePreview}
                                    </span>
                                )}
                            </div>
                            {conv.unreadCount > 0 && (
                                <div style={{
                                    backgroundColor: 'var(--status-danger)',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    padding: '2px 6px',
                                    minWidth: '16px',
                                    textAlign: 'center',
                                    flexShrink: 0
                                }}>
                                    {conv.unreadCount}
                                </div>
                            )}
                        </button>
                    );
                })
                )}
            </div>
        </aside>
    );
}

export default DMSidebar;
