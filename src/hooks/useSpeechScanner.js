import { useState, useEffect, useCallback } from 'react';
import { formatAnnouncedNumber } from '../utils/bingoLogic';

const useSpeechScanner = (onNumberDetected, lang = 'en-US') => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = lang; // Can be changed based on locale

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            if (isListening) recognition.start(); // Keep listening
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            const number = formatAnnouncedNumber(text);
            if (number) {
                onNumberDetected(number);
            }
        };

        recognition.start();

        return recognition;
    }, [isListening, onNumberDetected]);

    const toggleListening = () => {
        setIsListening(prev => !prev);
    };

    return { isListening, toggleListening, error };
};

export default useSpeechScanner;
