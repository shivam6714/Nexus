import "./ServerOptions.css";

function ServerOptions({ onCreateServer, onJoinServer }) {
    return (
        <div className="server-options">
            <h2>Server</h2>

            <button
                className="server-option-button"
                onClick={onCreateServer}
            >
                ➕ Create Server
            </button>

            <button
                className="server-option-button"
                onClick={onJoinServer}
            >
                🔗 Join Server
            </button>
        </div>
    );
}

export default ServerOptions;