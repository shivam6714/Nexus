function MessageInput({
    message,
    setMessage,
    handleSend,
}) {
    return (
        <div className="message-input">
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={handleSend}>
                Send
            </button>
        </div>
    );
}

export default MessageInput;