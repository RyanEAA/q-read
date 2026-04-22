export default function WordDisplay({ word }) {
  if (!word) return null;

  const pivot =
    word.length <= 2
      ? 0
      : word.length <= 5
      ? 1
      : word.length <= 9
      ? 2
      : Math.floor(word.length / 2);

  return (
    <div style={styles.container}>
      <div style={styles.guides}>
        <div style={styles.horizontal}></div>
        <div style={styles.vertical}></div>
        <div style={styles.horizontal}></div>
      </div>

      <div style={styles.word}>
        {word.split("").map((char, i) => (
          <span
            key={i}
            style={{ color: i === pivot ? "#ff4d4d" : "white" }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}