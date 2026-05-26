import { useState } from "react";
import Reader from "./components/Reader";
import { parseFile } from "./utils/fileParser";
// import { speechSynthesis }

export default function App() {
  const [text, setText] = useState("");
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfWords, setPdfWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [chromeVisible, setChromeVisible] = useState(true);

  // 📄 Handle file upload (TXT + PDF)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingType(file.type === "application/pdf" ? "pdf" : "text");
      setLoading(true);
      const parsed = await parseFile(file);
      setText(parsed.text);
      setPdfDoc(parsed.pdfDoc);
      setPdfWords(parsed.pdfWords);
    } catch (err) {
      console.error(err);
      alert("Error reading file");
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  // change this to restart when a button is clicked, when the user wants to upload a new file
  // 🔁 Reset back to upload screen
  const handleReset = () => {
    setText("");
    setPdfDoc(null);
    setPdfWords([]);
    setChromeVisible(true);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className={`app-brand ${chromeVisible ? "" : "is-faded"}`.trim()}>
          Q Read
        </div>
      </header>

      {loading && loadingType === "pdf" ? (
        <main className="loading-screen" aria-busy="true" aria-live="polite">
          <section className="loading-card">
            <div className="loading-spinner" aria-hidden="true" />
            <p className="loading-kicker">Processing PDF</p>
            <h1>Preparing your document</h1>
            <p>
              Q Read is extracting words and page positions so it can render the
              PDF preview and highlight the current word.
            </p>
          </section>
        </main>
      ) : !text ? (
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
              onChange={(e) => {
                setText(e.target.value);
                setPdfDoc(null);
                setPdfWords([]);
              }}
            />

            <div className="upload-actions">
              <p className="upload-label">Or upload a file</p>

              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="file-input"
              />

              {loading && loadingType !== "pdf" && (
                <p className="upload-status">Processing file...</p>
              )}
            </div>
          </section>
        </main>
      ) : (
        <Reader
          text={text}
          pdfDoc={pdfDoc}
          pdfWords={pdfWords}
          onReset={handleReset}
          chromeVisible={chromeVisible}
          setChromeVisible={setChromeVisible}
        />
      )}
    </div>
  );
}