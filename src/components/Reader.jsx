import { useEffect, useState } from "react";
import WordDisplay from "./WordDisplay";
import Controls from "./Controls";
import { splitWords, getDelay } from "../utils/textParser";

export default function Reader({ text, onReset }) {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <button className="back-button" onClick={onReset}>
        ← Back
      </button>
      <WordDisplay word={words[index]} />
      <Controls
        wpm={wpm}
        setWpm={setWpm}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setIndex={setIndex}
      />
    </div>
  );
}