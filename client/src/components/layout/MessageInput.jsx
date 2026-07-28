import { SendHorizontal } from "lucide-react";

function MessageInput({
    message,
    setMessage,
    handleSend,
    channel,
    placeholder
}) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="message-input">
            <textarea
                placeholder={placeholder || `Message #${channel?.name || "general"}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                rows={1}
            />

            <button
                className="send-button"
                onClick={handleSend}
                type="button"
            >
                <SendHorizontal size={20} />
            </button>
        </div>
    );
}

export default MessageInput;