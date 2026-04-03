function MediaRenderer({ src, alt = "NFT Media" }) {
    if (!src) return null;

    const url = src.toLowerCase().split("?")[0]; // ignore query params

    const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
    const isAudio = url.endsWith(".mp3") || url.endsWith(".wav") || url.endsWith(".ogg");

    if (isVideo) {
        return (
            <video
                className="media-renderer"
                src={src}
                controls
                loop
                playsInline
            />
        );
    }

    if (isAudio) {
        return (
            <div className="media-renderer media-audio">
                <div className="audio-placeholder">♪</div>
                <audio src={src} controls />
            </div>
        );
    }

    // Default: image
    return (
        <img
            className="media-renderer"
            src={src}
            alt={alt}
        />
    );
}

export default MediaRenderer;