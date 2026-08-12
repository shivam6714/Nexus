import { useRef } from "react";
import { uploadAvatar } from "../../services/profileService";
import "./UserPanel.css";
function UserPanel() {
    const user = JSON.parse(localStorage.getItem("user"));
    const fileInputRef = useRef(null);
    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        try {
            const data = await uploadAvatar(file);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.reload();
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Avatar upload failed"
            );
        }
    };
    return (
        <div className="user-panel">
            <div className="user-info">
                <div
                    className="user-avatar"
                    onClick={() => fileInputRef.current.click()}
                >
                    {user?.avatar ? (
                        <img
                            src={`${import.meta.env.VITE_API_URL}${user.avatar}`}
                            alt="Avatar"
                        />

                    ) : (
                        user?.username?.charAt(0).toUpperCase()
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                />
                <div className="user-details">
                    <span>{user?.username}</span>
                </div>
            </div>
        </div>
    );
}

export default UserPanel;