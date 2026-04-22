import { useState } from "react";
import Reader from "./components/Reader";
import { parseFile } from "./utils/fileParser";

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // 📄 Handle file upload (TXT + PDF)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const extractedText = await parseFile(file);
      setText(extractedText);
    } catch (err) {
      console.error(err);
      alert("Error reading file");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Reset back to upload screen
  const handleReset = () => {
    setText("");
  };

  return (
    <div>
      {!text ? (
        <div className="upload">
          <div>
            {/* ✏️ Paste text */}
            <textarea
              className="textarea"
              placeholder="Paste your text here..."
              onChange={(e) => setText(e.target.value)}
            />

            {/* 📂 Upload file */}
            <div style={{ marginTop: "20px", color: "white" }}>
              <p>Or upload a file:</p>

              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
              />

              {loading && <p>Processing file...</p>}
            </div>
          </div>
        </div>
      ) : (
        <Reader text={text} onReset={handleReset} />
      )}
    </div>
  );
}