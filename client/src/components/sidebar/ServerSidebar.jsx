import "./ServerSidebar.css";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import socket from "../../socket/socket";

function ServerSidebar({
    servers,
    selectedServer,
    onSelectServer,
    onCreateServer,
}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        socket.disconnect();

        logoutUser();

        navigate("/login");
    };
    return (
        <aside className="server-sidebar">
            <div className="server-logo">N</div>

            <div className="server-list">
                {servers.map((server) => (

                    <button
                        key={server._id}
                        className={`server-button ${selectedServer?._id === server._id ? "active" : ""
                            }`}
                        onClick={() => {
                            console.log("Clicked:", server.name);
                            onSelectServer(server);
                        }}
                        title={server.name}
                    >
                        {server.name.charAt(0).toUpperCase()}
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

            <button
                className="logout-button"
                onClick={handleLogout}
            >
                Logout
            </button>

        </aside>
    );
}

export default ServerSidebar;