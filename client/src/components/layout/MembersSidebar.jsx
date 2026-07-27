import "./MembersSidebar.css";

function MembersSidebar({
    members,
    onlineUsers,
}) {
    const onlineMembers = members.filter((member) =>
        onlineUsers.includes(member._id)
    );

    const offlineMembers = members.filter(
        (member) => !onlineUsers.includes(member._id)
    );

    return (
        <div className="members-sidebar">
            <h3>Members</h3>

            <div className="member-section">
                <h4>ONLINE — {onlineMembers.length}</h4>

                {onlineMembers.map((member) => (
                    <div
                        key={member._id}
                        className="member-item"
                    >
                        🟢 {member.username}
                    </div>
                ))}
            </div>

            <div className="member-section">
                <h4>OFFLINE — {offlineMembers.length}</h4>

                {offlineMembers.map((member) => (
                    <div
                        key={member._id}
                        className="member-item"
                    >
                        🔴 {member.username}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MembersSidebar;