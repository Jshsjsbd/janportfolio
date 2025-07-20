// StopComplete.tsx
import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import { useState, useEffect, useRef } from 'react';

interface GameAnswer {
  boyName: string;
  girlName: string;
  plant: string;
  fruit: string;
  country: string;
  animal: string;
  color: string;
  food: string;
  movie: string;
  sport: string;
}

interface PlayerAnswer {
  player: string;
  answers: GameAnswer;
  finishTime: number;
  score: number;
  uniqueAnswers: number;
}

interface Room {
  id: string;
  password: string;
  host: string;
  players: string[];
  isGameStarted: boolean;
  selectedLetter?: string;
  finishedPlayers: PlayerAnswer[];
  gameMode: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  gameStartTime?: number;
  categories: string[];
}

interface GameStats {
  totalGames: number;
  wins: number;
  averageScore: number;
  bestScore: number;
  fastestFinish: number;
}

const EASY_CATEGORIES = ['boyName', 'girlName', 'plant', 'fruit', 'country'];
const MEDIUM_CATEGORIES = ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color'];
const HARD_CATEGORIES = ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color', 'food', 'movie', 'sport'];

const CATEGORY_LABELS: Record<string, string> = {
  boyName: 'Boy Name',
  girlName: 'Girl Name',
  plant: 'Plant',
  fruit: 'Fruit',
  country: 'Country',
  animal: 'Animal',
  color: 'Color',
  food: 'Food',
  movie: 'Movie',
  sport: 'Sport'
};

const StopComplete: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [gameMode, setGameMode] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes default
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showCopied, setShowCopied] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    wins: 0,
    averageScore: 0,
    bestScore: 0,
    fastestFinish: 0
  });
  const [answers, setAnswers] = useState<GameAnswer>({
    boyName: '',
    girlName: '',
    plant: '',
    fruit: '',
    country: '',
    animal: '',
    color: '',
    food: '',
    movie: '',
    sport: ''
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (room?.isGameStarted && !isSelecting && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up! Auto-finish for all players
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [room?.isGameStarted, isSelecting, timeLeft]);

  // Play sound effect
  const playSound = (frequency: number, duration: number = 200) => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration / 1000);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration / 1000);
  };

  const getCategoriesForMode = (mode: 'easy' | 'medium' | 'hard') => {
    switch (mode) {
      case 'easy': return EASY_CATEGORIES;
      case 'medium': return MEDIUM_CATEGORIES;
      case 'hard': return HARD_CATEGORIES;
    }
  };

  const createRoom = () => {
    if (!playerName.trim() || !password.trim()) return alert("Name and password required");
    
    playSound(440); // A note
    
    const categories = getCategoriesForMode(gameMode);
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      password,
      host: playerName,
      players: [playerName],
      isGameStarted: false,
      finishedPlayers: [],
      gameMode,
      timeLimit,
      categories
    };
    setRoom(newRoom);
    setIsHost(true);
    setRoomId(newRoom.id);
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomId.trim() || !password.trim()) return alert("Missing fields");
    if (!room || room.password !== password) return alert("Room not found or wrong password");
    if (room.players.includes(playerName)) return alert("Player already in room");

    playSound(523); // C note
    
    setRoom(prev => prev ? { ...prev, players: [...prev.players, playerName] } : prev);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      playSound(659); // E note
    } catch (err) {
      console.error('Failed to copy room ID');
    }
  };

  const kickPlayer = (playerToKick: string) => {
    if (!isHost || playerToKick === playerName) return;
    
    setRoom(prev => prev ? {
      ...prev,
      players: prev.players.filter(p => p !== playerToKick),
      finishedPlayers: prev.finishedPlayers.filter(p => p.player !== playerToKick)
    } : prev);
    
    playSound(330); // E note (lower)
  };

  const startGame = () => {
    if (!isHost || !room) return;
    
    playSound(880); // A note (higher)
    setIsSelecting(true);
    setTimeLeft(timeLimit);

    let count = 0;
    let finalLetter = '';
    const interval = setInterval(() => {
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      setSelectedLetter(randomLetter);
      finalLetter = randomLetter;
      count++;

      if (count > 20) {
        clearInterval(interval);
        setIsSelecting(false);
        setSelectedLetter(finalLetter);
        setRoom(prev => prev ? { 
          ...prev, 
          isGameStarted: true, 
          selectedLetter: finalLetter,
          gameStartTime: Date.now()
        } : prev);
      }
    }, 100);
  };

  const handleAnswerChange = (category: keyof GameAnswer, value: string) => {
    setAnswers(prev => ({ ...prev, [category]: value }));
  };

  const calculateScore = (playerAnswers: GameAnswer, allAnswers: PlayerAnswer[]): { score: number; uniqueAnswers: number } => {
    let score = 0;
    let uniqueAnswers = 0;
    
    const categories = getCategoriesForMode(room?.gameMode || 'medium');
    
    categories.forEach(category => {
      const answer = playerAnswers[category as keyof GameAnswer];
      if (answer && answer.trim()) {
        // Check if this answer is unique
        const isUnique = !allAnswers.some(otherPlayer => 
          otherPlayer.player !== playerName && 
          otherPlayer.answers[category as keyof GameAnswer]?.toLowerCase() === answer.toLowerCase()
        );
        
        if (isUnique) {
          score += 10;
          uniqueAnswers++;
        } else {
          score += 5;
        }
      }
    });
    
    // Bonus for finishing first
    const finishOrder = allAnswers.findIndex(p => p.player === playerName);
    if (finishOrder === 0) {
      score += 20;
    } else if (finishOrder === 1) {
      score += 10;
    }
    
    return { score, uniqueAnswers };
  };

  const handleFinish = () => {
    if (!room || !playerName) return;
    
    const categories = getCategoriesForMode(room.gameMode);
    const requiredAnswers = categories.filter(cat => 
      !answers[cat as keyof GameAnswer]?.trim()
    );
    
    if (requiredAnswers.length > 0) {
      alert(`Please fill in all required fields: ${requiredAnswers.map(cat => CATEGORY_LABELS[cat]).join(', ')}`);
      return;
    }
    
    playSound(1047); // C note (higher)
    
    const { score, uniqueAnswers } = calculateScore(answers, room.finishedPlayers);
    const playerAnswer: PlayerAnswer = {
      player: playerName,
      answers: answers,
      finishTime: Date.now(),
      score,
      uniqueAnswers
    };
    
    setRoom(prev => prev ? {
      ...prev,
      finishedPlayers: [...prev.finishedPlayers, playerAnswer]
    } : prev);
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      bestScore: Math.max(prev.bestScore, score),
      averageScore: (prev.averageScore * prev.totalGames + score) / (prev.totalGames + 1)
    }));
  };

  const handleTimeUp = () => {
    if (!room || !playerName) return;
    
    playSound(220); // A note (lower)
    
    // Auto-finish for current player if not finished
    if (!room.finishedPlayers.some(p => p.player === playerName)) {
      const { score, uniqueAnswers } = calculateScore(answers, room.finishedPlayers);
      const playerAnswer: PlayerAnswer = {
        player: playerName,
        answers: answers,
        finishTime: Date.now(),
        score,
        uniqueAnswers
      };
      
      setRoom(prev => prev ? {
        ...prev,
        finishedPlayers: [...prev.finishedPlayers, playerAnswer]
      } : prev);
    }
  };

  const resetGame = () => {
    if (!isHost) return;
    
    setRoom(prev => prev ? {
      ...prev,
      isGameStarted: false,
      selectedLetter: undefined,
      finishedPlayers: [],
      gameStartTime: undefined
    } : prev);
    setAnswers({
      boyName: '',
      girlName: '',
      plant: '',
      fruit: '',
      country: '',
      animal: '',
      color: '',
      food: '',
      movie: '',
      sport: ''
    });
    setTimeLeft(timeLimit);
    setIsSelecting(false);
  };

  const isPlayerFinished = room?.finishedPlayers.some(p => p.player === playerName) || false;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!room) {
    return (
      <div className="min-h-screen text-white">
        <Header type='projects' />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto backdrop-blur-md bg-white/10 rounded-xl shadow-lg overflow-hidden p-6 mt-20">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">Stop It's Complete!</h1>
            
            {/* Game Stats */}
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Your Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Games: {gameStats.totalGames}</div>
                <div>Best Score: {gameStats.bestScore}</div>
                <div>Avg Score: {Math.round(gameStats.averageScore)}</div>
                <div>Wins: {gameStats.wins}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Game Mode Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Game Mode:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setGameMode(mode)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        gameMode === mode
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400">
                  {gameMode === 'easy' && '5 categories'}
                  {gameMode === 'medium' && '7 categories'}
                  {gameMode === 'hard' && '10 categories'}
                </div>
              </div>
              
              {/* Time Limit Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Time Limit:</label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={180}>3 minutes</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={0}>No limit</option>
                </select>
              </div>
            
              <div className="border-t pt-4">
                <h2 className="text-xl font-bold mb-2">Create Room</h2>
                <input
                  type="password"
                  placeholder="Set Room Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                <button
                  onClick={createRoom}
                  className="w-full bg-blue-500/80 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out"
                >
                  Create Room
                </button>
              </div>

              <div className="border-t pt-4">
                <h2 className="text-xl font-bold mb-2">Join Room</h2>
                <input
                  type="text"
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                <input
                  type="password"
                  placeholder="Room Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                <button
                  onClick={joinRoom}
                  className="w-full bg-green-500/80 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <Header type='projects' />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/10 rounded-xl shadow-lg overflow-hidden p-6 mt-20">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Room: {room.id}</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyRoomId}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                {showCopied ? 'Copied!' : 'Copy ID'}
              </button>
              <span className="px-2 py-1 bg-blue-500/50 rounded-full text-sm">
                {room.gameMode.charAt(0).toUpperCase() + room.gameMode.slice(1)}
              </span>
            </div>
          </div>

          {/* Timer */}
          {room.isGameStarted && !isSelecting && timeLimit > 0 && (
            <div className="mb-4 text-center">
              <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Players List */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Players ({room.players.length})</h2>
              <ul className="space-y-2">
                {room.players.map(player => (
                  <li key={player} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span>{player}</span>
                      {player === room.host && (
                        <span className="px-2 py-1 text-sm bg-blue-500/50 rounded-full">Host</span>
                      )}
                      {room.finishedPlayers.some(p => p.player === player) && (
                        <span className="px-2 py-1 text-sm bg-green-500/50 rounded-full">Finished</span>
                      )}
                    </div>
                    {isHost && player !== playerName && (
                      <button
                        onClick={() => kickPlayer(player)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Kick
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Game Controls */}
            <div>
              {isHost && !room.isGameStarted && (
                <button
                  onClick={startGame}
                  className="w-full bg-blue-500/80 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out mb-4"
                >
                  Start Game
                </button>
              )}

              {isHost && room.isGameStarted && room.finishedPlayers.length === room.players.length && (
                <button
                  onClick={resetGame}
                  className="w-full bg-purple-500/80 text-white p-3 rounded-lg font-semibold hover:bg-purple-600 transition duration-300 ease-in-out mb-4"
                >
                  New Game
                </button>
              )}
            </div>
          </div>

          {isSelecting && (
            <div className="text-center py-10">
              <div className="text-8xl font-bold animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                {selectedLetter}
              </div>
              <div className="text-xl mt-4 text-gray-300">Selecting letter...</div>
            </div>
          )}

          {room.isGameStarted && !isSelecting && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center mb-6">
                Letter: <span className="text-blue-400">{selectedLetter}</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {room.categories.map(category => (
                  <input
                    key={category}
                    type="text"
                    placeholder={CATEGORY_LABELS[category]}
                    value={answers[category as keyof GameAnswer]}
                    onChange={(e) => handleAnswerChange(category as keyof GameAnswer, e.target.value)}
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPlayerFinished}
                  />
                ))}
              </div>
              
              {!isPlayerFinished && (
                <button
                  onClick={handleFinish}
                  className="w-full mt-6 bg-green-500/80 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out"
                >
                  Finish
                </button>
              )}
            </div>
          )}

          {room.finishedPlayers.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold text-center mb-6">Results</h2>
              <div className="space-y-4">
                {room.finishedPlayers
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                  <div key={player.player} className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{player.player}</span>
                        {index === 0 && <span className="px-2 py-1 text-sm bg-yellow-500/50 rounded-full">🥇</span>}
                        {index === 1 && <span className="px-2 py-1 text-sm bg-gray-400/50 rounded-full">🥈</span>}
                        {index === 2 && <span className="px-2 py-1 text-sm bg-orange-500/50 rounded-full">🥉</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{player.score} pts</div>
                        <div className="text-sm text-gray-400">
                          {player.uniqueAnswers} unique
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {room.categories.map(category => (
                        <div key={category}>
                          <span className="text-gray-400">{CATEGORY_LABELS[category]}:</span>
                          <p className="font-medium">{player.answers[category as keyof GameAnswer] || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StopComplete;