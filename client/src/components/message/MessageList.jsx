import MessageBubble from "./MessageBubble";

function MessageList({ messages }) {
    return (
        <div className="message-list">
            {messages.map((message) => (
                <MessageBubble
                    key={message._id}
                    message={message}
                />
            ))}
        </div>
    );
}

export default MessageList;