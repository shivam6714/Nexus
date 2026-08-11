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
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', height: 'auto', padding: '8px' }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={conv.otherParticipant?.avatar ? `http://localhost:5000${conv.otherParticipant.avatar}` : `https://ui-avatars.com/api/?name=${conv.otherParticipant?.username || "User"}&background=random`}
                                        alt={conv.otherParticipant?.username || "User"}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                                    <span style={{ fontWeight: '500', color: selectedConversationId === conv.conversationId ? '#fff' : '#8e9297' }}>
                                        {isOnline ? "🟢 " : "🔴 "}
                                        {conv.otherParticipant?.username || "User"}
                                    </span>
                                {conv.lastMessagePreview && (
                                    <span style={{ fontSize: '12px', color: '#8e9297', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', textAlign: 'left' }}>
                                        {conv.lastMessagePreview}
                                    </span>
                                )}
                            </div>
                            {conv.unreadCount > 0 && (
                                <div style={{
                                    marginLeft: 'auto',
                                    backgroundColor: '#f23f42',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    padding: '2px 6px',
                                    minWidth: '16px',
                                    textAlign: 'center'
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
