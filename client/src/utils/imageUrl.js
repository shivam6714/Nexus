export const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    
    return `${cleanBase}/${cleanPath}`;
};
