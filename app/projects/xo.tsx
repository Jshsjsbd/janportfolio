import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useState, useEffect } from "react";
import { gsap } from 'gsap';

type Board = Array<string | null>;
type WinInfo = {
    winner: string | null;
    line: number[] | null;
};

function TicTacToe() {
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winInfo, setWinInfo] = useState<WinInfo>({ winner: null, line: null });
    const [score, setScore] = useState({ player: 0, ai: 0 });

    const calculateWinner = (squares: Board): WinInfo => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        return { winner: null, line: null };
    };

    const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
        const result = calculateWinner(squares);
        
        if (result.winner === 'O') return 10 - depth;
        if (result.winner === 'X') return depth - 10;
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
        if (winInfo.winner || board[index]) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsXNext(false);

        const result = calculateWinner(newBoard);
        if (result.winner) {
            setWinInfo(result);
            setScore(prev => ({
                ...prev,
                player: prev.player + (result.winner === 'X' ? 1 : 0)
            }));
        }

        // Animate the X placement
        gsap.from(`#cell-${index}`, {
            scale: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    };    useEffect(() => {
        if (!isXNext && !winInfo.winner && !board.every(cell => cell !== null)) {
            // AI's turn
            setTimeout(() => {
                const bestMove = findBestMove([...board]);
                const newBoard = [...board];
                newBoard[bestMove] = 'O';
                setBoard(newBoard);
                setIsXNext(true);

                const result = calculateWinner(newBoard);
                if (result.winner) {
                    setWinInfo(result);
                    setScore(prev => ({
                        ...prev,
                        ai: prev.ai + 1
                    }));
                }
                
                // Animate the O placement
                gsap.from(`#cell-${bestMove}`, {
                    scale: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }, 500);
        }
    }, [isXNext, board, winInfo.winner]);

    return (
        <>
            <Header type='projects' />
            <div className="min-h-screen pt-24 pb-12 px-4 mt-5">
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
                        <p className="text-xl font-semibold text-teal-200">
                            {winInfo.winner 
                                ? `Winner: ${winInfo.winner === 'X' ? 'You' : 'AI'}!` 
                                : board.every(cell => cell) 
                                    ? "It's a draw!" 
                                    : `${isXNext ? 'Your' : "AI's"} turn`}
                        </p>
                    </div>

                    {/* Game Board */}
                    <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto mb-8">
                        {board.map((cell, index) => (
                            <button
                                key={index}
                                id={`cell-${index}`}
                                onClick={() => handleClick(index)}
                                className={`h-24 text-4xl font-bold flex items-center justify-center border border-teal-500
                                    ${winInfo.line?.includes(index) 
                                        ? 'bg-teal-600 text-white' 
                                        : 'bg-gray-800 hover:bg-gray-700 text-teal-300'
                                    } rounded-lg transition-colors duration-200`}
                                disabled={Boolean(cell) || Boolean(winInfo.winner)}
                            >
                                {cell}
                            </button>
                        ))}
                    </div>

                    {/* Reset Button */}
                    <div className="text-center">
                                    <button
                            onClick={() => {
                                setBoard(Array(9).fill(null));
                                setIsXNext(true);
                                setWinInfo({ winner: null, line: null });
                            }}
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