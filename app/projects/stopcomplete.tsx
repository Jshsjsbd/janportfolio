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

// Add this CSS for fade-in animation (if not already present):
const errorStyles = `
  @keyframes fadeInError {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-error {
    animation: fadeInError 0.4s ease-out;
  }
`;

// Add this CSS for modal and overlay (if not already present):
const modalStyles = `
  .error-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeInErrorOverlay 0.3s;
  }
  .error-modal-box {
    background: #dc2626;
    color: white;
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    padding: 2rem 2.5rem;
    min-width: 320px;
    max-width: 90vw;
    border: 2px solid #b91c1c;
    position: relative;
    animation: fadeInErrorModal 0.4s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .error-modal-close {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    font-size: 2rem;
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: color 0.2s;
  }
  .error-modal-close:hover {
    color: #fee2e2;
  }
  @keyframes fadeInErrorOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInErrorModal {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = notificationStyles;
  document.head.appendChild(style);
  const errorStyle = document.createElement('style');
  errorStyle.textContent = errorStyles;
  document.head.appendChild(errorStyle);
  const modalStyle = document.createElement('style');
  modalStyle.textContent = modalStyles;
  document.head.appendChild(modalStyle);
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
  isGameFinished: boolean; // Added this field
  liveAnswers?: { [key: string]: GameAnswer }; // Added this field
  finishedBy?: string; // Added this field
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
  const [createPassword, setCreatePassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [gameMode, setGameMode] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState(300);
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
  const [isCreatingRoomLoading, setIsCreatingRoomLoading] = useState(false);
  const [isJoiningRoomLoading, setIsJoiningRoomLoading] = useState(false);
  const [isStartingGameLoading, setIsStartingGameLoading] = useState(false);
  const [isResettingGameLoading, setIsResettingGameLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
    if (room?.isGameStarted && timeLeft > 0 && room.gameStartTime) {
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
  }, [room?.isGameStarted, timeLimit, room?.gameStartTime]);

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
    console.log('isSelecting state changed to:', false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  

  // Reset letterAnimationHandled when game state changes
  useEffect(() => {
    if (room && !room.isGameStarted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [room?.isGameStarted]);

  // Add this useEffect after room is defined:
  useEffect(() => {
    console.log('[Animation useEffect] room:', room, {
      // isSelecting, // Removed
      // letterAnimationHandled, // Removed
      // animationHandled: animationHandledRef.current, // Removed
      // selectedLetter: room && room.selectedLetter, // Removed
      isGameStarted: room && room.isGameStarted,
      // shouldAnimateLetter // Removed
    });
    if (
      room &&
      room.isGameStarted &&
      room.selectedLetter
      // !isSelecting && // Removed
      // !letterAnimationHandled && // Removed
      // !animationHandledRef.current // Removed
    ) {
      console.log('[useEffect Animation Trigger]');
      // setLetterAnimationHandled(true); // Removed
      // animationHandledRef.current = true; // Removed
      // handleLetterSelection(room.selectedLetter); // Removed
      // setShouldAnimateLetter(false); // Removed
    }
  }, [room, room?.isGameStarted, room?.selectedLetter]);

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
          
          setRoom(updatedRoom);
          setIsHost(updatedRoom.host === playerName);
          
          // Debug log for animation trigger
          console.log('[Animation Check]', {
            isGameStarted: updatedRoom.isGameStarted,
            selectedLetter: updatedRoom.selectedLetter,
            // isSelecting, // Removed
            // letterAnimationHandled, // Removed
            // animationHandled: animationHandledRef.current, // Removed
            previousRoomExists: false, // Removed
            previousRoomIsGameStarted: undefined
          });
          // Handle letter selection animation only when game first starts
          // AND we haven't handled it yet AND we're not currently selecting
          // AND the game just transitioned from not started to started
          if (
            updatedRoom.isGameStarted &&
            updatedRoom.selectedLetter &&
            // !isSelecting && // Removed
            // !letterAnimationHandled && // Removed
            // !animationHandledRef.current && // Removed
            false && // Removed
            false
          ) {
            console.log('Triggering letter animation - game just started');
            // setLetterAnimationHandled(true); // Removed
            // animationHandledRef.current = true; // Removed
            // handleLetterSelection(updatedRoom.selectedLetter); // Removed
          }
        }
      } catch (error) {
        console.error('[Polling] Error:', error);
        setError('Connection lost. Please refresh the page.');
      }
    }, 2000);
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
    // i want to check if the action is create or join or start to set the loading state
    if (data.action === 'create') {
      setIsCreatingRoomLoading(true);
    } else if (data.action === 'join') {
      setIsJoiningRoomLoading(true);
    } else if (data.action === 'start') {
      setIsStartingGameLoading(true);
    }
    // setIsLoading(true);
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
      if (data.action === 'create') {
        setIsCreatingRoomLoading(false);
      } else if (data.action === 'join') {
        setIsJoiningRoomLoading(false);
      } else if (data.action === 'start') {
        setIsStartingGameLoading(false);
      }
    }
  };

  const createRoom = async () => {
    if (!playerName.trim() && !createPassword.trim()) {
      setError("Your name and room password are required");
      return;
    } else if (!playerName.trim()) {
      setError("Your name is required");
      return;
    } else if (!createPassword.trim()) {
      setError("Room password is required");
      return;
    }

    try {
      const result = await apiCall('stopcomplete-rooms', {
        action: 'create',
        playerName,
        createPassword,
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
      setError("Failed to create room. Please try again.");
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() && !roomId.trim() && !joinPassword.trim()) {
      setError("Your name, room ID, and room password are required");
      return;
    } else if (!playerName.trim()) {
      setError("Your name is required");
      return;
    } else if (!roomId.trim()) {
      setError("Room ID is required");
      return;
    } else if (!joinPassword.trim()) {
      setError("Room password is required");
      return;
    }

    try {
      const result = await apiCall('stopcomplete-rooms', {
        action: 'join',
        roomId,
        playerName,
        joinPassword
      });

      if ('room' in result) {
        setRoom(result.room);
        setIsHost(result.room.host === playerName);
        playSound(523);
      }
    } catch (error) {
      setError("Failed to join room. Please try again.");
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
      setError("Failed to kick player. Please try again.");
    }
  };

  const startGame = async () => {
    if (!isHost || !room) return;
    setIsStartingGameLoading(true);
    try {
      await apiCall('stopcomplete-rooms', {
        action: 'start',
        roomId,
        playerName
      });
      playSound(880);
    } catch (error) {
      setError("Failed to start game. Please try again.");
    } finally {
      setIsStartingGameLoading(false);
    }
  };

  const handleAnswerChange = (category: keyof GameAnswer, value: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [category]: value };
      // Update live answers in backend
      if (roomId && playerName) {
        apiCall('stopcomplete-rooms', {
          action: 'updateAnswers',
          roomId,
          playerName,
          answers: updated
        });
      }
      return updated;
    });
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
      setError("Failed to finish game. Please try again.");
    }
  };

  const resetGame = async () => {
    if (!isHost) return;
    setIsResettingGameLoading(true);
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
      // setIsSelecting(false); // Removed
      setSelectedLetter('');
      // setLetterAnimationHandled(false); // Removed
      // animationHandledRef.current = false; // Removed
      // setShouldAnimateLetter(false); // Removed
      
      // Clear any running animation
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      setError("Failed to reset game. Please try again.");
    } finally {
      setIsResettingGameLoading(false);
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
      // setLetterAnimationHandled(false); // Removed
      // animationHandledRef.current = false; // Removed
      // setShouldAnimateLetter(false); // Removed
      
      // Clear any running animation
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      setError("Failed to leave room. Please try again.");
    }
  };

  const isPlayerFinished = (room && room.finishedPlayers ? room.finishedPlayers : []).some(p => p.player === playerName) || false;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Add a helper to check if the game is finished for everyone (all players in finishedPlayers):
  const isGameFinished = room && room.isGameFinished;

  // Helper to get the player who finished the game first, or null if all finished or no one finished
  const finishedBy = room && room.finishedPlayers && room.players
    ? (room.finishedPlayers.length === room.players.length
        ? null
        : (room.finishedPlayers.length > 0 ? room.finishedPlayers[0].player : null))
    : null;

  if (!room) {
    return (
      <div className="min-h-screen text-white">
        <Header type='projects' />
        {error && (
          <div className="error-modal-overlay" onClick={() => setError(null)}>
            <div className="error-modal-box animate-fade-in-error" onClick={e => e.stopPropagation()}>
              <span className="text-3xl mb-2">❌</span>
              <span className="mb-2 text-lg text-center">{error}</span>
              <button
                className="error-modal-close"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto backdrop-blur-md bg-white/10 rounded-xl shadow-lg overflow-hidden p-6 mt-20">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">Stop It's Complete!</h1>
            
            {/* Exiting notice Notice */}
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
              <strong>Warning:</strong> Don't leave the page while playing even if it's still opened beacause of the game security to have a fair experience.
              <br />
              <strong>Leaving the page while playing will take you out of the room and the game! ⚠️</strong>
            </div>
            
            {/* {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )} */}
            
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
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
              <button
                onClick={createRoom}
                  disabled={isCreatingRoomLoading}
                  className="w-full bg-blue-500/80 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isCreatingRoomLoading ? 'Creating...' : 'Create Room'}
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
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
              <button
                onClick={joinRoom}
                  disabled={isJoiningRoomLoading}
                  className="w-full bg-green-500/80 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isJoiningRoomLoading ? 'Joining...' : 'Join Room'}
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
      {error && (
        <div className="error-modal-overlay" onClick={() => setError(null)}>
          <div className="error-modal-box animate-fade-in-error" onClick={e => e.stopPropagation()}>
            <span className="text-3xl mb-2">❌</span>
            <span className="mb-2 text-lg text-center">{error}</span>
            <button
              className="error-modal-close"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/10 rounded-xl shadow-lg overflow-hidden p-6 mt-20">
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
            <div className="flex items-center space-x-2 sm:flex-row sm:flex-col ">
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
          {room.isGameStarted && timeLimit > 0 && (
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
                      {finishedBy === player && (
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
              disabled={isStartingGameLoading || room.isGameStarted}
              className="w-full bg-blue-500/80 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {isStartingGameLoading ? 'Starting...' : 'Start Game'}
          </button>
        )}

              {isHost && room && room.isGameStarted && room.isGameFinished && (
                <button
                  onClick={resetGame}
                  disabled={isResettingGameLoading}
                  className="w-full bg-purple-500/80 text-white p-3 rounded-lg font-semibold hover:bg-purple-600 transition duration-300 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResettingGameLoading ? 'Starting...' : 'New Game'}
                </button>
              )}
            </div>
          </div>

        {/* Removed animation UI */}

        {room.isGameStarted && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">
              Letter: <span className="text-blue-400">{room.selectedLetter}</span>
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
                    disabled={room?.isGameFinished || isPlayerFinished || false}
                  />
                ))}
              </div>
            {!room?.isGameFinished && !isPlayerFinished && (
              <button
                onClick={handleFinish}
                disabled={room?.isGameFinished || isPlayerFinished || false}
                className="w-full mt-6 bg-green-500/80 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finish
              </button>
            )}
          </div>
        )}

          {room?.isGameFinished && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Results</h2>
            <div className="space-y-4">
      {room.players.map((playerName, index) => {
        const answers: any = room.liveAnswers && room.liveAnswers[playerName] ? room.liveAnswers[playerName] : {};
        const player = (room.finishedPlayers || []).find(p => p.player === playerName);
        return (
          <div key={playerName} className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{playerName}</span>
                  </div>
              <div className="text-right">
                <div className="font-bold text-lg">{player ? player.score : 0} pts</div>
                <div className="text-sm text-gray-400">{player ? player.uniqueAnswers : 0} unique</div>
                    </div>
                  </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {room.categories.map(category => (
                <div key={category}>
                  <span className="text-gray-400">{CATEGORY_LABELS[category]}:</span>
                  <p className="font-medium">{answers[category]?.trim() || '--'}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
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