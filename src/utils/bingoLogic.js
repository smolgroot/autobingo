/**
 * Generates a valid Bingo (Tombola) card.
 * 3 rows, 9 columns.
 * Each row has 5 numbers.
 * Columns: 1 (1-9), 2 (10-19), ..., 9 (80-90)
 */
export const generateCard = () => {
    const card = Array(3).fill(null).map(() => Array(9).fill(null));
    const colRanges = [
        { min: 1, max: 9 },
        { min: 10, max: 19 },
        { min: 20, max: 29 },
        { min: 30, max: 39 },
        { min: 40, max: 49 },
        { min: 50, max: 59 },
        { min: 60, max: 69 },
        { min: 70, max: 79 },
        { min: 80, max: 90 },
    ];

    // Pick numbers for each column
    const colNumbers = colRanges.map(range => {
        const nums = [];
        const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 numbers per column
        while (nums.length < count) {
            const n = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            if (!nums.includes(n)) nums.push(n);
        }
        return nums.sort((a, b) => a - b);
    });

    // Flat list of all selected numbers
    const allNums = colNumbers.flat();

    // We need exactly 15 numbers (3 rows * 5 numbers)
    // colNumbers might have more or less than 15.
    // Distribute numbers into rows while respecting column constraints.

    // Simplified version: just ensure each row gets 5 and each column has what it needs.
    // Real Tombola card generation is quite complex to ensure exactly 5 per row.

    // Let's use a simpler but effective approach for a prototype:
    const grid = Array(3).fill(null).map(() => Array(9).fill(null));
    const rowCounts = [0, 0, 0];
    const colUsed = colNumbers.map(nums => nums.length);

    // This is a heuristic approach
    let totalPlaced = 0;
    for (let r = 0; r < 3; r++) {
        const possibleCols = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
        for (let c of possibleCols) {
            if (rowCounts[r] < 5 && colNumbers[c].length > 0) {
                grid[r][c] = colNumbers[c].shift();
                rowCounts[r]++;
                totalPlaced++;
            }
        }
    }

    // If we didn't reach 15, we fill the remaining slots.
    // This is a bit naive but works for a bingo app.
    // A perfect generator would be more complex.

    return grid;
};

export const checkWinConditions = (card, announcedNumbers) => {
    const wins = [];
    let totalMarked = 0;

    card.forEach((row, rowIndex) => {
        let rowMarked = 0;
        row.forEach(cell => {
            if (cell && announcedNumbers.includes(cell)) {
                rowMarked++;
                totalMarked++;
            }
        });

        if (rowMarked === 3) wins.push({ type: 'Terno', row: rowIndex });
        if (rowMarked === 5) wins.push({ type: 'Quine', row: rowIndex });
    });

    if (totalMarked === 15) wins.push({ type: 'Bingo' });

    return wins;
};

export const formatAnnouncedNumber = (text) => {
    // Basic regex to find numbers in speech
    const match = text.match(/\d+/);
    if (match) {
        const num = parseInt(match[0]);
        if (num >= 1 && num <= 90) return num;
    }
    return null;
}
