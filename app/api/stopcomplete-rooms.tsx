import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
// @ts-ignore
import { db } from '../../api/firebase.js';
import { ref, set, get, push, update, remove } from 'firebase/database';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');
  const action = url.searchParams.get('action');

  if (action === 'get' && roomId) {
    return await getRoom(roomId);
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  let action: string;
  let data: any = {};
  
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    // Handle JSON data
    const jsonData = await request.json();
    action = jsonData.action;
    data = { ...jsonData };
    delete data.action;
  } else {
    // Handle form data
    const formData = await request.formData();
    action = formData.get('action') as string;
    
    for (const [key, value] of formData.entries()) {
      if (key !== 'action') {
        data[key] = value;
      }
    }
  }
  


  switch (action) {
    case 'create':
      return await createRoom(data);
    case 'join':
      return await joinRoom(data);
    case 'start':
      return await startGame(data);
    case 'finish':
      return await finishGame(data);
    case 'timeUp':
      return await handleTimeUp(data);
    case 'kick':
      return await kickPlayer(data);
    case 'reset':
      return await resetGame(data);
    case 'leave':
      return await leaveRoom(data);
    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function createRoom(data: any) {
  const { playerName, password, gameMode, timeLimit } = data;

  if (!playerName?.trim() || !password?.trim()) {
    return json({ error: 'Name and password required' }, { status: 400 });
  }

  const roomId = Math.random().toString(36).substr(2, 9);
  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);

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

  return json({ 
    success: true, 
    roomId,
    room 
  });
}

async function joinRoom(data: any) {
  const { roomId, playerName, password } = data;

  if (!roomId?.trim() || !playerName?.trim() || !password?.trim()) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();

  if (room.password !== password) {
    return json({ error: 'Wrong password' }, { status: 401 });
  }

  if (room.players.includes(playerName)) {
    return json({ error: 'Player already in room' }, { status: 409 });
  }

  if (room.isGameStarted) {
    return json({ error: 'Game already started' }, { status: 409 });
  }

  // Add player to room
  const updatedPlayers = [...room.players, playerName];
  await update(roomRef, {
    players: updatedPlayers,
    lastActivity: Date.now()
  });

  return json({ 
    success: true, 
    room: { ...room, players: updatedPlayers }
  });
}

async function startGame(data: any) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();

  if (room.host !== playerName) {
    return json({ error: 'Only host can start game' }, { status: 403 });
  }

  if (room.isGameStarted) {
    return json({ error: 'Game already started' }, { status: 409 });
  }

  // Generate random letter
  const selectedLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  await update(roomRef, {
    isGameStarted: true,
    selectedLetter,
    gameStartTime: Date.now(),
    lastActivity: Date.now()
  });

  return json({ 
    success: true, 
    selectedLetter,
    gameStartTime: Date.now()
  });
}

async function finishGame(data: any) {
  const { roomId, playerName, answers } = data;

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();

  if (!room.isGameStarted) {
    return json({ error: 'Game not started' }, { status: 409 });
  }

  // Check if player already finished
  if (room.finishedPlayers.some((p: any) => p.player === playerName)) {
    return json({ error: 'Player already finished' }, { status: 409 });
  }

  // Parse answers if it's a string
  let parsedAnswers = answers;
  if (typeof answers === 'string') {
    try {
      parsedAnswers = JSON.parse(answers);
    } catch (e) {
      return json({ error: 'Invalid answers format' }, { status: 400 });
    }
  }

  // Validate answers
  const categories = room.categories;
  const requiredAnswers = categories.filter((cat: string) => !parsedAnswers[cat]?.trim());
  
  if (requiredAnswers.length > 0) {
    return json({ 
      error: `Please fill in all required fields: ${requiredAnswers.map((cat: string) => getCategoryLabel(cat)).join(', ')}` 
    }, { status: 400 });
  }

  // Calculate score
  const { score, uniqueAnswers } = calculateScore(parsedAnswers, room.finishedPlayers, playerName);

  const playerAnswer = {
    player: playerName,
    answers: parsedAnswers,
    finishTime: Date.now(),
    score,
    uniqueAnswers
  };

  const updatedFinishedPlayers = [...room.finishedPlayers, playerAnswer];

  await update(roomRef, {
    finishedPlayers: updatedFinishedPlayers,
    lastActivity: Date.now()
  });

  // Update player stats
  await updatePlayerStats(playerName, score);

  return json({ 
    success: true, 
    score,
    uniqueAnswers,
    finishTime: Date.now()
  });
}

async function handleTimeUp(data: any) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();

  if (!room.isGameStarted || room.isGameFinished) {
    return json({ error: 'Game not in progress' }, { status: 409 });
  }

  // Auto-finish the game for all players who haven't finished yet
  const allPlayers = room.players;
  const unfinishedPlayers = allPlayers.filter((player: string) => 
    !room.finishedPlayers.some((p: any) => p.player === player)
  );

  // For unfinished players, create empty answers and calculate scores
  const newFinishedPlayers = unfinishedPlayers.map((player: string) => {
    const emptyAnswers = room.categories.reduce((acc: any, cat: string) => {
      acc[cat] = '';
      return acc;
    }, {});

    const { score, uniqueAnswers } = calculateScore(emptyAnswers, room.finishedPlayers, player);

    return {
      player,
      answers: emptyAnswers,
      finishTime: Date.now(),
      score,
      uniqueAnswers
    };
  });

  // Combine existing finished players with new ones
  const allFinishedPlayers = [...room.finishedPlayers, ...newFinishedPlayers];

  // Update player stats for all newly finished players
  for (const player of newFinishedPlayers) {
    await updatePlayerStats(player.player, player.score);
  }

  // Mark game as finished
  await update(roomRef, {
    finishedPlayers: allFinishedPlayers,
    isGameFinished: true,
    lastActivity: Date.now()
  });

  return json({ 
    success: true, 
    finishedPlayers: allFinishedPlayers,
    timeUp: true
  });
}

async function kickPlayer(data: any) {
  const { roomId, playerName, playerToKick } = data;

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();

  if (room.host !== playerName) {
    return json({ error: 'Only host can kick players' }, { status: 403 });
  }

  if (playerToKick === playerName) {
    return json({ error: 'Cannot kick yourself' }, { status: 400 });
  }

  const updatedPlayers = room.players.filter((p: string) => p !== playerToKick);
  const updatedFinishedPlayers = room.finishedPlayers.filter((p: any) => p.player !== playerToKick);

  await update(roomRef, {
    players: updatedPlayers,
    finishedPlayers: updatedFinishedPlayers,
    lastActivity: Date.now()
  });

  return json({ success: true });
}

async function resetGame(data: any) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();

  if (room.host !== playerName) {
    return json({ error: 'Only host can reset game' }, { status: 403 });
  }

  await update(roomRef, {
    isGameStarted: false,
    selectedLetter: null,
    finishedPlayers: [],
    gameStartTime: null,
    lastActivity: Date.now()
  });

  return json({ success: true });
}

async function leaveRoom(data: any) {
  const { roomId, playerName } = data;

  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();
  const updatedPlayers = room.players.filter((p: string) => p !== playerName);
  const updatedFinishedPlayers = room.finishedPlayers.filter((p: any) => p.player !== playerName);

  if (updatedPlayers.length === 0) {
    // Delete room if no players left
    await remove(roomRef);
  } else {
    // Update room with new host if needed
    const newHost = room.host === playerName ? updatedPlayers[0] : room.host;
    
    await update(roomRef, {
      players: updatedPlayers,
      finishedPlayers: updatedFinishedPlayers,
      host: newHost,
      lastActivity: Date.now()
    });
  }

  return json({ success: true });
}

async function getRoom(roomId: string) {
  const roomRef = ref(db, `stopcomplete/rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    return json({ error: 'Room not found' }, { status: 404 });
  }

  const room = roomSnapshot.val();
  return json({ room });
}

async function updatePlayerStats(playerName: string, score: number) {
  const statsRef = ref(db, `stopcomplete/stats/${playerName.replace(/[.#$[\]]/g, '_')}`);
  const statsSnapshot = await get(statsRef);

  let stats = statsSnapshot.exists() ? statsSnapshot.val() : {
    totalGames: 0,
    wins: 0,
    averageScore: 0,
    bestScore: 0,
    fastestFinish: 0
  };

  stats.totalGames += 1;
  stats.bestScore = Math.max(stats.bestScore, score);
  stats.averageScore = (stats.averageScore * (stats.totalGames - 1) + score) / stats.totalGames;

  await set(statsRef, stats);
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