import "./ServerSidebar.css";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import socket from "../../socket/socket";
import UserPanel from "./UserPanel";
import { useRef } from "react";
import { uploadServerIcon } from "../../services/serverService";
function ServerSidebar({
    servers,
    selectedServer,
    onSelectServer,
    onCreateServer,
}) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        socket.disconnect();

        logoutUser();

        localStorage.removeItem("user");

        navigate("/login");
    };
    const handleServerIconChange = async (event) => {
        const file = event.target.files[0];

        if (!file || !selectedServer) return;

        try {
            const data = await uploadServerIcon(
                selectedServer._id,
                file
            );

            onSelectServer(data.server);

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to upload server icon"
            );
        }
    };
    return (
        <aside className="server-sidebar">
            <div className="server-logo">
                <img
                    src="/logos/nexus-logo.png"
                    alt="Nexus"
                />
            </div>

            <div className="server-list">
                {servers.map((server) => (

                    <button
                        key={server._id}
                        className={`server-button
    ${selectedServer?._id === server._id ? "active" : ""}
    ${currentUser?._id === server.owner ? "owner" : ""}
`}
                        onClick={() => {
                            onSelectServer(server);

                            const isOwner =
                                currentUser?._id === server.owner;

                            if (
                                isOwner &&
                                selectedServer?._id === server._id
                            ) {
                                fileInputRef.current.click();
                            }
                        }}
                        title={server.name}
                    >
                        {server.icon ? (
                            <img
                                src={`http://localhost:5000${server.icon}`}
                                alt={server.name}
                                className="server-icon-image"
                            />
                        ) : (
                            server.name.charAt(0).toUpperCase()
                        )}
                    </button>
                ))}
                <button
                    className="server-button add-server"
                    onClick={onCreateServer}
                    title="Create Server"
                >
                    +
                </button>
            </div>

            <div className="server-bottom">
                <UserPanel />

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: "none" }}
                onChange={handleServerIconChange}
            />
        </aside>
    );
}

export default ServerSidebar;