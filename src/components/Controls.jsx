import { useSpeech } from "react-text-to-speech";
import { useEffect, useState, useMemo } from "react";

export default function Controls({ className = "", words, index, wpm, setWpm, isPlaying, setIsPlaying, setIndex }) {

    const word = words[index];

    const speechOptions = useMemo(() => ({
        text: word,
        lang: "en-US",
        rate: 2,
        pitch: 1,
    }), [word, wpm]);

    const { speechStatus, start, pause, stop } = useSpeech(speechOptions);
    const [toggledTTS, setToggledTTS] = useState(false);

    console.log({
        toggledTTS,
        isPlaying,
        word,
        speechStatus
    });

    // when the word changes, we want to trigger the TTS to speak the current word
    useEffect(() => {
        if (!toggledTTS || !isPlaying) {
            console.log("TTS is toggled off or not playing, stopping speech");
            stop(); // stop any ongoing speech if TTS is toggled off or if not playing
            return;
        }

        start() // start speaking the new word
        console.log(`Speaking: ${word}`);

    }, [word]);

    return (
        <div className={`controls ${className}`.trim()}>
            {
                <button onClick={() => {
                    setIsPlaying(prev => !prev);
                    if (toggledTTS && !isPlaying) {
                        start();
                    } else {
                        pause();
                    }
                }}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
            }

            <button
                onClick={() => {
                    stop();// stop any ongoing speech when restarting
                    setIsPlaying(false);
                    setIndex(0);
                }}
            >
                Restart
            </button>

            {/* <select>
                {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                        {voice.name}
                    </option>
                ))}
            </select> */}

            <label className="switch">
                <input
                    type="checkbox"
                    onChange={() => { setToggledTTS(prev => !prev) }}
                />
                {(toggledTTS) ? "TTS On" : "TTS Off"}
                <span className="slider round"></span>
            </label>

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
        </div >
    );
}
