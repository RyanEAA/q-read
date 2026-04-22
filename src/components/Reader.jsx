import { useEffect, useState } from "react";
import WordDisplay from "./WordDisplay";
import Controls from "./Controls";
import { splitWords, getDelay } from "../utils/textParser";

export default function Reader({ text, onReset, chromeVisible, setChromeVisible }) {
  const words = splitWords(text);

  const [index, setIndex] = useState(0);
  const [wpm, setWpm] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const baseDelay = 60000 / wpm;
    const word = words[index] || "";

    const timeout = setTimeout(() => {
      setIndex((prev) => {
        if (prev + 1 >= words.length) {
            setIsPlaying(false); // stop playback
            return prev;         // stay on last word
        }
        return prev + 1;
        });
    }, getDelay(word, baseDelay));

    return () => clearTimeout(timeout);
  }, [index, isPlaying, wpm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setIsPlaying(false);
        setIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setIsPlaying(false);
        setIndex((prev) => Math.min(prev + 1, words.length - 1));
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setWpm((prev) => Math.min(prev + 25, 800));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setWpm((prev) => Math.max(prev - 25, 100));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [words.length]);

  const progress = ((index + 1) / words.length) * 100;

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clicked = e.clientX - rect.left;
    const percentage = clicked / rect.width;
    const newIndex = Math.floor(percentage * words.length);
    setIndex(Math.max(0, Math.min(newIndex, words.length - 1)));
    setIsPlaying(false);
  };

  const [isEditingWord, setIsEditingWord] = useState(false);
  const [wordInputValue, setWordInputValue] = useState(String(index + 1));

  useEffect(() => {
    setChromeVisible(index < 5);
  }, [index]);

  const handleCursorMove = () => {
    setChromeVisible(true);
  };

  const handleWordInputChange = (e) => {
    setWordInputValue(e.target.value);
  };

  const handleWordInputBlur = () => {
    const value = wordInputValue.trim();
    if (value === "") {
      setWordInputValue(String(index + 1));
      setIsEditingWord(false);
      return;
    }
    
    let wordNum = parseInt(value, 10);
    wordNum = Math.max(1, Math.min(wordNum, words.length));
    setIndex(wordNum - 1);
    setWordInputValue(String(wordNum));
    setIsEditingWord(false);
  };

  const handleWordInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleWordInputBlur();
    } else if (e.key === "Escape") {
      setWordInputValue(String(index + 1));
      setIsEditingWord(false);
    }
  };

  return (
    <div className="reader-screen" onMouseMove={handleCursorMove} onMouseEnter={handleCursorMove}>
      <button className="back-button" onClick={onReset}>
        ← Back
      </button>
      <WordDisplay word={words[index]} />
      
      <div className={`progress-container ${chromeVisible ? "" : "is-faded"}`.trim()}>
        <div className="progress-bar" onClick={handleProgressClick}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        {isEditingWord ? (
          <input
            type="number"
            min="1"
            max={words.length}
            value={wordInputValue}
            onChange={handleWordInputChange}
            onBlur={handleWordInputBlur}
            onKeyDown={handleWordInputKeyDown}
            className="progress-text-input"
            autoFocus
          />
        ) : (
          <span className="progress-text" onClick={() => setIsEditingWord(true)}>
            {index + 1} / {words.length}
          </span>
        )}
      </div>

      <Controls
        className={chromeVisible ? "" : "is-faded"}
        wpm={wpm}
        setWpm={setWpm}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setIndex={setIndex}
      />

      <footer className={`controls-help ${chromeVisible ? "" : "is-faded"}`.trim()}>
        <span><strong>Space</strong> play / pause</span>
        <span><strong>← / →</strong> move word by word</span>
        <span><strong>↑ / ↓</strong> change speed</span>
        <span><strong>Progress text</strong> jump to a word</span>
      </footer>
    </div>
  );
}