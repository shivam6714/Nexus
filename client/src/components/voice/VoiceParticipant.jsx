import { useEffect, useRef } from "react";
import { MicOff } from "lucide-react";

function VoiceParticipant({ participant, stream }) {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current && stream) {
            if (audioRef.current.srcObject !== stream) {
                audioRef.current.srcObject = stream;
            }
        }
    }, [stream]);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#b5bac1", padding: "4px 0", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                {participant.avatar ? (
                    <img src={participant.avatar} alt="avatar" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px", flexShrink: 0 }}>
                        {participant.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{participant.username}</span>
            </div>
            
            {participant.isMuted && <MicOff size={14} color="#da373c" />}
            
            {stream && (
                <audio 
                    ref={audioRef} 
                    autoPlay 
                    playsInline 
                    style={{ display: "none" }} 
                />
            )}
        </div>
    );
}

export default VoiceParticipant;
