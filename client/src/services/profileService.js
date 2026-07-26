import api from "./api";

export const uploadAvatar = async (file) => {
    const formData = new FormData();

    formData.append("avatar", file);

    const response = await api.put(
        "/auth/profile/avatar",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};