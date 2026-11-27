/**
 * 丂棋 (KooChess) - Game Controller
 * Handles game state, move execution, check/checkmate detection,
 * promotion, summon cooldown, threefold repetition, and 50-move rule.
 */

// ── Game State ─────────────────────────────────────────

function createGameState() {
    return {
        board: BOARD_SIZE === 8 ? createInitialBoardLite() : createInitialBoard(),
        currentTurn: RED,           // Red moves first
        capturedByRed: [],          // Pieces captured by red (black pieces)
        capturedByBlack: [],        // Pieces captured by black (red pieces)
        moveHistory: [],            // Array of { move, captured, wasPromotion, prevType }
        mageCooldown: new Map(),    // Map of mage piece ID -> turns until can summon again
        positionHistory: new Map(), // For threefold repetition: boardKey -> count
        halfMoveClock: 0,           // For 50-move rule (resets on capture or soldier move)
        fullMoveNumber: 1,
        gameOver: false,
        winner: null,
        gameOverReason: null,
        inCheck: false,
    };
}

// ── Check Detection ────────────────────────────────────

function isInCheck(board, color) {
    const king = findKing(board, color);
    if (!king) return true; // King captured = in check (shouldn't happen)
    return isSquareAttacked(board, king.row, king.col, opponentColor(color));
}

// ── Legal Move Filtering ───────────────────────────────

/** Get all legal moves for a given color (filters out moves that leave own king in check) */
function getLegalMoves(gameState, color) {
    const { board, capturedByRed, capturedByBlack, mageCooldown } = gameState;
    const capturedPieces = color === RED ? capturedByRed : capturedByBlack;
    const allMoves = generateAllMoves(board, color, capturedPieces, mageCooldown);
    const legalMoves = [];

    for (const move of allMoves) {
        const newBoard = applyMove(board, move);
        if (newBoard && !isInCheck(newBoard, color)) {
            legalMoves.push(move);
        }
    }

    return legalMoves;
}

/** Get all legal moves for the current player */
function getCurrentLegalMoves(gameState) {
    if (gameState.gameOver) return [];
    return getLegalMoves(gameState, gameState.currentTurn);
}

// ── Move Execution ─────────────────────────────────────

/**
 * Attempt to make a move. Returns true if successful, false if illegal.
 * Mutates gameState.
 */
function makeMove(gameState, move) {
    if (gameState.gameOver) return false;

    // Validate move is legal
    const legalMoves = getCurrentLegalMoves(gameState);
    const matchingMove = legalMoves.find(m =>
        m.fromRow === move.fromRow && m.fromCol === move.fromCol &&
        m.toRow === move.toRow && m.toCol === move.toCol &&
        m.special === move.special &&
        (m.special !== 'summon' || (m.summonRow === move.summonRow && m.summonCol === move.summonCol))
    );

    if (!matchingMove) return false;

    const piece = getPiece(gameState.board, move.fromRow, move.fromCol);
    if (!piece || piece.color !== gameState.currentTurn) return false;

    const target = getPiece(gameState.board, move.toRow, move.toCol);
    const color = gameState.currentTurn;
    const opponent = opponentColor(color);

    // Save move info for undo
    const historyEntry = {
        move: { ...matchingMove },
        captured: target ? { ...target } : null,
        wasPromotion: !!matchingMove.promoteTo,
        prevType: piece.type,
        prevHasMoved: piece.hasMoved,
        halfMoveClock: gameState.halfMoveClock,
        mageCooldownSnapshot: new Map(gameState.mageCooldown),
    };

    // Handle summon
    if (matchingMove.special === 'summon') {
        const capturedPieces = color === RED ? gameState.capturedByRed : gameState.capturedByBlack;
        // Remove a captured soldier from the list
        const idx = capturedPieces.findIndex(p => p.type === PIECE.SOLDIER);
        if (idx >= 0) {
            capturedPieces.splice(idx, 1);
            setPiece(gameState.board, matchingMove.summonRow, matchingMove.summonCol,
                { id: nextPieceId(), type: PIECE.SOLDIER, color, hasMoved: true });
        }

        // Reduce existing mage cooldowns before applying cooldown to the summoning mage
        decrementMageCooldowns(gameState);
        gameState.mageCooldown.set(piece.id, 2); // Can't summon next turn (cooldown of 1 turn = value 2)

        // Update half-move clock (summon is not a capture or pawn move)
        gameState.halfMoveClock++;

        finalizeTurn(gameState, opponent, historyEntry);
        return true;
    }

    // Execute normal move
    const capturedPiece = target;
    movePiece(gameState.board, move.fromRow, move.fromCol, move.toRow, move.toCol);

    // Handle promotion
    if (matchingMove.promoteTo) {
        gameState.board[move.toRow][move.toCol].type = matchingMove.promoteTo;
    }


    // Track captured pieces
    if (capturedPiece) {
        if (color === RED) {
            gameState.capturedByRed.push(capturedPiece);
        } else {
            gameState.capturedByBlack.push(capturedPiece);
        }
        // Reset half-move clock on capture
        gameState.halfMoveClock = 0;
    } else if (piece.type === PIECE.SOLDIER) {
        // Reset on soldier move
        gameState.halfMoveClock = 0;
    } else {
        gameState.halfMoveClock++;
    }

    decrementMageCooldowns(gameState);
    finalizeTurn(gameState, opponent, historyEntry);
    return true;
}

function decrementMageCooldowns(gameState) {
    for (const [mageId, cooldown] of gameState.mageCooldown) {
        if (cooldown > 1) {
            gameState.mageCooldown.set(mageId, cooldown - 1);
        } else {
            gameState.mageCooldown.delete(mageId);
        }
    }
}

function finalizeTurn(gameState, previousPlayer, historyEntry) {
    // Record position for threefold repetition
    recordPosition(gameState);

    // Switch turns
    switchTurn(gameState);

    // Update check status
    gameState.inCheck = isInCheck(gameState.board, gameState.currentTurn);

    // Check for checkmate or stalemate
    const nextLegalMoves = getCurrentLegalMoves(gameState);
    if (nextLegalMoves.length === 0) {
        gameState.gameOver = true;
        if (gameState.inCheck) {
            gameState.winner = previousPlayer;
            gameState.gameOverReason = 'checkmate';
        } else {
            gameState.gameOverReason = 'stalemate';
        }
    }

    // Check 50-move rule
    if (gameState.halfMoveClock >= 100) { // 50 moves = 100 half-moves
        gameState.gameOver = true;
        gameState.gameOverReason = 'fiftyMove';
    }

    // Check threefold repetition
    if (isThreefoldRepetition(gameState)) {
        gameState.gameOver = true;
        gameState.gameOverReason = 'threefold';
    }

    gameState.moveHistory.push(historyEntry);
}

// ── Turn Management ────────────────────────────────────

function switchTurn(gameState) {
    gameState.currentTurn = opponentColor(gameState.currentTurn);
    if (gameState.currentTurn === RED) {
        gameState.fullMoveNumber++;
    }
}

// ── Position Repetition ────────────────────────────────

function recordPosition(gameState) {
    const key = boardKey(gameState.board, gameState.currentTurn);
    gameState.positionHistory.set(key, (gameState.positionHistory.get(key) || 0) + 1);
}

function isThreefoldRepetition(gameState) {
    for (const count of gameState.positionHistory.values()) {
        if (count >= 3) return true;
    }
    return false;
}

// ── Undo ───────────────────────────────────────────────

function undoMove(gameState) {
    if (gameState.moveHistory.length === 0) return false;
    if (gameState.gameOver) return false; // Can't undo after game over

    const entry = gameState.moveHistory.pop();
    const move = entry.move;
    const color = opponentColor(gameState.currentTurn); // Undo the switch

    // Revert turn
    gameState.currentTurn = color;
    if (color === RED) {
        gameState.fullMoveNumber--;
    }

    // Restore half-move clock
    gameState.halfMoveClock = entry.halfMoveClock;

    // Handle summon undo
    if (move.special === 'summon') {
        // Remove summoned piece and return to captured list
        removePiece(gameState.board, move.summonRow, move.summonCol);
        const capturedPieces = color === RED ? gameState.capturedByRed : gameState.capturedByBlack;
        capturedPieces.push({ type: PIECE.SOLDIER, color: opponentColor(color), hasMoved: true });
    } else {
        // Move piece back
        const piece = getPiece(gameState.board, move.toRow, move.toCol);
        if (piece) {
            piece.hasMoved = entry.prevHasMoved;
            if (entry.wasPromotion) {
                piece.type = entry.prevType;
            }
        }
        // Move back
        gameState.board[move.fromRow][move.fromCol] = piece;
        gameState.board[move.toRow][move.toCol] = entry.captured;


        // Return captured piece
        if (entry.captured) {
            const capturedPieces = color === RED ? gameState.capturedByRed : gameState.capturedByBlack;
            // Find last matching captured piece
            let idx = -1;
            for (let i = capturedPieces.length - 1; i >= 0; i--) {
                if (capturedPieces[i].type === entry.captured.type &&
                    capturedPieces[i].color === entry.captured.color) {
                    idx = i;
                    break;
                }
            }
            if (idx >= 0) capturedPieces.splice(idx, 1);
        }
    }

    // Restore mage cooldown
    gameState.mageCooldown = entry.mageCooldownSnapshot;

    // Update position history
    const key = boardKey(gameState.board, gameState.currentTurn);
    const count = gameState.positionHistory.get(key) || 1;
    if (count <= 1) {
        gameState.positionHistory.delete(key);
    } else {
        gameState.positionHistory.set(key, count - 1);
    }

    // Reset game over status
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.gameOverReason = null;
    gameState.inCheck = isInCheck(gameState.board, gameState.currentTurn);

    return true;
}

// ── Game Info ──────────────────────────────────────────

function getGameStatusText(gameState) {
    if (gameState.gameOver) {
        if (gameState.gameOverReason === 'checkmate') {
            const winner = gameState.winner === RED ? '红方' : '黑方';
            return `${winner}获胜！（将死）`;
        } else if (gameState.gameOverReason === 'stalemate') {
            return '和棋！（无子可走）';
        } else if (gameState.gameOverReason === 'fiftyMove') {
            return '和棋！（50步无进展）';
        } else if (gameState.gameOverReason === 'threefold') {
            return '和棋！（三次重复局面）';
        }
        return '游戏结束';
    }

    const turnText = gameState.currentTurn === RED ? '红方' : '黑方';
    let status = `${turnText}走棋`;
    if (gameState.inCheck) {
        status += ' — 将军！';
    }
    return status;
}

/** Get captured pieces display */
function getCapturedDisplay(gameState, color) {
    const pieces = color === RED ? gameState.capturedByRed : gameState.capturedByBlack;
    // Return display names for captured pieces
    return pieces.map(p => PIECE_NAME[p.type][p.color === RED ? 'red' : 'black']);
}




