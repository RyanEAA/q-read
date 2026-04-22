export default function Controls({ wpm, setWpm, isPlaying, setIsPlaying, setIndex }) {
  return (
    <div style={styles.container}>
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

      <div>
        <label>WPM: {wpm}</label>
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
