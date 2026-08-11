import { SendHorizontal, Image as ImageIcon, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import api from "../../services/api";

function MessageInput({
    message,
    setMessage,
    handleSend,
    channel,
    placeholder,
    onAttachmentChange,
    attachment
}) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (attachment === null) {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setSelectedImage(null);
            setImagePreview(null);
            setUploadedImageUrl(null);
            setUploadError(null);
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [attachment]);

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset previous state
        setUploadError(null);
        
        // Validations
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setUploadError("Only JPEG, PNG, and WEBP images are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Image must be smaller than 5 MB.");
            return;
        }

        // Set preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedImage(file);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await api.post("/upload/image", formData);
            setUploadedImageUrl(response.data.imageUrl);
            if (onAttachmentChange) {
                onAttachmentChange(response.data.imageUrl);
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || "Failed to upload image");
            setUploadedImageUrl(null);
            if (onAttachmentChange) {
                onAttachmentChange(null);
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setSelectedImage(null);
        setImagePreview(null);
        setUploadedImageUrl(null);
        setUploadError(null);
        setIsUploading(false);
        if (onAttachmentChange) {
            onAttachmentChange(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="message-input-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px 16px' }}>
            {imagePreview && (
                <div className="image-preview-wrapper" style={{ position: 'relative', width: 'fit-content', background: '#2B2D31', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ position: 'relative' }}>
                        <img 
                            src={imagePreview} 
                            alt="Upload preview" 
                            style={{ maxHeight: '150px', borderRadius: '4px', opacity: isUploading ? 0.5 : 1, display: 'block' }} 
                        />
                        <button 
                            onClick={removeImage}
                            type="button"
                            style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#F23F42', color: 'white', borderRadius: '50%', padding: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove attachment"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {isUploading && (
                        <div style={{ color: '#949BA4', fontSize: '12px', textAlign: 'center' }}>
                            Uploading...
                        </div>
                    )}
                    {uploadError && (
                        <div style={{ color: '#F23F42', fontSize: '12px', maxWidth: '200px', wordWrap: 'break-word' }}>
                            {uploadError}
                        </div>
                    )}
                </div>
            )}
            <div className="message-input" style={{ margin: 0 }}>
                <button
                    className="attachment-button"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#B5BAC1', padding: '0 8px', display: 'flex', alignItems: 'center' }}
                >
                    <ImageIcon size={20} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                />
                <textarea
                    placeholder={placeholder || `Message #${channel?.name || "general"}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
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
        </div>
    );
}

export default MessageInput;