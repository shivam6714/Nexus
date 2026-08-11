import MessageBubble from "./MessageBubble";

function MessageList({ messages, currentUserId, onEdit, onDelete, onReply, onReact }) {
    return (
        <div className="message-list">
            {messages.map((message) => (
                <MessageBubble
                    key={message._id}
                    message={message}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReply={onReply}
                    onReact={onReact}
                />
            ))}
        </div>
    );
}

export default MessageList;