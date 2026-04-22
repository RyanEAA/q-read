export default function Controls({ wpm, setWpm, isPlaying, setIsPlaying, setIndex }) {
  return (
    <div className="controls">
    <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Pause" : "Play"}
    </button>

    <button
        onClick={() => {
        setIsPlaying(false);
        setIndex(0);
        }}
    >
        Restart
    </button>

    <div className="slider-group">
        <span className="wpm-label">WPM: {wpm}</span>

        <input
        type="range"
        min="100"
        max="800"
        value={wpm}
        onChange={(e) => setWpm(Number(e.target.value))}
        />
    </div>
    </div>
  );
}
