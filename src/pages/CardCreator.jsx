import React, { useState, useEffect } from 'react';
import { generateCard } from '../utils/bingoLogic';
import BingoCard from '../components/BingoCard';
import { Plus, Save, Play, Trash2, Moon, Sun, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CardCreator = () => {
    const [savedCards, setSavedCards] = useState([]);
    const [currentGrid, setCurrentGrid] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('bingo-theme') || 'dark');
    const [language, setLanguage] = useState(localStorage.getItem('bingo-lang') || 'en-US');
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('bingo-cards');
        if (stored) setSavedCards(JSON.parse(stored));
        setCurrentGrid(generateCard());

        // Apply theme
        document.body.className = theme === 'light' ? 'light-theme' : '';
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('bingo-theme', newTheme);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('bingo-lang', lang);
    };

    const handleGenerate = () => {
        setCurrentGrid(generateCard());
    };

    const handleSave = () => {
        const newCards = [...savedCards, currentGrid];
        setSavedCards(newCards);
        localStorage.setItem('bingo-cards', JSON.stringify(newCards));
        handleGenerate();
    };

    const handleDelete = (index) => {
        const newCards = savedCards.filter((_, i) => i !== index);
        setSavedCards(newCards);
        localStorage.setItem('bingo-cards', JSON.stringify(newCards));
    };

    const startPlaying = () => {
        if (savedCards.length > 0) {
            navigate('/play');
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>EasyBingo</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create and save your Bingo cards</p>

                <div className="glass" style={{ display: 'inline-flex', padding: '0.5rem', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Globe size={18} color="var(--text-muted)" />
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{ background: 'transparent', color: 'var(--text)', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <option value="en-US">English</option>
                            <option value="fr-FR">Français</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="creator-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <section className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Generate New Card</h2>
                    {currentGrid && <BingoCard grid={currentGrid} />}
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={handleGenerate}>
                            <Plus size={20} style={{ marginRight: '0.5rem' }} /> New
                        </button>
                        <button className="btn-primary" onClick={handleSave}>
                            <Save size={20} style={{ marginRight: '0.5rem' }} /> Save Card
                        </button>
                    </div>
                </section>

                <section className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Saved Cards ({savedCards.length})</h2>
                        {savedCards.length > 0 && (
                            <button className="btn-primary" onClick={startPlaying}>
                                <Play size={20} style={{ marginRight: '0.5rem' }} /> Play Now
                            </button>
                        )}
                    </div>

                    <div className="cards-scroller" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', maxHeight: '500px', overflowY: 'auto', padding: '0.5rem' }}>
                        {savedCards.map((card, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                                <BingoCard grid={card} />
                                <button
                                    onClick={() => handleDelete(idx)}
                                    style={{
                                        position: 'absolute',
                                        top: '-0.5rem',
                                        right: '-0.5rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {savedCards.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', width: '100%', padding: '2rem' }}>
                                No cards saved yet. Generate one to start!
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CardCreator;
