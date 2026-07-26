import "./MembersSidebar.css";
function MembersSidebar({ members }) {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    console.log("Current User:", currentUser);

    members.forEach((member) => {
        console.log(
            "Comparing:",
            member._id,
            "===",
            currentUser?._id,
            member._id === currentUser?._id
        );
    });

    const onlineMembers = members.filter(
        (member) => member._id === currentUser?._id
    );

    const offlineMembers = members.filter(
        (member) => member._id !== currentUser?._id
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