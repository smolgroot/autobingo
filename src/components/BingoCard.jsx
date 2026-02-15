import React from 'react';

const BingoCard = ({ grid, markedNumbers = [], onCellClick }) => {
    return (
        <div className="glass bingo-card-container" style={{ padding: '1rem', width: 'fit-content' }}>
            <div className="grid-bingo">
                {grid.map((row, rowIndex) => (
                    row.map((cell, colIndex) => {
                        const isMarked = cell && markedNumbers.includes(cell);
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`cell ${!cell ? 'empty' : ''} ${isMarked ? 'marked' : ''}`}
                                onClick={() => cell && onCellClick && onCellClick(cell)}
                            >
                                {cell || ''}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
};

export default BingoCard;
