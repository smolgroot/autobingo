import { useState, useEffect, useCallback } from 'react';
import { formatAnnouncedNumber } from '../utils/bingoLogic';

const useSpeechScanner = (onNumberDetected, lang = 'en-US') => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let recognition = null;

        if (isListening) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setError("Speech Recognition not supported in this browser.");
                setIsListening(false);
                return;
            }

            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = lang;

            recognition.onstart = () => {
                console.log("Speech recognition started");
                setError(null);
            };

            recognition.onend = () => {
                console.log("Speech recognition ended");
                // If we should still be listening, restart (avoid loop if error)
                if (isListening && !error) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error("Failed to restart recognition", e);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    setError("Microphone access denied. Please enable it in browser settings.");
                    setIsListening(false);
                } else {
                    setError(event.error);
                }
            };

            recognition.onresult = (event) => {
                const last = event.results.length - 1;
                const text = event.results[last][0].transcript;
                const number = formatAnnouncedNumber(text);
                if (number) {
                    onNumberDetected(number);
                }
            };

            try {
                recognition.start();
            } catch (e) {
                console.error("Recognition start failed", e);
                setError("Failed to start microphone.");
                setIsListening(false);
            }
        }

        return () => {
            if (recognition) {
                recognition.onend = null; // Prevent restart on cleanup
                recognition.stop();
            }
        };
    }, [isListening, lang, onNumberDetected, error]);

    const toggleListening = () => {
        setIsListening(prev => !prev);
    };

    return { isListening, toggleListening, error };
};

export default useSpeechScanner;
