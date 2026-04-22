import { useState } from "react";
import Reader from "./components/Reader";
import { parseFile } from "./utils/fileParser";

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

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
    setChromeVisible(true);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className={`app-brand ${chromeVisible ? "" : "is-faded"}`.trim()}>
          Q Read
        </div>
      </header>

      {!text ? (
        <main className="upload">
          <section className="upload-card">
            <div className="upload-copy">
              <h1>Paste or upload your text</h1>
              <p>
                Q Read keeps one word centered at a time, with keyboard shortcuts
                for fast navigation.
              </p>
            </div>

            <textarea
              className="textarea"
              placeholder="Paste your text here..."
              onChange={(e) => setText(e.target.value)}
            />

            <div className="upload-actions">
              <p className="upload-label">Or upload a file</p>

              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="file-input"
              />

              {loading && <p className="upload-status">Processing file...</p>}
            </div>
          </section>
        </main>
      ) : (
        <Reader
          text={text}
          onReset={handleReset}
          chromeVisible={chromeVisible}
          setChromeVisible={setChromeVisible}
        />
      )}
    </div>
  );
}