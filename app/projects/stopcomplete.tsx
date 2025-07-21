// StopComplete.tsx
import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import { useState, useEffect, useRef } from 'react';

// Add notification animation styles
const notificationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = notificationStyles;
  document.head.appendChild(style);
}

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
  createdAt: number;
  lastActivity: number;
}

interface GameStats {
  totalGames: number;
  wins: number;
  averageScore: number;
  bestScore: number;
  fastestFinish: number;
}

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
  const [timeLimit, setTimeLimit] = useState(300);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showCopied, setShowCopied] = useState(false);
  const [letterAnimationHandled, setLetterAnimationHandled] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const animationHandledRef = useRef<boolean>(false);

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Load player stats on component mount
  useEffect(() => {
    if (playerName) {
      loadPlayerStats();
    }
  }, [playerName]);

  // Timer effect
  useEffect(() => {
    if (room?.isGameStarted && !isSelecting && timeLeft > 0 && room.gameStartTime) {
      const elapsed = Math.floor((Date.now() - room.gameStartTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
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
  }, [room?.isGameStarted, isSelecting, timeLimit, room?.gameStartTime]);

  // Real-time updates with polling (since Firebase requires authentication)
  useEffect(() => {
    if (roomId && room) {
      setupRealTimeUpdates();
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [roomId, room]);

  // Handle automatic room leaving when user reloads or leaves the site
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (roomId && playerName) {
        // Store leave data for cleanup on next page load
        const leaveData = {
          roomId,
          playerName,
          timestamp: Date.now()
        };
        localStorage.setItem('pending_room_leave', JSON.stringify(leaveData));
        
        // Note: We can't use async operations in beforeunload
        // The cleanup will happen on the next page load
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && roomId && playerName) {
        // User switched tabs or minimized browser
        try {
          await apiCall('stopcomplete-rooms', {
            action: 'leave',
            roomId,
            playerName
          });
        } catch (error) {
          console.error('Error leaving room on visibility change:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId, playerName]);

  // Check for pending room leaves on component mount
  useEffect(() => {
    const processPendingLeave = async () => {
      const pendingLeave = localStorage.getItem('pending_room_leave');
      if (pendingLeave) {
        try {
          const leaveData = JSON.parse(pendingLeave);
          // Process the pending leave
          if (leaveData.roomId && leaveData.playerName) {
            console.log('Processing pending room leave for:', leaveData.playerName);
            // Clean up the pending leave
            localStorage.removeItem('pending_room_leave');
            
            // Add notification about the leave via API
            await apiCall('stopcomplete-rooms', {
              action: 'leave',
              roomId: leaveData.roomId,
              playerName: leaveData.playerName
            });
          }
        } catch (error) {
          console.error('Error parsing pending leave data:', error);
          localStorage.removeItem('pending_room_leave');
        }
      }
    };
    
    processPendingLeave();
  }, []);

  // Debug effect for isSelecting state
  useEffect(() => {
    console.log('isSelecting state changed to:', isSelecting);
  }, [isSelecting]);

  // Reset letterAnimationHandled when game state changes
  useEffect(() => {
    if (room && !room.isGameStarted) {
      setLetterAnimationHandled(false);
      setIsSelecting(false);
      animationHandledRef.current = false;
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [room?.isGameStarted]);

  const getCategoriesForMode = (mode: string) => {
    switch (mode) {
      case 'easy': return ['boyName', 'girlName', 'plant', 'fruit', 'country'];
      case 'medium': return ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color'];
      case 'hard': return ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color', 'food', 'movie', 'sport'];
      default: return ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color'];
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORY_LABELS[category] || category;
  };

  const calculateScore = (playerAnswers: any, allAnswers: any[], currentPlayer: string) => {
    let score = 0;
    let uniqueAnswers = 0;
    
    const categories = Object.keys(playerAnswers);
    
    categories.forEach(category => {
      const answer = playerAnswers[category];
      if (answer && answer.trim()) {
        // Check if this answer is unique
        const isUnique = !allAnswers.some(otherPlayer => 
          otherPlayer.player !== currentPlayer && 
          otherPlayer.answers[category]?.toLowerCase() === answer.toLowerCase()
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
    const finishOrder = allAnswers.findIndex(p => p.player === currentPlayer);
    if (finishOrder === 0) {
      score += 20;
    } else if (finishOrder === 1) {
      score += 10;
    }
    
    return { score, uniqueAnswers };
  };

  const setupRealTimeUpdates = () => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Poll for updates every 2 seconds
    pollingRef.current = setInterval(async () => {
      try {
        const data = await apiCall('stopcomplete-updates', { roomId });
        console.log('[Polling] Received data:', data);
        
        if ('room' in data && data.room) {
          const updatedRoom = data.room as Room;
          const previousRoom = room;
          
          setRoom(updatedRoom);
          setIsHost(updatedRoom.host === playerName);
          
          // Handle letter selection animation only when game first starts
          // AND we haven't handled it yet AND we're not currently selecting
          // AND the game just transitioned from not started to started
          if (updatedRoom.isGameStarted && 
              updatedRoom.selectedLetter && 
              !isSelecting && 
              !letterAnimationHandled &&
              !animationHandledRef.current &&
              previousRoom && 
              !previousRoom.isGameStarted) {
            console.log('Triggering letter animation - game just started');
            setLetterAnimationHandled(true);
            animationHandledRef.current = true;
            handleLetterSelection(updatedRoom.selectedLetter);
          }
        }
      } catch (error) {
        console.error('[Polling] Error:', error);
        setError('Connection lost. Please refresh the page.');
      }
    }, 2000);
  };

  const handleLetterSelection = (letter: string) => {
    console.log('Starting letter animation for:', letter);
    
    // Prevent multiple animations from running simultaneously
    if (isSelecting || animationRef.current) {
      console.log('Animation already running, skipping...');
      return;
    }
    
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    setIsSelecting(true);
    setSelectedLetter(''); // Start with empty letter
    playSound(440);

    let count = 0;
    animationRef.current = setInterval(() => {
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      setSelectedLetter(randomLetter);
      count++;

      if (count > 20) {
        console.log('Letter animation finished, final letter:', letter);
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        setIsSelecting(false);
        setSelectedLetter(letter);
        
        // Force a re-render to ensure the game state updates
        setTimeout(() => {
          console.log('Game should now show inputs with letter:', letter);
          console.log('isSelecting should be false, current state:', isSelecting);
        }, 100);
      }
    }, 100);
  };

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

  const loadPlayerStats = async () => {
    try {
      const data = await apiCall('stopcomplete-stats', { playerName });
      if ('stats' in data) {
        setGameStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const apiCall = async (endpoint: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Vercel API endpoints that handle Firebase authentication
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    if (!playerName.trim() || !password.trim()) {
      setError("Name and password required");
      return;
    }

    try {
      const result = await apiCall('stopcomplete-rooms', {
        action: 'create',
        playerName,
        password,
        gameMode,
        timeLimit
      });

      if (result && typeof result === 'object' && 'room' in result && 'roomId' in result) {
        setRoom(result.room);
        setTimeout(() => setRoomId(result.roomId as string), 0); // ensure setRoom runs first
        setIsHost(true);
        playSound(440);
      } else {
        setError("Failed to create room. Please try again.");
      }
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomId.trim() || !password.trim()) {
      setError("Missing fields");
      return;
    }

    try {
      const result = await apiCall('stopcomplete-rooms', {
        action: 'join',
        roomId,
        playerName,
        password
      });

      if ('room' in result) {
        setRoom(result.room);
        setIsHost(result.room.host === playerName);
        playSound(523);
      }
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      playSound(659);
    } catch (err) {
      setError('Failed to copy room ID');
    }
  };

  const kickPlayer = async (playerToKick: string) => {
    if (!isHost || playerToKick === playerName) return;

    try {
      await apiCall('stopcomplete-rooms', {
        action: 'kick',
        roomId,
        playerName,
        playerToKick
      });
      playSound(330);
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const startGame = async () => {
    if (!isHost || !room) return;

    try {
      await apiCall('stopcomplete-rooms', {
        action: 'start',
        roomId,
        playerName
      });
      playSound(880);
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const handleAnswerChange = (category: keyof GameAnswer, value: string) => {
    setAnswers(prev => ({ ...prev, [category]: value }));
  };

  const handleFinish = async () => {
    if (!room || !playerName) return;

    try {
      const result = await apiCall('stopcomplete-rooms', {
        action: 'finish',
        roomId,
        playerName,
        answers
      });

      if ('score' in result && typeof result.score === 'number') {
        const score = result.score as number;
        playSound(1047);
        
        // Update local stats
        setGameStats(prev => ({
          ...prev,
          totalGames: prev.totalGames + 1,
          bestScore: Math.max(prev.bestScore, score),
          averageScore: (prev.averageScore * prev.totalGames + score) / (prev.totalGames + 1)
        }));
      }
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const resetGame = async () => {
    if (!isHost) return;

    try {
      await apiCall('stopcomplete-rooms', {
        action: 'reset',
        roomId,
        playerName
      });

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
      setSelectedLetter('');
      setLetterAnimationHandled(false);
      animationHandledRef.current = false;
      
      // Clear any running animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const leaveRoom = async () => {
    if (!roomId || !playerName) return;

    try {
      await apiCall('stopcomplete-rooms', {
        action: 'leave',
        roomId,
        playerName
      });

      setRoom(null);
      setRoomId('');
      setIsHost(false);
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
      setSelectedLetter('');
      setLetterAnimationHandled(false);
      animationHandledRef.current = false;
      
      // Clear any running animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    } catch (error) {
      // Error already set by apiCall
    }
  };

  const isPlayerFinished = (room && room.finishedPlayers ? room.finishedPlayers : []).some(p => p.player === playerName) || false;
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
            
            {/* Backend API Notice */}
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm">
              <strong>Backend API Mode:</strong> Using Vercel API endpoints with Firebase Realtime Database. 
              True cross-device multiplayer enabled with secure authentication! 🔐
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}
            
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
                  disabled={isLoading}
                  className="w-full bg-blue-500/80 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isLoading ? 'Creating...' : 'Create Room'}
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
                  disabled={isLoading}
                  className="w-full bg-green-500/80 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isLoading ? 'Joining...' : 'Join Room'}
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
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="mb-4 space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 animate-fade-in">
                  {notification}
                </div>
              ))}
            </div>
          )}

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
              <button
                onClick={leaveRoom}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
              >
                Leave
              </button>
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
                      {isPlayerFinished && (
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
              disabled={room.isGameStarted}
              className="w-full bg-blue-500/80 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {room.isGameStarted ? 'Starting...' : 'Start Game'}
            </button>
          )}

              {isHost && room && room.isGameStarted && (room.finishedPlayers ? room.finishedPlayers.length : 0) === (room.players ? room.players.length : 0) && (
                <button
                  onClick={resetGame}
                  disabled={false}
                  className="w-full bg-purple-500/80 text-white p-3 rounded-lg font-semibold hover:bg-purple-600 transition duration-300 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="text-sm text-gray-400 mt-2">Debug: isSelecting={isSelecting.toString()}</div>
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
                disabled={isPlayerFinished}
                className="w-full mt-6 bg-green-500/80 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finish
              </button>
            )}
          </div>
        )}

          {(room && room.finishedPlayers ? room.finishedPlayers.length : 0) > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Results</h2>
            <div className="space-y-4">
                {(room && room.finishedPlayers ? room.finishedPlayers : [])
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