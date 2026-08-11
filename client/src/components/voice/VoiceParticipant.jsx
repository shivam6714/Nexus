import { useEffect, useRef, useState } from "react";
import { MicOff } from "lucide-react";

function VoiceParticipant({ participant, stream, isLocal }) {
    const audioRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (audioRef.current && stream && !isLocal) {
            if (audioRef.current.srcObject !== stream) {
                audioRef.current.srcObject = stream;
            }
        }
    }, [stream, isLocal]);

    useEffect(() => {
        if (!stream) {
            setIsSpeaking(false);
            return;
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        
        let source;
        try {
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
        } catch (err) {
            console.error("Error creating audio source:", err);
            return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationFrameId;

        const checkSpeaking = () => {
            analyser.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            
            // Threshold for speaking detection (adjustable)
            const speaking = average > 10;
            
            setIsSpeaking(speaking && !participant.isMuted);

            animationFrameId = requestAnimationFrame(checkSpeaking);
        };

        checkSpeaking();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            try {
                if (source) source.disconnect();
                audioContext.close();
            } catch (err) {
                console.error("Cleanup error:", err);
            }
        };
    }, [stream, participant.isMuted]);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#b5bac1", padding: "4px 0", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                {participant.avatar ? (
                    <img 
                        src={participant.avatar} 
                        alt="avatar" 
                        style={{ 
                            width: "24px", 
                            height: "24px", 
                            borderRadius: "50%", 
                            objectFit: "cover",
                            border: isSpeaking ? "2px solid #23a559" : "2px solid transparent",
                            transition: "border-color 0.15s ease"
                        }} 
                    />
                ) : (
                    <div style={{ 
                        width: "24px", 
                        height: "24px", 
                        borderRadius: "50%", 
                        backgroundColor: "#5865F2", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: "white", 
                        fontSize: "10px", 
                        flexShrink: 0,
                        border: isSpeaking ? "2px solid #23a559" : "2px solid transparent",
                        transition: "border-color 0.15s ease"
                    }}>
                        {participant.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{participant.username}</span>
            </div>
            
            {participant.isMuted && <MicOff size={14} color="#da373c" />}
            
            {!isLocal && stream && (
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
