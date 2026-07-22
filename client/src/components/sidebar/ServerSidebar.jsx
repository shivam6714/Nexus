import "./ServerSidebar.css";

function ServerSidebar({ servers, selectedServer, onSelectServer }) {
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
            </div>
        </aside>
    );
}

export default ServerSidebar;