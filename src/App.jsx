import { useState } from "react";
import Reader from "./components/Reader";

export default function App() {
  const [text, setText] = useState("");

  return (
    <div>
      {!text ? (
        <div style={styles.upload}>
          <textarea
            placeholder="Paste your text here..."
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
          />
        </div>
      ) : (
        <Reader text={text} />
      )}
    </div>
  );
}

const styles = {
  upload: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111",
  },
  textarea: {
    width: "60%",
    height: "200px",
    fontSize: "18px",
    padding: "10px",
  },
};