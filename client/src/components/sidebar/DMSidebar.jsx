import "./ChannelSidebar.css";
import { useNavigate } from "react-router-dom";

function DMSidebar({
    conversations,
    selectedConversationId,
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
                    conversations.map((conv) => (
                        <button
                            key={conv.conversationId}
                            className={`channel-button ${selectedConversationId === conv.conversationId ? "active" : ""}`}
                            onClick={() => navigate(`/chat/dm/${conv.conversationId}`, { state: { dmUser: conv.otherParticipant } })}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', height: 'auto', padding: '8px' }}
                        >
                            <img
                                src={conv.otherParticipant?.avatar ? `http://localhost:5000${conv.otherParticipant.avatar}` : `https://ui-avatars.com/api/?name=${conv.otherParticipant?.username || "User"}&background=random`}
                                alt={conv.otherParticipant?.username || "User"}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                                <span style={{ fontWeight: '500', color: selectedConversationId === conv.conversationId ? '#fff' : '#8e9297' }}>
                                    {conv.otherParticipant?.username || "User"}
                                </span>
                                {conv.lastMessagePreview && (
                                    <span style={{ fontSize: '12px', color: '#8e9297', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', textAlign: 'left' }}>
                                        {conv.lastMessagePreview}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}

export default DMSidebar;
