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
    <div className="reader-container">
      <div className="guides">
        <div className="horizontal"></div>
        <div className="vertical"></div>
        <div className="horizontal"></div>
      </div>

      <div className="word">
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