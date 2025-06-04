import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useState, useEffect } from "react";
import * as THREE from 'three';
import { gsap } from 'gsap';

const choices = ['rock', 'paper', 'scissors'] as const;
type Choice = typeof choices[number];

type GameState = {
    playerChoice: Choice | null;
    computerChoice: Choice | null;
    result: string;
    score: { player: number; computer: number };
    history: Array<{ player: Choice; computer: Choice; result: string }>;
};

function RockPaperScissors() {
    const [gameState, setGameState] = useState<GameState>({
        playerChoice: null,
        computerChoice: null,
        result: '',
        score: { player: 0, computer: 0 },
        history: []
    });

    const [isAnimating, setIsAnimating] = useState(false);

    const getWinner = (player: Choice, computer: Choice): string => {
        if (player === computer) return "Draw!";
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return "You win!";
        }
        return "Computer wins!";
    };

    const makeChoice = async (choice: Choice) => {
        if (isAnimating) return;
        setIsAnimating(true);

        // Reset previous choices
        setGameState(prev => ({ ...prev, playerChoice: null, computerChoice: null, result: '' }));

        // Animate choice selection
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        // Show player's choice immediately
        setGameState(prev => ({ ...prev, playerChoice: choice }));

        // Animate computer thinking
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Show computer's choice and calculate result
        const result = getWinner(choice, computerChoice);
        
        setGameState(prev => ({
            ...prev,
            computerChoice,
            result,
            score: {
                player: prev.score.player + (result === "You win!" ? 1 : 0),
                computer: prev.score.computer + (result === "Computer wins!" ? 1 : 0)
            },
            history: [...prev.history, { player: choice, computer: computerChoice, result }]
        }));

        setIsAnimating(false);
    };

    const getChoiceEmoji = (choice: Choice | null): string => {
        if (!choice) return '❔';
        return choice === 'rock' ? '✊' : choice === 'paper' ? '✋' : '✌️';
    };

    return (
        <div className="min-h-screen">
            <Header type='projects' />
            <div className="relative z-10 pt-32 pb-20">
                <div className="custom-styles max-w-4xl mx-auto p-8 rounded-2xl">
                    <h1 className="text-4xl font-bold text-center text-teal-300 mb-8">Rock Paper Scissors</h1>
                    
                    {/* Score Display */}
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-teal-200">You</h2>
                            <p className="text-3xl">{gameState.score.player}</p>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-teal-200">Computer</h2>
                            <p className="text-3xl">{gameState.score.computer}</p>
                        </div>
                    </div>

                    {/* Game Arena */}
                    <div className="flex justify-center items-center gap-8 mb-8">
                        <div className="text-6xl min-w-[80px] text-center">
                            {getChoiceEmoji(gameState.playerChoice)}
                        </div>
                        <div className="text-4xl font-bold text-purple-400">VS</div>
                        <div className="text-6xl min-w-[80px] text-center">
                            {getChoiceEmoji(gameState.computerChoice)}
                        </div>
                    </div>

                    {/* Result Display */}
                    <div className="text-center mb-8">
                        <p className="text-2xl font-bold text-teal-400">{gameState.result}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        {choices.map((choice) => (
                            <button
                                key={choice}
                                onClick={() => makeChoice(choice)}
                                disabled={isAnimating}
                                className="px-6 py-3 text-2xl bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:from-indigo-600 hover:to-purple-500 transform hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {getChoiceEmoji(choice)}
                            </button>
                        ))}
                    </div>

                        {/* Game History */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-teal-200 mb-4">Game History</h3>
                        <div className="max-h-40 overflow-y-auto custom-styles1 rounded-lg p-4">
                            {gameState.history.slice().reverse().map((game, index) => (
                                <div key={index} className="flex justify-between items-center mb-2 text-sm">
                                    <span>{getChoiceEmoji(game.player)}</span>
                                    <span className="text-xs">{game.result}</span>
                                    <span>{getChoiceEmoji(game.computer)}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                </div>
            <Footer />
        </div>
    );
}

export default RockPaperScissors;