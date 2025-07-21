import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
// @ts-ignore
import { db } from '../../api/firebase.js';
import { ref, get, set } from 'firebase/database';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const playerName = url.searchParams.get('playerName');

  if (!playerName) {
    return json({ error: 'Player name required' }, { status: 400 });
  }

  const statsRef = ref(db, `stopcomplete/stats/${playerName.replace(/[.#$[\]]/g, '_')}`);
  const statsSnapshot = await get(statsRef);

  if (!statsSnapshot.exists()) {
    // Return default stats for new players
    const defaultStats = {
      totalGames: 0,
      wins: 0,
      averageScore: 0,
      bestScore: 0,
      fastestFinish: 0
    };
    return json({ stats: defaultStats });
  }

  return json({ stats: statsSnapshot.val() });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const playerName = formData.get('playerName') as string;
  const gameResult = formData.get('gameResult') as string;

  if (!playerName || !gameResult) {
    return json({ error: 'Player name and game result required' }, { status: 400 });
  }

  let parsedGameResult;
  try {
    parsedGameResult = JSON.parse(gameResult);
  } catch (e) {
    return json({ error: 'Invalid game result format' }, { status: 400 });
  }

  const statsRef = ref(db, `stopcomplete/stats/${playerName.replace(/[.#$[\]]/g, '_')}`);
  const statsSnapshot = await get(statsRef);

  let stats = statsSnapshot.exists() ? statsSnapshot.val() : {
    totalGames: 0,
    wins: 0,
    averageScore: 0,
    bestScore: 0,
    fastestFinish: 0
  };

  // Update stats based on game result
  stats.totalGames += 1;
  stats.bestScore = Math.max(stats.bestScore, parsedGameResult.score);
  stats.averageScore = (stats.averageScore * (stats.totalGames - 1) + parsedGameResult.score) / stats.totalGames;

  if (parsedGameResult.position === 1) {
    stats.wins += 1;
  }

  if (parsedGameResult.finishTime && (stats.fastestFinish === 0 || parsedGameResult.finishTime < stats.fastestFinish)) {
    stats.fastestFinish = parsedGameResult.finishTime;
  }

  await set(statsRef, stats);

  return json({ success: true, stats });
} 