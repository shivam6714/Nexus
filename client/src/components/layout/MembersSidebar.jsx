import "./MembersSidebar.css";

function MembersSidebar({
    members,
    onlineUsers,
    onStartDM,
    selectedMemberId,
}) {
    const onlineMembers = members.filter((member) =>
        onlineUsers.includes(member._id)
    );

    const offlineMembers = members.filter(
        (member) => !onlineUsers.includes(member._id)
    );

    return (
        <div className="members-sidebar">
            <div className="member-section">
                <div className="member-section-title">ONLINE — {onlineMembers.length}</div>
                {onlineMembers.map((member) => (
                    <div
                        key={member._id}
                        className={`member-item ${member._id === selectedMemberId ? 'active' : ''}`}
                        onClick={() => onStartDM(member)}
                    >
                        <div className="member-avatar-wrapper">
                            <img 
                                src={member.avatar ? `${import.meta.env.VITE_API_URL}${member.avatar}` : `https://ui-avatars.com/api/?name=${member.username}&background=random`} 
                                alt={member.username}
                                className="member-avatar"
                            />
                            <div className="member-status online"></div>
                        </div>
                        <span>{member.username}</span>
                    </div>
                ))}
            </div>

            <div className="member-section">
                <div className="member-section-title">OFFLINE — {offlineMembers.length}</div>
                {offlineMembers.map((member) => (
                    <div
                        key={member._id}
                        className={`member-item ${member._id === selectedMemberId ? 'active' : ''}`}
                        onClick={() => onStartDM(member)}
                    >
                        <div className="member-avatar-wrapper">
                            <img 
                                src={member.avatar ? `${import.meta.env.VITE_API_URL}${member.avatar}` : `https://ui-avatars.com/api/?name=${member.username}&background=random`} 
                                alt={member.username}
                                className="member-avatar"
                            />
                            <div className="member-status offline"></div>
                        </div>
                        <span>{member.username}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MembersSidebar;