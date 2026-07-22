function ServerSidebar({ servers, selectedServer, onSelectServer }) {
    return (
        <div>
            <h2>Your Servers</h2>

            {servers.map((server) => (
                <button
                    key={server._id}
                    onClick={() => onSelectServer(server)}
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        fontWeight:
                            selectedServer?._id === server._id
                                ? "bold"
                                : "normal",
                    }}
                >
                    {server.name}
                </button>
            ))}
        </div>
    );
}

export default ServerSidebar;