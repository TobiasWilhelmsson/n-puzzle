import React, { useState, useEffect, useCallback } from 'react'
import './Puzzle.css'
import config from '../config/config'

const initialState = {
    rows: config.rows,
    cols: config.cols
}

// Generera pusslet med en array av nummer och en tom ruta
const generatePuzzle = (rows: number, cols: number) => {
    const numbers = Array.from({ length: rows * cols }, (_, i) => i + 1)
    // Sätt sista elementet till 0 för att representera tom ruta
    numbers[numbers.length - 1] = 0
    // Slumpa ordningen
    numbers.sort(() => Math.random() - 0.5)
    return numbers
}

const Puzzle: React.FC = () => {
    const rows = initialState.rows
    const cols = initialState.cols
    const totalTiles = rows * cols
    const [puzzle, setPuzzle] = useState<number[]>(generatePuzzle(rows, cols))
    const [emptyIndex, setEmptyIndex] = useState(puzzle.indexOf(0)) // Index för tomma rutan
    const [didWin, setDidWin] = useState(false) // Håll koll efter vinst

    // Slumpa pusslet
    const shufflePuzzle = useCallback(() => {
        const newPuzzle = generatePuzzle(rows, cols)
        const newEmptyIndex = newPuzzle.findIndex((x) => x === 0)
        setPuzzle(newPuzzle)
        setEmptyIndex(newEmptyIndex)
        setDidWin(false) // Ta bort vinstmeddelandet
    }, [rows, cols])

    // Använd shufflePuzzle för att slumpa pusslet vid rendering
    useEffect(() => {
        shufflePuzzle()
    }, [shufflePuzzle])

    // Hantera flytt av brickor
    const moveTile = useCallback(
        (index: number) => {
            const emptyRow = Math.floor(emptyIndex / cols) // Rad för tomrum
            const emptyCol = emptyIndex % cols // Kolumn för tomrummet
            const tileRow = Math.floor(index / cols) // Rad för klickad bricka
            const tileCol = index % cols // Kolumn för klickad bricka

            const newPuzzle = [...puzzle] // Kopierar nuvarande pussel

            if (emptyRow === tileRow) {
                // Kontrollera om tomrummet och klickad bricka är i samma rad
                if (emptyCol < tileCol) {
                    // Flytta brickorna åt vänster
                    for (let i = emptyCol; i < tileCol; i++) {
                        newPuzzle[emptyRow * cols + i] =
                            newPuzzle[emptyRow * cols + i + 1]
                    }
                } else {
                    // Flytta brickorna åt höger
                    for (let i = emptyCol; i > tileCol; i--) {
                        newPuzzle[emptyRow * cols + i] =
                            newPuzzle[emptyRow * cols + i - 1]
                    }
                }
                newPuzzle[tileRow * cols + tileCol] = 0 // Nytt index för tomrummet
                setPuzzle(newPuzzle)
                setEmptyIndex(tileRow * cols + tileCol)
            } else if (emptyCol === tileCol) {
                // Kontrollera om tomrummet och klickad bricka är i samma kolumn
                if (emptyRow < tileRow) {
                    // Flytta brickorna uppåt
                    for (let i = emptyRow; i < tileRow; i++) {
                        newPuzzle[i * cols + emptyCol] =
                            newPuzzle[(i + 1) * cols + emptyCol]
                    }
                } else {
                    // Flytta brickorna nedåt
                    for (let i = emptyRow; i > tileRow; i--) {
                        newPuzzle[i * cols + emptyCol] =
                            newPuzzle[(i - 1) * cols + emptyCol]
                    }
                }
                newPuzzle[tileRow * cols + tileCol] = 0 // Nytt index för tomrummet
                setPuzzle(newPuzzle)
                setEmptyIndex(tileRow * cols + tileCol)
            }
        },
        [emptyIndex, cols, puzzle]
    )

    // Kontrollera vinst / om varje bricka är på korrekt plats
    const hasWon = useCallback(() => {
        for (let i = 0; i < totalTiles - 1; i++) {
            if (puzzle[i] !== i + 1) return false
        }
        return true
    }, [puzzle, totalTiles])

    // Sätt state till true vid vinst
    useEffect(() => {
        if (hasWon()) {
            setDidWin(true)
        }
    }, [puzzle, hasWon])

    return (
        <div className="puzzle-container">
            {!didWin && (
                <div className="puzzle-board">
                    {Array.from({ length: rows }, (_, rowIndex) => (
                        <div className="puzzle-row" key={rowIndex}>
                            {/* Skapa array av längden rows och mappa över den för att skapa varje rad */}
                            {puzzle
                                .slice(rowIndex * cols, rowIndex * cols + cols)
                                .map((val, colIndex) => (
                                    // Ta en slice av `puzzle` arrayen för att få alla kolumner för aktuella raden
                                    <div
                                        key={colIndex}
                                        className={`puzzle-tile ${
                                            val === 0 ? 'empty' : ''
                                        }`}
                                        /* Condition på värdet sätts klassen till tom för 0 */
                                        onClick={() =>
                                            val !== 0 &&
                                            moveTile(rowIndex * cols + colIndex)
                                        }
                                        /* onClick flyttar brickan */
                                    >
                                        {val !== 0 ? val : null}
                                        {/* Visa numret om det inte är tomrum */}
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            )}
            {!didWin && (
                <button onClick={shufflePuzzle} className="shuffle-button">
                    Slumpa
                </button>
            )}

            {didWin && (
                <div className="win-message show-win-message">
                    Grattis! Du löste pusslet!
                    <button onClick={shufflePuzzle} className="play-again-button">
                        Spela igen
                    </button>
                </div>
            )}
        </div>
    )
}

export default Puzzle
