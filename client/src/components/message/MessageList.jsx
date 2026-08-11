import MessageBubble from "./MessageBubble";

function MessageList({ messages, currentUserId, onEdit, onDelete, onReply, onReact, highlightedMessageId, onJumpToMessage, scrollRef, onScroll }) {
    return (
        <div className="message-list" ref={scrollRef} onScroll={onScroll}>
            {messages.map((message) => (
                <MessageBubble
                    key={message._id}
                    message={message}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReply={onReply}
                    onReact={onReact}
                    highlightedMessageId={highlightedMessageId}
                    onJumpToMessage={onJumpToMessage}
                />
            ))}
        </div>
    );
}

export default MessageList;