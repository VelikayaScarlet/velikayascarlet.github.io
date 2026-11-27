/**
 * 丂棋 (KooChess) - AI Engine
 * Negamax-style alpha-beta search with tactical ordering and richer evaluation.
 */

// ── AI Configuration ───────────────────────────────────

const AI_DEFAULT_DEPTH = 3;
const AI_MAX_DEPTH = 5;
const AI_TIME_LIMIT = 3000; // ms
const AI_MATE_SCORE = 1000000;
const AI_STALEMATE_SCORE = 0;
const AI_ROOT_MOVE_LIMIT = 32;
const AI_SEARCH_MOVE_LIMIT = 16;
const AI_QUIET_MOVE_LIMIT = 12;
let aiSearchDeadline = 0;

// ── Evaluation Helpers ────────────────────────────────

function colorSign(color) {
    return color === RED ? 1 : -1;
}

function centerBonus(row, col) {
    const center = (BOARD_SIZE - 1) / 2;
    const rowDist = Math.abs(row - center);
    const colDist = Math.abs(col - center);
    const maxDist = center || 1;
    return Math.round(((maxDist - rowDist) + (maxDist - colDist)) / (2 * maxDist) * 24);
}

function advancement(row, color) {
    return color === RED ? (BOARD_SIZE - 1 - row) : row;
}

function pawnAdvanceBonus(row, color) {
    return advancement(row, color) * 7;
}

function homeRow(color) {
    return color === RED ? BOARD_SIZE - 1 : 0;
}

function distanceToKing(board, row, col, enemyColor) {
    const king = findKing(board, enemyColor);
    if (!king) return 0;
    return Math.max(Math.abs(row - king.row), Math.abs(col - king.col));
}

function positionBonus(piece, row, col, board) {
    const center = centerBonus(row, col);
    const enemy = opponentColor(piece.color);

    switch (piece.type) {
        case PIECE.SOLDIER:
            return center + pawnAdvanceBonus(row, piece.color);
        case PIECE.SERGEANT:
            return center + pawnAdvanceBonus(row, piece.color) * 0.35 + 10;
        case PIECE.GENERAL:
            return center + 14;
        case PIECE.LIGHT_HORSE:
        case PIECE.HEAVY_HORSE:
            return center + 16;
        case PIECE.LIGHT_CANNON:
        case PIECE.HEAVY_CANNON:
            return center + 6;
        case PIECE.ROOK:
            return center * 0.5;
        case PIECE.BISHOP:
            return center + 6;
        case PIECE.MAGE:
            return center + 10;
        case PIECE.FORTRESS:
            return center * 0.8 + 8;
        case PIECE.GUARD:
            return center + 8;
        case PIECE.KING: {
            const backRankBonus = Math.max(0, 18 - Math.abs(row - homeRow(piece.color)) * 8);
            return backRankBonus - center * 0.35;
        }
        case PIECE.DRAGON: {
            const pressure = Math.max(0, 18 - distanceToKing(board, row, col, enemy) * 3);
            return center + pressure;
        }
        default:
            return center;
    }
}

function countSoldiers(pieces) {
    return pieces.filter(p => p.type === PIECE.SOLDIER).length;
}

function evaluateKingSafety(board, color) {
    const king = findKing(board, color);
    if (!king) return -AI_MATE_SCORE / 2;

    let score = 0;
    const enemy = opponentColor(color);

    if (isSquareAttacked(board, king.row, king.col, enemy)) {
        score -= 260;
    }

    let friendlyCover = 0;
    let enemyNear = 0;
    for (const [dr, dc] of ALL_DIRS) {
        const nr = king.row + dr, nc = king.col + dc;
        if (!inBounds(nr, nc)) continue;
        const p = getPiece(board, nr, nc);
        if (p && p.color === color) friendlyCover++;
        if (isSquareAttacked(board, nr, nc, enemy)) enemyNear++;
    }

    score += friendlyCover * 18;
    score -= enemyNear * 16;
    return score;
}

function evaluateThreats(board, color) {
    let score = 0;
    const enemy = opponentColor(color);
    const pieces = getPiecesOfColor(board, color);

    for (const { row, col, piece } of pieces) {
        if (piece.type === PIECE.KING) continue;

        const value = PIECE_VALUE[piece.type];
        const attacked = isSquareAttacked(board, row, col, enemy);
        const defended = isSquareAttacked(board, row, col, color);

        if (attacked && !defended) {
            score -= Math.min(220, value * 0.38);
        } else if (attacked && defended) {
            score -= Math.min(90, value * 0.16);
        } else if (defended) {
            score += 10;
        }
    }

    return score;
}

function evaluateBoard(board, capturedByRed = [], capturedByBlack = [], mageCooldown = new Map()) {
    let score = 0;
    let redMobility = 0;
    let blackMobility = 0;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            let value = PIECE_VALUE[piece.type] + positionBonus(piece, r, c, board);

            if (piece.type === PIECE.DRAGON && isDragonWeakened(board, r, c)) {
                value -= 130;
            }

            if (piece.type === PIECE.SOLDIER) {
                const lastRow = piece.color === RED ? 0 : BOARD_SIZE - 1;
                if (Math.abs(r - lastRow) <= 1) value += 50;
            }

            const moves = generatePieceMoves(board, r, c).length;
            if (piece.color === RED) {
                redMobility += moves;
                score += value;
            } else {
                blackMobility += moves;
                score -= value;
            }
        }
    }

    score += (redMobility - blackMobility) * 3;
    score += evaluateKingSafety(board, RED) - evaluateKingSafety(board, BLACK);
    score += evaluateThreats(board, RED) - evaluateThreats(board, BLACK);

    // Captured soldiers are a real resource because mages can summon them back.
    score += countSoldiers(capturedByRed) * 32;
    score -= countSoldiers(capturedByBlack) * 32;

    // A mage on cooldown is temporarily less useful.
    for (const [mageId, cooldown] of mageCooldown) {
        const mage = findPieceById(board, mageId);
        if (mage) score -= colorSign(mage.color) * cooldown * 12;
    }

    return score;
}

function findPieceById(board, id) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.id === id) return piece;
        }
    }
    return null;
}

// ── Search State ──────────────────────────────────────

function cloneSearchState(gameState) {
    return {
        board: cloneBoard(gameState.board),
        capturedByRed: gameState.capturedByRed.map(p => ({ ...p })),
        capturedByBlack: gameState.capturedByBlack.map(p => ({ ...p })),
        mageCooldown: new Map(gameState.mageCooldown),
    };
}

function capturedForColor(state, color) {
    return color === RED ? state.capturedByRed : state.capturedByBlack;
}

function decrementCooldowns(cooldowns) {
    const next = new Map(cooldowns);
    for (const [mageId, cooldown] of next) {
        const value = cooldown - 1;
        if (value <= 0) next.delete(mageId);
        else next.set(mageId, value);
    }
    return next;
}

function applySearchMove(state, move, color) {
    const next = {
        board: cloneBoard(state.board),
        capturedByRed: state.capturedByRed.map(p => ({ ...p })),
        capturedByBlack: state.capturedByBlack.map(p => ({ ...p })),
        mageCooldown: decrementCooldowns(state.mageCooldown),
    };

    const piece = getPiece(next.board, move.fromRow, move.fromCol);
    if (!piece) return null;

    if (move.special === 'summon') {
        const captured = capturedForColor(next, color);
        const idx = captured.findIndex(p => p.type === PIECE.SOLDIER);
        if (idx < 0) return null;
        captured.splice(idx, 1);
        setPiece(next.board, move.summonRow, move.summonCol, {
            type: PIECE.SOLDIER,
            color,
            hasMoved: true,
            id: -100000 - move.summonRow * BOARD_SIZE - move.summonCol,
        });
        next.mageCooldown.set(piece.id, 2);
        return next;
    }

    const target = getPiece(next.board, move.toRow, move.toCol);
    if (target) {
        capturedForColor(next, color).push({ ...target });
    }

    movePiece(next.board, move.fromRow, move.fromCol, move.toRow, move.toCol);
    if (move.promoteTo) {
        next.board[move.toRow][move.toCol].type = move.promoteTo;
    }


    return next;
}

function getSearchLegalMoves(state, color) {
    const allMoves = generateAllMoves(state.board, color, capturedForColor(state, color), state.mageCooldown);
    const legalMoves = [];

    for (const move of allMoves) {
        const next = applySearchMove(state, move, color);
        if (next && !isInCheck(next.board, color)) {
            legalMoves.push(move);
        }
    }

    return legalMoves;
}

// ── Move Ordering ──────────────────────────────────────

function scoreMoveForOrdering(move, state, color) {
    const board = state.board;
    const piece = getPiece(board, move.fromRow, move.fromCol);
    const target = getPiece(board, move.toRow, move.toCol);
    let score = 0;

    if (target && piece) {
        score += 10000 + PIECE_VALUE[target.type] * 10 - PIECE_VALUE[piece.type];
    }

    if (move.promoteTo && piece) {
        score += 1800 + PIECE_VALUE[move.promoteTo] - PIECE_VALUE[piece.type];
    }

    if (move.special === 'summon') {
        score += 750;
        const forward = color === RED ? -1 : 1;
        score += Math.max(0, (color === RED ? BOARD_SIZE - 1 - move.summonRow : move.summonRow)) * 20;
        if (Math.abs(move.summonRow - (BOARD_SIZE / 2)) < 2) score += 90;
        if (forward && isSquareAttacked(board, move.summonRow, move.summonCol, opponentColor(color))) score -= 120;
    }

    score += Math.random() * 0.001; // deterministic ties look oddly repetitive in play
    move._orderScore = score;
    return move;
}

function orderMoves(moves, state, color) {
    return moves
        .map(move => scoreMoveForOrdering(move, state, color))
        .sort((a, b) => b._orderScore - a._orderScore);
}

function limitOrderedMoves(orderedMoves, depth, isRoot = false) {
    if (isRoot) return orderedMoves.slice(0, AI_ROOT_MOVE_LIMIT);
    const hasTactics = orderedMoves.some(m => m._orderScore >= 1000);
    const limit = hasTactics ? AI_SEARCH_MOVE_LIMIT : AI_QUIET_MOVE_LIMIT;
    return depth >= 2 ? orderedMoves.slice(0, limit) : orderedMoves;
}

// ── Alpha-Beta Search ─────────────────────────────────

function terminalScore(board, color, ply) {
    if (isInCheck(board, color)) {
        return color === RED ? -AI_MATE_SCORE + ply : AI_MATE_SCORE - ply;
    }
    return AI_STALEMATE_SCORE;
}

function minimax(state, depth, alpha, beta, color, ply = 0) {
    if (aiSearchDeadline && Date.now() > aiSearchDeadline) {
        throw new Error('AI_TIMEOUT');
    }
    const legalMoves = getSearchLegalMoves(state, color);

    if (legalMoves.length === 0) {
        return terminalScore(state.board, color, ply);
    }

    if (depth === 0) {
        return evaluateBoard(state.board, state.capturedByRed, state.capturedByBlack, state.mageCooldown);
    }

    const maximizing = color === RED;
    const orderedMoves = limitOrderedMoves(orderMoves(legalMoves, state, color), depth);
    const nextColor = opponentColor(color);

    if (maximizing) {
        let best = -Infinity;
        for (const move of orderedMoves) {
            const next = applySearchMove(state, move, color);
            if (!next) continue;
            const score = minimax(next, depth - 1, alpha, beta, nextColor, ply + 1);
            best = Math.max(best, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return best;
    }

    let best = Infinity;
    for (const move of orderedMoves) {
        const next = applySearchMove(state, move, color);
        if (!next) continue;
        const score = minimax(next, depth - 1, alpha, beta, nextColor, ply + 1);
        best = Math.min(best, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
    }
    return best;
}

// ── AI Move Selection ──────────────────────────────────

function findBestMove(gameState, depth = AI_DEFAULT_DEPTH) {
    const color = gameState.currentTurn;
    const root = cloneSearchState(gameState);
    const legalMoves = getSearchLegalMoves(root, color);

    if (legalMoves.length === 0) return null;

    const searchDepth = Math.max(1, Math.min(depth, AI_MAX_DEPTH));
    const rootIsMaximizing = color === RED;
    const orderedMoves = limitOrderedMoves(orderMoves(legalMoves, root, color), searchDepth, true);
    const opponent = opponentColor(color);

    let bestMove = orderedMoves[0];
    let bestScore = evaluateBoard(root.board, root.capturedByRed, root.capturedByBlack, root.mageCooldown);
    aiSearchDeadline = Date.now() + AI_TIME_LIMIT;

    for (let currentDepth = 1; currentDepth <= searchDepth; currentDepth++) {
        let depthBestMove = bestMove;
        let depthBestScore = rootIsMaximizing ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;
        let completedDepth = true;

        try {
            for (const move of orderedMoves) {
                if (Date.now() > aiSearchDeadline) throw new Error('AI_TIMEOUT');

                const next = applySearchMove(root, move, color);
                if (!next) continue;

                const score = minimax(next, currentDepth - 1, alpha, beta, opponent, 1);

                if ((rootIsMaximizing && score > depthBestScore) || (!rootIsMaximizing && score < depthBestScore)) {
                    depthBestScore = score;
                    depthBestMove = move;
                }

                if (rootIsMaximizing) alpha = Math.max(alpha, score);
                else beta = Math.min(beta, score);
            }
        } catch (err) {
            if (!err || err.message !== 'AI_TIMEOUT') throw err;
            completedDepth = false;
        }

        if (!completedDepth) break;
        bestMove = depthBestMove;
        bestScore = depthBestScore;
    }

    aiSearchDeadline = 0;
    delete bestMove._orderScore;
    return { move: bestMove, score: bestScore };
}

function findBestMoveAsync(gameState, depth = AI_DEFAULT_DEPTH) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = findBestMove(gameState, depth);
            resolve(result);
        }, 50);
    });
}








