import "./ServerOptions.css";

const ServerOptions = ({ onCreate, onJoin }) => {
  return (
    <div className="server-options">
      <h2>Add a Server</h2>
      <p>Select how you'd like to continue.</p>

      <button
        className="server-option-btn primary"
        onClick={onCreate}
      >
        Create Server
      </button>

      <button
        className="server-option-btn secondary"
        onClick={onJoin}
      >
        Join Server
      </button>
    </div>
  );
};

export default ServerOptions;