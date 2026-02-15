import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Keyboard, ArrowLeft, Trophy } from 'lucide-react';
import BingoCard from '../components/BingoCard';
import useSpeechScanner from '../hooks/useSpeechScanner';
import { checkWinConditions } from '../utils/bingoLogic';

const GameSession = () => {
    const [cards, setCards] = useState([]);
    const [announcedNumbers, setAnnouncedNumbers] = useState([]);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [lastAnnounced, setLastAnnounced] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [lang] = useState(localStorage.getItem('bingo-lang') || 'en-US');
    const [theme] = useState(localStorage.getItem('bingo-theme') || 'dark');
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('bingo-cards');
        if (stored) {
            setCards(JSON.parse(stored));
        } else {
            navigate('/');
        }
        // Apply theme
        document.body.className = theme === 'light' ? 'light-theme' : '';
    }, [navigate, theme]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRemoving: true } : n));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 600); // animation duration
    }, []);

    const handleNumberDetected = useCallback((num) => {
        if (!announcedNumbers.includes(num)) {
            setAnnouncedNumbers(prev => [...prev, num]);
            setLastAnnounced(num);
            checkWins(num);
        }
    }, [announcedNumbers]);

    const { isListening, toggleListening, error } = useSpeechScanner(handleNumberDetected, lang);

    const checkWins = (newNum) => {
        const allAnnounced = [...announcedNumbers, newNum];
        const newWins = [];

        cards.forEach((card, cardIndex) => {
            const wins = checkWinConditions(card, allAnnounced);
            wins.forEach(win => {
                const message = `Card ${cardIndex + 1}: ${win.type}${win.row !== undefined ? ` (Row ${win.row + 1})` : ''}!`;
                // Check if message already exists in current notifications or history
                if (!notifications.some(n => n.text === message)) {
                    newWins.push(message);
                }
            });
        });

        if (newWins.length > 0) {
            const newNotifs = newWins.map(msg => ({
                id: Math.random().toString(36).substr(2, 9),
                text: msg,
                isRemoving: false
            }));

            setNotifications(prev => [...prev, ...newNotifs]);

            // Set timeout for each new notification
            newNotifs.forEach(notif => {
                setTimeout(() => {
                    removeNotification(notif.id);
                }, 20000); // 20 seconds
            });

            // Use Speech Synthesis to announce wins (match language)
            newWins.forEach(msg => {
                const utterance = new SpeechSynthesisUtterance(msg);
                utterance.lang = lang;
                window.speechSynthesis.speak(utterance);
            });
        }
    };

    const handleManualInput = (num) => {
        handleNumberDetected(num);
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} /> Back
                </button>
                <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
                    <h1 style={{ fontSize: '2rem' }}>EasyBingo Play</h1>
                    {lastAnnounced && <div style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>Last: {lastAnnounced}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn-secondary ${isListening ? 'active' : ''}`}
                        onClick={toggleListening}
                        style={{ borderColor: isListening ? 'var(--primary)' : 'var(--glass-border)' }}
                        title={`Mic language: ${lang}`}
                    >
                        {isListening ? <Mic size={20} color="var(--primary)" /> : <MicOff size={20} />}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowKeyboard(!showKeyboard)} title="Toggle Keyboard">
                        <Keyboard size={20} />
                    </button>
                </div>
            </header>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <div className="cards-scroller" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: '1rem' }}>
                <div className="cards-container">
                    {cards.map((card, idx) => (
                        <div key={idx} style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>Card {idx + 1}</h3>
                            <BingoCard
                                grid={card}
                                markedNumbers={announcedNumbers}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {showKeyboard && (
                <div className="glass keyboard-overlay" style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', padding: '1.5rem', width: '90%', maxWidth: '600px', zIndex: 100, boxShadow: '0 -10px 25px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--text)' }}>Manual Input</h3>
                        <button className="btn-secondary" onClick={() => setShowKeyboard(false)} style={{ padding: '0.25rem 0.75rem' }}>Close</button>
                    </div>
                    <div className="keyboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
                        {Array.from({ length: 90 }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => handleManualInput(num)}
                                className={`cell ${announcedNumbers.includes(num) ? 'marked' : ''}`}
                                style={{ fontSize: '0.9rem', padding: '8px' }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {notifications.length > 0 && (
                <div className="notification-container">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`glass notification-item ${notif.isRemoving ? 'removing' : ''}`}>
                            <Trophy size={20} /> {notif.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GameSession;
