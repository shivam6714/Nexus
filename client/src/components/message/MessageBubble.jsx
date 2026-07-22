function MessageBubble({ message }) {
    return (
        <div className="message-bubble">
            <strong>{message.sender.username}</strong>

            <p>{message.content}</p>
        </div>
    );
}

export default MessageBubble;