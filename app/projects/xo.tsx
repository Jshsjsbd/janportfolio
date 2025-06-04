import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useState, useEffect } from "react";
import { gsap } from 'gsap';

type Board = Array<string | null>;

function TicTacToe() {
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [score, setScore] = useState({ player: 0, ai: 0 });

    const calculateWinner = (squares: Board): string | null => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
        const winner = calculateWinner(squares);
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (squares.every(square => square !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < squares.length; i++) {
                if (squares[i] === null) {
                    squares[i] = 'O';
                    bestScore = Math.max(bestScore, minimax(squares, depth + 1, false));
                    squares[i] = null;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < squares.length; i++) {
                if (squares[i] === null) {
                    squares[i] = 'X';
                    bestScore = Math.min(bestScore, minimax(squares, depth + 1, true));
                    squares[i] = null;
                }
            }
            return bestScore;
        }
    };

    const findBestMove = (squares: Board): number => {
        let bestScore = -Infinity;
        let bestMove = 0;

        for (let i = 0; i < squares.length; i++) {
            if (squares[i] === null) {
                squares[i] = 'O';
                const score = minimax(squares, 0, false);
                squares[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    };

    const handleClick = (index: number) => {
        if (winner || board[index]) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsXNext(false);

        // Animate the X placement
        gsap.from(`#cell-${index}`, {
            scale: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    };

    useEffect(() => {
        if (!isXNext && !winner) {
            // AI's turn
            setTimeout(() => {
                const bestMove = findBestMove([...board]);
                const newBoard = [...board];
                newBoard[bestMove] = 'O';
                setBoard(newBoard);
                setIsXNext(true);
                
                // Animate the O placement
                gsap.from(`#cell-${bestMove}`, {
                    scale: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }, 500);
        }
    }, [isXNext, board, winner]);

    useEffect(() => {
        const newWinner = calculateWinner(board);
        if (newWinner) {
            setWinner(newWinner);
            if (newWinner === 'X') {
                setScore(prev => ({ ...prev, player: prev.player + 1 }));
            } else {
                setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
            }
        }
    }, [board]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);

        // Reset animation
        gsap.to(".board", {
            rotate: 360,
            duration: 0.5,
            ease: "power2.out"
        });
    };

    const renderCell = (index: number) => {
        return (
        <button
                id={`cell-${index}`}
                className="w-20 h-20 bg-gray-800 border-2 border-teal-500 rounded-lg 
                         text-4xl font-bold text-white flex items-center justify-center 
                         transition-colors hover:bg-gray-700"
                onClick={() => handleClick(index)}
                disabled={!!winner || !isXNext}
        >
                {board[index]}
        </button>
    );
    };

    return (
        <>
            <Header type='projects' />
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="custom-styles max-w-4xl mx-auto p-8 rounded-2xl backdrop-blur-md">
                    <h1 className="text-4xl font-bold text-center text-teal-300 mb-8">Tic Tac Toe</h1>
                    
                    {/* Score Display */}
                    <div className="flex justify-center gap-12 mb-8">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-teal-200">You (X)</h3>
                            <p className="text-3xl text-white">{score.player}</p>
                                </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-teal-200">AI (O)</h3>
                            <p className="text-3xl text-white">{score.ai}</p>
                                </div>
                            </div>

                    {/* Game Status */}
                    <div className="text-center mb-8">
                        <p className="text-2xl font-semibold text-white">
                                    {winner
                                ? `Winner: ${winner === 'X' ? 'You' : 'AI'}!` 
                                : board.every(cell => cell) 
                                    ? "It's a draw!" 
                                    : `${isXNext ? 'Your' : "AI's"} turn`}
                                </p>
                            </div>

                    {/* Game Board */}
                    <div className="board grid grid-cols-3 gap-2 max-w-[250px] mx-auto mb-8">
                        {board.map((_, index) => renderCell(index))}
                        </div>

                    {/* Reset Button */}
                    <div className="text-center">
                                    <button
                            onClick={resetGame}
                            className="bg-gradient-to-r from-teal-500 to-indigo-500 
                                     hover:from-indigo-500 hover:to-teal-500 text-white 
                                     font-bold py-2 px-6 rounded-full transform 
                                     transition-all hover:scale-105"
                        >
                            New Game
                                    </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default TicTacToe;