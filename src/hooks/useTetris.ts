import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TetrominoType,
  BoardMatrix,
  ActivePiece,
  GameStatus,
  GameStats,
  BoardCoord,
  FloatingScore,
  BonusEvent,
} from '../types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  WALL_KICKS_JLSTZ,
  WALL_KICKS_I,
  LINE_POINTS,
  LEVEL_SPEEDS,
  STORAGE_HIGH_SCORE_KEY,
  COUNTRY_FLAGS,
  TARGET_WINS,
} from '../constants';
import { sound } from '../audio';

// 4 countries only: T (Кыргызстан 🇰🇬), I (Казакстан 🇰🇿), O (Өзбекстан 🇺🇿), S (Түркия 🇹🇷)
const ALL_PIECES: TetrominoType[] = ['T', 'I', 'O', 'S'];

// Generates bag with frequent identical / twin country flags ("окшош желектер бат-бат чыгат")
function generateBag(): TetrominoType[] {
  const bag: TetrominoType[] = [...ALL_PIECES];

  // Add 1 or 2 duplicate matching flags (giving high priority to Kyrgyzstan 'T' and twins)
  const duplicates = Math.random() > 0.3 ? 2 : 1;
  for (let d = 0; d < duplicates; d++) {
    const favored = Math.random() > 0.4 ? 'T' : ALL_PIECES[Math.floor(Math.random() * ALL_PIECES.length)];
    bag.push(favored);
  }

  // Shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  // 40% chance to position matching identical country flags back-to-back as twins
  for (let i = 0; i < bag.length - 1; i++) {
    if (Math.random() < 0.4) {
      const matchIdx = bag.indexOf(bag[i], i + 2);
      if (matchIdx !== -1) {
        [bag[i + 1], bag[matchIdx]] = [bag[matchIdx], bag[i + 1]];
      }
    }
  }

  return bag;
}

function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
}

// Drops blocks down after matching flag cells are cleared ("окшош желектер өчсүн")
function applyGravity(boardMatrix: BoardMatrix, cellsToRemove: BoardCoord[]): BoardMatrix {
  const temp = boardMatrix.map((row) => [...row]);
  for (const { x, y } of cellsToRemove) {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      temp[y][x] = null;
    }
  }

  const next = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );

  for (let c = 0; c < BOARD_WIDTH; c++) {
    let writeY = BOARD_HEIGHT - 1;
    for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
      if (temp[r][c] !== null) {
        next[writeY][c] = temp[r][c];
        writeY--;
      }
    }
  }

  return next;
}

// Finds all connected blocks of identical flags touching the placed piece or size >= 5
function findMatchingFlagCoords(
  board: BoardMatrix,
  placedCoords: BoardCoord[],
  placedType: TetrominoType
): BoardCoord[] {
  // All 8 adjacent directions (orthogonal + diagonal contact)
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  // 1. Check if newly placed piece touches any existing cell on the board of the same flag
  let touchesExistingSameFlag = false;
  for (const { x, y } of placedCoords) {
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
        if (
          board[ny][nx] === placedType &&
          !placedCoords.some((p) => p.x === nx && p.y === ny)
        ) {
          touchesExistingSameFlag = true;
          break;
        }
      }
    }
    if (touchesExistingSameFlag) break;
  }

  const result: BoardCoord[] = [];
  const visited = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(false)
  );

  // If newly placed piece connects with existing cells of the same flag:
  // Gather all connected identical flag cells!
  if (touchesExistingSameFlag) {
    const queue: BoardCoord[] = [...placedCoords];
    for (const p of placedCoords) {
      visited[p.y][p.x] = true;
      result.push(p);
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const [dx, dy] of directions) {
        const nx = curr.x + dx;
        const ny = curr.y + dy;
        if (
          nx >= 0 &&
          nx < BOARD_WIDTH &&
          ny >= 0 &&
          ny < BOARD_HEIGHT &&
          !visited[ny][nx] &&
          board[ny][nx] === placedType
        ) {
          visited[ny][nx] = true;
          const pt = { x: nx, y: ny };
          queue.push(pt);
          result.push(pt);
        }
      }
    }
  }

  // Also check if any other connected cluster of ANY flag has size >= 5 on the board
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    for (let c = 0; c < BOARD_WIDTH; c++) {
      const type = board[r][c];
      if (type !== null && !visited[r][c]) {
        const cluster: BoardCoord[] = [];
        const q: BoardCoord[] = [{ x: c, y: r }];
        visited[r][c] = true;

        while (q.length > 0) {
          const item = q.shift()!;
          cluster.push(item);
          for (const [dx, dy] of directions) {
            const nx = item.x + dx;
            const ny = item.y + dy;
            if (
              nx >= 0 &&
              nx < BOARD_WIDTH &&
              ny >= 0 &&
              ny < BOARD_HEIGHT &&
              !visited[ny][nx] &&
              board[ny][nx] === type
            ) {
              visited[ny][nx] = true;
              q.push({ x: nx, y: ny });
            }
          }
        }

        if (cluster.length >= 5) {
          for (const cell of cluster) {
            if (!result.some((p) => p.x === cell.x && p.y === cell.y)) {
              result.push(cell);
            }
          }
        }
      }
    }
  }

  return result;
}

export function useTetris() {
  const [board, setBoard] = useState<BoardMatrix>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<ActivePiece | null>(null);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCells, setClearingCells] = useState<BoardCoord[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [currentBonus, setCurrentBonus] = useState<BonusEvent | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  
  const [stats, setStats] = useState<GameStats>(() => {
    let savedHighScore = 0;
    try {
      savedHighScore = Number(localStorage.getItem(STORAGE_HIGH_SCORE_KEY)) || 0;
    } catch {
      // Ignore localStorage errors
    }
    return {
      score: 0,
      highScore: savedHighScore,
      lines: 0,
      level: 1,
      combo: 0,
      maxCombo: 0,
      totalBonusPoints: 0,
      wins: 0,
      targetWins: TARGET_WINS,
      pieceCounts: {
        I: 0,
        O: 0,
        T: 0,
        S: 0,
        Z: 0,
        J: 0,
        L: 0,
      },
    };
  });

  const [lastAction, setLastAction] = useState<string | null>(null);

  // References for mutable game loop state to avoid closure bugs
  const bagRef = useRef<TetrominoType[]>([]);
  const lockTimeoutRef = useRef<number | null>(null);
  const lockMovesCountRef = useRef<number>(0);
  const boardRef = useRef<BoardMatrix>(board);
  boardRef.current = board;
  const currentPieceRef = useRef<ActivePiece | null>(currentPiece);
  currentPieceRef.current = currentPiece;
  const gameStatusRef = useRef<GameStatus>(gameStatus);
  gameStatusRef.current = gameStatus;
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;
  const lastLockedTypeRef = useRef<TetrominoType | null>(null);

  // Helper to add floating scores on board ("ачко чыгып турсун")
  const addFloatingScore = useCallback(
    (
      text: string,
      points: number,
      xPercent: number = 50,
      yPercent: number = 50,
      emoji?: string
    ) => {
      const id = Date.now() + Math.random();
      setFloatingScores((prev) => [
        ...prev.slice(-6),
        { id, text, points, xPercent, yPercent, emoji, createdAt: Date.now() },
      ]);
      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((s) => s.id !== id));
      }, 1400);
    },
    []
  );

  // Next pieces queue helper
  const pullNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length < 5) {
      bagRef.current = [...bagRef.current, ...generateBag()];
    }
    const next = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 4)]);
    return next;
  }, []);

  // Collision detection
  const checkCollision = useCallback(
    (
      pieceMatrix: number[][],
      posX: number,
      posY: number,
      testBoard: BoardMatrix = boardRef.current
    ): boolean => {
      for (let r = 0; r < pieceMatrix.length; r++) {
        for (let c = 0; c < pieceMatrix[r].length; c++) {
          if (pieceMatrix[r][c]) {
            const newX = posX + c;
            const newY = posY + r;

            // Boundaries
            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return true;
            }
            // Cell collision inside board
            if (newY >= 0 && testBoard[newY][newX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // Spawn a piece
  const spawnPiece = useCallback(
    (type: TetrominoType, targetBoard: BoardMatrix): boolean => {
      const rotation = 0;
      const matrix = TETROMINOES[type][rotation];
      // Center the piece horizontally
      const startX = Math.floor((BOARD_WIDTH - matrix[0].length) / 2);
      // Spawn at top (offset by top empty rows of matrix)
      const startY = type === 'I' ? -1 : 0;

      const newPiece: ActivePiece = {
        type,
        matrix,
        x: startX,
        y: startY,
        rotation,
      };

      // Check if spawn collides -> Game Over!
      if (checkCollision(matrix, startX, startY, targetBoard)) {
        setCurrentPiece(newPiece);
        setGameStatus('GAME_OVER');
        sound.stopMusic();
        sound.playGameOver();
        return false;
      }

      setCurrentPiece(newPiece);
      setCanHold(true);
      lockMovesCountRef.current = 0;

      // Update piece counter stats
      setStats((prev) => ({
        ...prev,
        pieceCounts: {
          ...prev.pieceCounts,
          [type]: prev.pieceCounts[type] + 1,
        },
      }));

      return true;
    },
    [checkCollision]
  );

  // Calculate Ghost piece position
  const getGhostY = useCallback(
    (piece: ActivePiece | null, testBoard: BoardMatrix = boardRef.current): number => {
      if (!piece) return 0;
      let ghostY = piece.y;
      while (!checkCollision(piece.matrix, piece.x, ghostY + 1, testBoard)) {
        ghostY++;
      }
      return ghostY;
    },
    [checkCollision]
  );

  // Lock piece into board
  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || gameStatusRef.current !== 'PLAYING') return;

    if (lockTimeoutRef.current) {
      window.clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }

    const newBoard = boardRef.current.map((row) => [...row]);
    const pieceCoords: { x: number; y: number }[] = [];

    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c]) {
          const boardY = piece.y + r;
          const boardX = piece.x + c;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.type;
            pieceCoords.push({ x: boardX, y: boardY });
          }
        }
      }
    }

    // 1. Check if identical flags connected/matched on the board
    const matchingFlagCoords = findMatchingFlagCoords(newBoard, pieceCoords, piece.type);

    const isTwinFlag = lastLockedTypeRef.current === piece.type;
    lastLockedTypeRef.current = piece.type;
    const flagMeta = COUNTRY_FLAGS[piece.type];

    // If identical flags connected/matched: award points AND extinguish/clear identical flags!
    if (matchingFlagCoords.length > 0) {
      const currentWins = statsRef.current.wins;
      const targetWinReached = currentWins + 1 >= TARGET_WINS;
      const nextWins = Math.min(TARGET_WINS, currentWins + 1);

      // Trigger fiery glowing animation on the exact matching flag cells
      setClearingCells(matchingFlagCoords);

      // Sound and Voice: if reached 10 wins -> victory fanfare! Else pure "Ураа!" shout
      if (targetWinReached) {
        sound.playVictory();
      } else {
        // As requested: ONLY the "Ураа!" voice plays when identical flags extinguish
        sound.playUraaOnly();
      }

      // Calculate score points for matching identical flags ("ачко болсун")
      const flagMultiplier = statsRef.current.level;
      const basePoints = matchingFlagCoords.length * 150 * flagMultiplier;
      const twinBonus = isTwinFlag ? 250 * flagMultiplier : 0;
      const kyrgyzBonus = piece.type === 'T' ? 200 * flagMultiplier : 0;
      const totalFlagPoints = basePoints + twinBonus + kyrgyzBonus;

      const midCoord =
        matchingFlagCoords[Math.floor(matchingFlagCoords.length / 2)] || { x: 5, y: 10 };
      const label = targetWinReached
        ? '🏆 10-УТУШ! ЖЕҢИШ!'
        : '🔥 ЖАҢЫ УТУШ!';

      addFloatingScore(
        label,
        totalFlagPoints,
        (midCoord.x / BOARD_WIDTH) * 100,
        (midCoord.y / BOARD_HEIGHT) * 100,
        targetWinReached ? '🏆' : '🔥'
      );

      // Trigger celebratory fire celebration banner: "ЖАҢЫ УТУШ"
      const bannerTitle = targetWinReached
        ? '🏆 10-УТУШ! ЖЕҢИШ! 🏆'
        : 'ЖАҢЫ УТУШ';
      const bannerSub = targetWinReached
        ? `Куттуктайбыз! 10 утушка жеттиңиз, оюн аяктады! (+${totalFlagPoints} ачко)`
        : `${flagMeta.emoji} ${matchingFlagCoords.length} окшош желек өчтү! [${nextWins}/${TARGET_WINS} утуш] (+${totalFlagPoints} ачко)`;

      setCurrentBonus({
        id: Date.now(),
        text: bannerTitle,
        subText: bannerSub,
        points: totalFlagPoints,
        type: 'flag_match',
        rows: Array.from(new Set(matchingFlagCoords.map((c) => c.y))),
        timestamp: Date.now(),
      });

      // Clear celebration banner after 2s
      setTimeout(() => {
        setCurrentBonus((curr) => (curr && Date.now() - curr.timestamp >= 1900 ? null : curr));
      }, 2000);

      // Animation delay for identical flags extinguishing ("окшош желектер өчсүн")
      setTimeout(() => {
        setClearingCells([]);
        // Remove matching flag cells and drop blocks down with gravity
        const boardAfterGravity = applyGravity(newBoard, matchingFlagCoords);

        // Check if any full horizontal lines formed after flag collapse
        const filledRows: number[] = [];
        for (let r = 0; r < BOARD_HEIGHT; r++) {
          if (boardAfterGravity[r].every((cell) => cell !== null)) {
            filledRows.push(r);
          }
        }

        if (filledRows.length > 0) {
          // Line clear triggered by falling blocks!
          setClearingRows(filledRows);
          if (!targetWinReached) {
            sound.playLineClear(filledRows.length);
          }
          const linesCount = filledRows.length;
          const isTetris = linesCount === 4;

          setTimeout(() => {
            const remainingRows = boardAfterGravity.filter((_, idx) => !filledRows.includes(idx));
            const newEmptyRows = Array.from({ length: filledRows.length }, () =>
              Array(BOARD_WIDTH).fill(null)
            );
            const finalBoard = [...newEmptyRows, ...remainingRows];
            setBoard(finalBoard);
            boardRef.current = finalBoard;
            setClearingRows([]);

            // Calculate combined points: flag match + line clears + combos
            setStats((prev) => {
              const basePoints = LINE_POINTS[linesCount] || 0;
              const linePoints = basePoints * prev.level + prev.combo * 50 * prev.level;
              const totalEarned = linePoints + totalFlagPoints;

              const newScore = prev.score + totalEarned;
              const newLines = prev.lines + linesCount;
              const newLevel = Math.min(15, Math.floor(newLines / 10) + 1);
              const newCombo = prev.combo + 1;
              const newTotalBonus = prev.totalBonusPoints + totalFlagPoints + (isTetris ? 400 : 0);

              if (newLevel > prev.level && !targetWinReached) sound.playLevelUp();
              const newHighScore = Math.max(prev.highScore, newScore);
              try {
                localStorage.setItem(STORAGE_HIGH_SCORE_KEY, String(newHighScore));
              } catch {}

              const avgY =
                (filledRows.reduce((a, b) => a + b, 0) / filledRows.length / BOARD_HEIGHT) * 100;
              addFloatingScore(isTetris ? '🔥 ТЕТРИС! 🔥' : 'ЛИНИЯ', linePoints, 50, avgY, '🔥');

              return {
                ...prev,
                score: newScore,
                highScore: newHighScore,
                lines: newLines,
                level: newLevel,
                combo: newCombo,
                maxCombo: Math.max(prev.maxCombo, newCombo),
                totalBonusPoints: newTotalBonus,
                wins: nextWins,
              };
            });

            if (targetWinReached) {
              // 10 wins reached: game ends!
              setGameStatus('VICTORY');
            } else {
              // Spawn next piece
              const nextType = pullNextPiece();
              spawnPiece(nextType, boardRef.current);
            }
          }, 180);
        } else {
          // No lines filled, update board and stats with flag match points
          setBoard(boardAfterGravity);
          boardRef.current = boardAfterGravity;

          setStats((prev) => {
            const newScore = prev.score + totalFlagPoints;
            const newHigh = Math.max(prev.highScore, newScore);
            const newCombo = prev.combo + 1;
            try {
              localStorage.setItem(STORAGE_HIGH_SCORE_KEY, String(newHigh));
            } catch {}
            return {
              ...prev,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              score: newScore,
              highScore: newHigh,
              totalBonusPoints: prev.totalBonusPoints + totalFlagPoints,
              wins: nextWins,
            };
          });

          if (targetWinReached) {
            // 10 wins reached: game ends!
            setGameStatus('VICTORY');
          } else {
            // Spawn next piece
            const nextType = pullNextPiece();
            spawnPiece(nextType, boardAfterGravity);
          }
        }
      }, 260);
    } else {
      // No identical flags matched - check standard line clear
      const filledRows: number[] = [];
      for (let r = 0; r < BOARD_HEIGHT; r++) {
        if (newBoard[r].every((cell) => cell !== null)) {
          filledRows.push(r);
        }
      }

      if (filledRows.length > 0) {
        const currentWins = statsRef.current.wins;
        const targetWinReached = currentWins + 1 >= TARGET_WINS;
        const nextWins = Math.min(TARGET_WINS, currentWins + 1);

        setClearingRows(filledRows);

        const linesCount = filledRows.length;
        const actionText = targetWinReached
          ? '🏆 10-УТУШ! ЖЕҢИШ!'
          : '🔥 ЖАҢЫ УТУШ!';
        setLastAction(actionText);

        const isTetris = linesCount === 4;
        if (targetWinReached) {
          sound.playVictory();
        } else {
          sound.playLineClear(filledRows.length);
          sound.playUraaVoice();
        }

        // Animation delay for line clearing
        setTimeout(() => {
          setBoard(() => {
            const remainingRows = newBoard.filter((_, idx) => !filledRows.includes(idx));
            const newEmptyRows = Array.from({ length: filledRows.length }, () =>
              Array(BOARD_WIDTH).fill(null)
            );
            const updatedBoard = [...newEmptyRows, ...remainingRows];
            boardRef.current = updatedBoard;
            return updatedBoard;
          });
          setClearingRows([]);

          // Update stats and emit bonus event with points
          setStats((prev) => {
            const basePoints = LINE_POINTS[linesCount] || 0;
            const levelMultiplier = prev.level;
            const comboBonus = prev.combo * 50 * prev.level;
            const pointsEarned = basePoints * levelMultiplier + comboBonus;

            const newScore = prev.score + pointsEarned;
            const newLines = prev.lines + linesCount;
            const newLevel = Math.min(15, Math.floor(newLines / 10) + 1);
            const newCombo = prev.combo + 1;
            const newTotalBonus = prev.totalBonusPoints + comboBonus + (isTetris ? 400 : 0);

            if (newLevel > prev.level && !targetWinReached) {
              sound.playLevelUp();
            }

            const newHighScore = Math.max(prev.highScore, newScore);
            try {
              localStorage.setItem(STORAGE_HIGH_SCORE_KEY, String(newHighScore));
            } catch {
              // Ignore
            }

            // Trigger floating score for lines cleared
            const avgY =
              (filledRows.reduce((a, b) => a + b, 0) / filledRows.length / BOARD_HEIGHT) * 100;
            addFloatingScore(actionText, pointsEarned, 50, avgY, targetWinReached ? '🏆' : '🔥');

            // Trigger Fire Bonus Banner: "ЖАҢЫ УТУШ"
            const bonusTitle = targetWinReached
              ? '🏆 10-УТУШ! ЖЕҢИШ! 🏆'
              : 'ЖАҢЫ УТУШ';

            const sub = targetWinReached
              ? `Куттуктайбыз! 10 утушка жеттиңиз, оюн аяктады! 🏆`
              : newCombo > 1
              ? `КОМБО x${newCombo}! [${nextWins}/${TARGET_WINS} утуш] (+${pointsEarned} ачко)`
              : `${linesCount} линия тазаланды! [${nextWins}/${TARGET_WINS} утуш] (+${pointsEarned} ачко)`;

            setCurrentBonus({
              id: Date.now(),
              text: bonusTitle,
              subText: sub,
              points: pointsEarned,
              type: isTetris ? 'tetris' : linesCount === 3 ? 'triple' : linesCount === 2 ? 'double' : 'single',
              rows: filledRows,
              timestamp: Date.now(),
            });

            // Clear bonus after 2s
            setTimeout(() => {
              setCurrentBonus((curr) => (curr && Date.now() - curr.timestamp >= 1900 ? null : curr));
            }, 2000);

            return {
              ...prev,
              score: newScore,
              highScore: newHighScore,
              lines: newLines,
              level: newLevel,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              totalBonusPoints: newTotalBonus,
              wins: nextWins,
            };
          });

          if (targetWinReached) {
            // 10 wins reached: game ends!
            setGameStatus('VICTORY');
          } else {
            // Spawn next piece
            const nextType = pullNextPiece();
            spawnPiece(nextType, boardRef.current);
          }
        }, 180);
      } else {
        // Reset combo if no line cleared and no matching flags
        setStats((prev) => ({
          ...prev,
          combo: 0,
        }));
        setBoard(newBoard);
        boardRef.current = newBoard;

        // Spawn next piece immediately
        const nextType = pullNextPiece();
        spawnPiece(nextType, newBoard);
      }
    }
  }, [pullNextPiece, spawnPiece, addFloatingScore]);

  // Movement: Move Left / Right
  const moveHorizontal = useCallback(
    (direction: -1 | 1) => {
      if (gameStatusRef.current !== 'PLAYING' || !currentPieceRef.current) return;
      const piece = currentPieceRef.current;
      const newX = piece.x + direction;

      if (!checkCollision(piece.matrix, newX, piece.y)) {
        const updated = { ...piece, x: newX };
        setCurrentPiece(updated);
        sound.playMove();

        // If piece is resting on the ground, reset lock timer slightly
        if (checkCollision(piece.matrix, newX, piece.y + 1)) {
          if (lockMovesCountRef.current < 15) {
            lockMovesCountRef.current += 1;
            if (lockTimeoutRef.current) {
              window.clearTimeout(lockTimeoutRef.current);
              lockTimeoutRef.current = window.setTimeout(lockPiece, 500);
            }
          }
        }
      }
    },
    [checkCollision, lockPiece]
  );

  // Rotate piece (clockwise = 1, counter-clockwise = -1)
  const rotatePiece = useCallback(
    (dir: 1 | -1 = 1) => {
      if (gameStatusRef.current !== 'PLAYING' || !currentPieceRef.current) return;
      const piece = currentPieceRef.current;
      if (piece.type === 'O') return; // O piece doesn't need rotation

      const currentRot = piece.rotation;
      const nextRot = (currentRot + dir + 4) % 4;
      const nextMatrix = TETROMINOES[piece.type][nextRot];

      // SRS Kick table lookup
      const kickKey = `${currentRot}->${nextRot}`;
      const kickTable =
        piece.type === 'I' ? WALL_KICKS_I[kickKey] : WALL_KICKS_JLSTZ[kickKey];

      const kicks = kickTable || [[0, 0]];

      for (const [offsetX, offsetY] of kicks) {
        // SRS Y offset is inverted in screen space (positive Y is up in guideline, but down on screen)
        const targetX = piece.x + offsetX;
        const targetY = piece.y - offsetY;

        if (!checkCollision(nextMatrix, targetX, targetY)) {
          setCurrentPiece({
            ...piece,
            matrix: nextMatrix,
            rotation: nextRot,
            x: targetX,
            y: targetY,
          });
          sound.playRotate();

          // Reset lock timer on successful rotation
          if (checkCollision(nextMatrix, targetX, targetY + 1)) {
            if (lockMovesCountRef.current < 15) {
              lockMovesCountRef.current += 1;
              if (lockTimeoutRef.current) {
                window.clearTimeout(lockTimeoutRef.current);
                lockTimeoutRef.current = window.setTimeout(lockPiece, 500);
              }
            }
          }
          return;
        }
      }
    },
    [checkCollision, lockPiece]
  );

  // Soft Drop: Move down 1 cell
  const softDrop = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !currentPieceRef.current) return;
    const piece = currentPieceRef.current;

    if (!checkCollision(piece.matrix, piece.x, piece.y + 1)) {
      setCurrentPiece({ ...piece, y: piece.y + 1 });
      setStats((prev) => ({ ...prev, score: prev.score + 1 }));
      sound.playSoftDrop();
    } else {
      // Touched ground, trigger lock sooner
      if (!lockTimeoutRef.current) {
        lockTimeoutRef.current = window.setTimeout(lockPiece, 250);
      }
    }
  }, [checkCollision, lockPiece]);

  // Hard Drop: Instant slam to bottom
  const hardDrop = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !currentPieceRef.current) return;
    const piece = currentPieceRef.current;
    const ghostY = getGhostY(piece);
    const dropDistance = ghostY - piece.y;

    if (dropDistance > 0 || checkCollision(piece.matrix, piece.x, piece.y + 1)) {
      sound.playHardDrop();
      const dropPoints = Math.max(1, dropDistance * 2);
      setStats((prev) => ({
        ...prev,
        score: prev.score + dropPoints,
      }));

      if (dropPoints >= 6) {
        addFloatingScore(
          'Тез түшүрүү',
          dropPoints,
          (piece.x / BOARD_WIDTH) * 100,
          (ghostY / BOARD_HEIGHT) * 100,
          '⚡'
        );
      }

      // Set position and lock immediately
      currentPieceRef.current = { ...piece, y: ghostY };
      setCurrentPiece({ ...piece, y: ghostY });
      lockPiece();
    }
  }, [getGhostY, checkCollision, lockPiece, addFloatingScore]);

  // Hold Piece
  const hold = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !currentPieceRef.current || !canHold)
      return;

    if (lockTimeoutRef.current) {
      window.clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }

    sound.playHold();
    const currentType = currentPieceRef.current.type;

    if (holdPiece === null) {
      setHoldPiece(currentType);
      const nextType = pullNextPiece();
      spawnPiece(nextType, boardRef.current);
    } else {
      setHoldPiece(currentType);
      spawnPiece(holdPiece, boardRef.current);
    }

    setCanHold(false);
  }, [canHold, holdPiece, pullNextPiece, spawnPiece]);

  // Start new game
  const startGame = useCallback(() => {
    if (lockTimeoutRef.current) {
      window.clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }

    sound.init();
    sound.startMusic();
    const freshBoard = createEmptyBoard();
    setBoard(freshBoard);
    boardRef.current = freshBoard;

    // Reset bag
    bagRef.current = [...generateBag(), ...generateBag()];
    const firstType = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 4)]);

    setHoldPiece(null);
    setCanHold(true);
    setClearingRows([]);
    setClearingCells([]);
    setLastAction(null);
    setCurrentBonus(null);
    setFloatingScores([]);
    lastLockedTypeRef.current = null;

    setStats((prev) => ({
      score: 0,
      highScore: prev.highScore,
      lines: 0,
      level: 1,
      combo: 0,
      maxCombo: 0,
      totalBonusPoints: 0,
      wins: 0,
      targetWins: TARGET_WINS,
      pieceCounts: {
        I: 0,
        O: 0,
        T: 0,
        S: 0,
        Z: 0,
        J: 0,
        L: 0,
      },
    }));

    setGameStatus('PLAYING');
    spawnPiece(firstType, freshBoard);
  }, [spawnPiece]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    setGameStatus((prev) => {
      if (prev === 'PLAYING') {
        if (lockTimeoutRef.current) {
          window.clearTimeout(lockTimeoutRef.current);
          lockTimeoutRef.current = null;
        }
        sound.pauseMusic();
        return 'PAUSED';
      }
      if (prev === 'PAUSED') {
        sound.resumeMusic();
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  // Main Gravity Tick Timer
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const speedIndex = Math.min(stats.level - 1, LEVEL_SPEEDS.length - 1);
    const dropInterval = LEVEL_SPEEDS[speedIndex] || 800;

    const timer = window.setInterval(() => {
      const piece = currentPieceRef.current;
      if (!piece) return;

      if (!checkCollision(piece.matrix, piece.x, piece.y + 1)) {
        setCurrentPiece((prev) => (prev ? { ...prev, y: prev.y + 1 } : null));
      } else {
        // Reached bottom / contact with pile
        if (!lockTimeoutRef.current) {
          lockTimeoutRef.current = window.setTimeout(lockPiece, 500);
        }
      }
    }, dropInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [gameStatus, stats.level, checkCollision, lockPiece]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if target is an input or button focused
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameStatusRef.current === 'GAME_OVER' || gameStatusRef.current === 'VICTORY') {
          e.preventDefault();
          startGame();
          return;
        }
      }

      if (gameStatusRef.current !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveHorizontal(1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'x':
        case 'X':
          e.preventDefault();
          rotatePiece(1);
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotatePiece(-1);
          break;
        case ' ': // Space
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          hold();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveHorizontal, rotatePiece, softDrop, hardDrop, hold, togglePause, startGame]);

  const ghostY = getGhostY(currentPiece);

  return {
    board,
    currentPiece,
    ghostY,
    holdPiece,
    canHold,
    nextQueue,
    stats,
    gameStatus,
    clearingRows,
    clearingCells,
    lastAction,
    currentBonus,
    floatingScores,
    startGame,
    togglePause,
    moveHorizontal,
    rotatePiece,
    softDrop,
    hardDrop,
    hold,
  };
}
