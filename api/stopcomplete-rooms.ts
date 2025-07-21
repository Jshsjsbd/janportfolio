console.log('Current file path:', import.meta.url);
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, set, get, push, update, remove, onValue, off } from 'firebase/database';

// Get the secret from environment variable
const secret = process.env.FIREBASE_SECRET || 'a7x92kd';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { action, ...data } = req.body;

      switch (action) {
        case 'create':
          return await createRoom(data, res);
        case 'join':
          return await joinRoom(data, res);
        case 'start':
          return await startGame(data, res);
        case 'finish':
          return await finishGame(data, res);
        case 'kick':
          return await kickPlayer(data, res);
        case 'reset':
          return await resetGame(data, res);
        case 'leave':
          return await leaveRoom(data, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } else if (req.method === 'GET') {
      const { roomId } = req.query;
      const action = req.query.action as string;

      if (action === 'get' && roomId) {
        return await getRoom(roomId as string, res);
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('StopComplete API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createRoom(data: any, res: VercelResponse) {
  const { playerName, password, gameMode, timeLimit } = data;

  if (!playerName?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Name and password required' });
  }

  const roomId = Math.random().toString(36).substr(2, 9);
  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);

  const categories = getCategoriesForMode(gameMode || 'medium');
  
  const room = {
    id: roomId,
    password,
    host: playerName,
    players: [playerName],
    isGameStarted: false,
    finishedPlayers: [],
    gameMode: gameMode || 'medium',
    timeLimit: timeLimit || 300,
    categories,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  await set(roomRef, room);

  return res.status(200).json({ 
    success: true, 
    roomId,
    room 
  });
}

async function joinRoom(data: any, res: VercelResponse) {
  const { roomId, playerName, password } = data;

  if (!roomId?.trim() || !playerName?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = roomSnapshot.val();

  if (room.password !== password) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  if (room.players.includes(playerName)) {
    return res.status(409).json({ error: 'Player already in room' });
  }

  if (room.isGameStarted) {
    return res.status(409).json({ error: 'Game already started' });
  }

  // Add player to room
  const updatedPlayers = [...room.players, playerName];
  await update(roomRef, {
    players: updatedPlayers,
    lastActivity: Date.now()
  });

  return res.status(200).json({ 
    success: true, 
    room: { ...room, players: updatedPlayers }
  });
}

async function startGame(data: any, res: VercelResponse) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = roomSnapshot.val();

  if (room.host !== playerName) {
    return res.status(403).json({ error: 'Only host can start game' });
  }

  if (room.isGameStarted) {
    return res.status(409).json({ error: 'Game already started' });
  }

  // Generate random letter
  const selectedLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  await update(roomRef, {
    isGameStarted: true,
    selectedLetter,
    gameStartTime: Date.now(),
    lastActivity: Date.now()
  });

  return res.status(200).json({ 
    success: true, 
    selectedLetter,
    gameStartTime: Date.now()
  });
}

async function finishGame(data: any, res: VercelResponse) {
  const { roomId, playerName, answers } = data;

  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = roomSnapshot.val();

  if (!room.isGameStarted) {
    return res.status(409).json({ error: 'Game not started' });
  }

  // Check if player already finished
  if ((room.finishedPlayers || []).some((p: any) => p.player === playerName)) {
    return res.status(409).json({ error: 'Player already finished' });
  }

  // Validate answers
  const categories = room.categories;
  const requiredAnswers = categories.filter((cat: string) => !answers[cat]?.trim());
  
  if (requiredAnswers.length > 0) {
    return res.status(400).json({ 
      error: `Please fill in all required fields: ${requiredAnswers.map((cat: string) => getCategoryLabel(cat)).join(', ')}` 
    });
  }

  // Calculate score
  const { score, uniqueAnswers } = calculateScore(answers, (room.finishedPlayers || []), playerName);

  const playerAnswer = {
    player: playerName,
    answers,
    finishTime: Date.now(),
    score,
    uniqueAnswers
  };

  const updatedFinishedPlayers = [...(room.finishedPlayers || []), playerAnswer];
  await update(roomRef, {
    finishedPlayers: updatedFinishedPlayers,
    lastActivity: Date.now(),
    isGameFinished: true
  });

  // Update player stats
  await updatePlayerStats(playerName, score);

  return res.status(200).json({ 
    success: true, 
    score, 
    uniqueAnswers,
    finishTime: Date.now()
  });
}

async function kickPlayer(data: any, res: VercelResponse) {
  const { roomId, playerName, playerToKick } = data;

  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = roomSnapshot.val();

  if (room.host !== playerName) {
    return res.status(403).json({ error: 'Only host can kick players' });
  }

  if (playerToKick === playerName) {
    return res.status(400).json({ error: 'Cannot kick yourself' });
  }

  const updatedPlayers = room.players.filter((p: string) => p !== playerToKick);
  const updatedFinishedPlayers = (room.finishedPlayers || []).filter((p: any) => p.player !== playerToKick);

  await update(roomRef, {
    players: updatedPlayers,
    finishedPlayers: updatedFinishedPlayers,
    lastActivity: Date.now()
  });

  return res.status(200).json({ success: true });
}

async function resetGame(data: any, res: VercelResponse) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = roomSnapshot.val();

  if (room.host !== playerName) {
    return res.status(403).json({ error: 'Only host can reset game' });
  }

  await update(roomRef, {
    isGameStarted: false,
    selectedLetter: null,
    finishedPlayers: [],
    gameStartTime: null,
    lastActivity: Date.now(),
    isGameFinished: false
  });

  return res.status(200).json({ success: true });
}

async function leaveRoom(data: any, res: VercelResponse) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = roomSnapshot.val();

  const updatedPlayers = room.players.filter((p: string) => p !== playerName);
  const updatedFinishedPlayers = (room.finishedPlayers || []).filter((p: any) => p.player !== playerName);

  if (updatedPlayers.length === 0 && (room.finishedPlayers || []).length === 0) {
    console.log(`[leaveRoom] Deleting room ${roomId} because no players and no finished players remain.`);
    await remove(roomRef);
  } else {
    // Update room with new host if needed
    const newHost = room.host === playerName ? updatedPlayers[0] : room.host;
    
    await update(roomRef, {
      host: newHost,
      players: updatedPlayers,
      finishedPlayers: updatedFinishedPlayers,
      lastActivity: Date.now()
    });
  }

  return res.status(200).json({ success: true });
}

async function getRoom(roomId: string, res: VercelResponse) {
  const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.status(200).json({ room: roomSnapshot.val() });
}

async function updatePlayerStats(playerName: string, score: number) {
  const statsRef = ref(db, `secure_beacons/${secret}/stats/${playerName.replace(/[.#$[\]]/g, '_')}`);
  const statsSnapshot = await get(statsRef);

  const currentStats = statsSnapshot.exists() ? statsSnapshot.val() : {
    totalGames: 0,
    wins: 0,
    averageScore: 0,
    bestScore: 0,
    fastestFinish: 0
  };

  const newStats = {
    ...currentStats,
    totalGames: currentStats.totalGames + 1,
    bestScore: Math.max(currentStats.bestScore, score),
    averageScore: (currentStats.averageScore * currentStats.totalGames + score) / (currentStats.totalGames + 1)
  };

  await set(statsRef, newStats);
}

function getCategoriesForMode(mode: string) {
  switch (mode) {
    case 'easy': return ['boyName', 'girlName', 'plant', 'fruit', 'country'];
    case 'medium': return ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color'];
    case 'hard': return ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color', 'food', 'movie', 'sport'];
    default: return ['boyName', 'girlName', 'plant', 'fruit', 'country', 'animal', 'color'];
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
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
  return labels[category] || category;
}

function calculateScore(playerAnswers: any, allAnswers: any[], currentPlayer: string) {
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
} 