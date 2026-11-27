/**
 * 丂棋 (KooChess) - Board State Management
 */

// ── Board Utilities ────────────────────────────────────

/** Deep-clone a board (11×11 2D array of piece objects) */
function cloneBoard(board) {
    return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

/** Check if coordinates are within bounds */
function inBounds(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/** Get piece at given position, or null */
function getPiece(board, row, col) {
    if (!inBounds(row, col)) return null;
    return board[row][col];
}

/** Set piece at given position */
function setPiece(board, row, col, piece) {
    board[row][col] = piece;
}

/** Move piece from one square to another (mutates board) */
function movePiece(board, fromRow, fromCol, toRow, toCol) {
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = null;
    if (board[toRow][toCol]) {
        board[toRow][toCol].hasMoved = true;
    }
}

/** Remove piece at position (for captures) */
function removePiece(board, row, col) {
    board[row][col] = null;
}

/** Apply a move to a cloned board and return the new board */
function applyMove(board, move) {
    const newBoard = cloneBoard(board);
    const piece = getPiece(newBoard, move.fromRow, move.fromCol);
    if (!piece) return null;

    if (move.special === 'summon') {
        // Summon: place a captured soldier adjacent to the mage
        const capturedPiece = { type: PIECE.SOLDIER, color: piece.color, hasMoved: true, id: nextPieceId() };
        setPiece(newBoard, move.summonRow, move.summonCol, capturedPiece);
        return newBoard;
    }

    // Normal move
    movePiece(newBoard, move.fromRow, move.fromCol, move.toRow, move.toCol);

    // Handle promotion
    if (move.promoteTo) {
        newBoard[move.toRow][move.toCol].type = move.promoteTo;
    }


    return newBoard;
}

/** Find the king of a given color on the board */
function findKing(board, color) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.type === PIECE.KING && piece.color === color) {
                return { row: r, col: c };
            }
        }
    }
    return null; // Should never happen in a valid game
}

/** Find all mages of a given color */
function findMages(board, color) {
    const mages = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.type === PIECE.MAGE && piece.color === color) {
                mages.push({ row: r, col: c });
            }
        }
    }
    return mages;
}

/** Get all pieces of a given color */
function getPiecesOfColor(board, color) {
    const pieces = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.color === color) {
                pieces.push({ row: r, col: c, piece });
            }
        }
    }
    return pieces;
}

/** Generate a string key for the board position (for threefold repetition) */
function boardKey(board, currentTurn) {
    let key = currentTurn + '|';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p) {
                key += `${p.type[0]}${p.color[0]}${r}${c}|`;
            }
        }
    }
    return key;
}

/** Check if a Dragon is weakened by an enemy Mage diagonally adjacent */
function isDragonWeakened(board, row, col) {
    const piece = getPiece(board, row, col);
    if (!piece || piece.type !== PIECE.DRAGON) return false;
    const enemyColor = opponentColor(piece.color);
    for (const [dr, dc] of DIAGONAL) {
        const nr = row + dr, nc = col + dc;
        const p = getPiece(board, nr, nc);
        if (p && p.type === PIECE.MAGE && p.color === enemyColor) {
            return true;
        }
    }
    return false;
}


/** Check if a square is attacked by any piece of the given color */
function isSquareAttacked(board, row, col, attackerColor) {
    // Check all 8 adjacent squares for king-like attackers (General, Fortress, King)
    for (const [dr, dc] of ALL_DIRS) {
        const nr = row + dr, nc = col + dc;
        const p = getPiece(board, nr, nc);
        if (p && p.color === attackerColor) {
            if (p.type === PIECE.GENERAL || p.type === PIECE.FORTRESS || p.type === PIECE.KING) {
                return true;
            }
        }
    }

    // Fortress 2-step orthogonal attack: 2 steps away with empty first step
    for (const [dr, dc] of ORTHOGONAL) {
        const midR = row + dr, midC = col + dc;
        const farR = row + dr * 2, farC = col + dc * 2;
        if (inBounds(midR, midC) && inBounds(farR, farC)) {
            if (!getPiece(board, midR, midC)) {
                const p = getPiece(board, farR, farC);
                if (p && p.color === attackerColor && p.type === PIECE.FORTRESS) {
                    return true;
                }
            }
        }
    }

    // Check orthogonal directions for sliding attackers (Rook, Dragon) and Mage
    for (const [dr, dc] of ORTHOGONAL) {
        let steps = 1;
        let nr = row + dr, nc = col + dc;
        while (inBounds(nr, nc)) {
            const p = getPiece(board, nr, nc);
            if (p) {
                if (p.color === attackerColor) {
                    // Rook: always full sliding along orthogonals
                    if (p.type === PIECE.ROOK) return true;
                    // Dragon: full sliding unless weakened by enemy Mage
                    if (p.type === PIECE.DRAGON) {
                        if (!isDragonWeakened(board, nr, nc) || steps === 1) return true;
                    }
                    // Mage: adjacent only
                    if (steps === 1 && p.type === PIECE.MAGE) return true;
                }
                break; // Blocked by piece
            }
            steps++;
            nr += dr; nc += dc;
        }
    }

    // Check diagonal directions for sliding attackers (Bishop, Dragon)
    for (const [dr, dc] of DIAGONAL) {
        let steps = 1;
        let nr = row + dr, nc = col + dc;
        while (inBounds(nr, nc)) {
            const p = getPiece(board, nr, nc);
            if (p) {
                if (p.color === attackerColor) {
                    // Bishop: always full sliding along diagonals
                    if (p.type === PIECE.BISHOP) return true;
                    // Dragon: full sliding unless weakened by enemy Mage
                    if (p.type === PIECE.DRAGON) {
                        if (!isDragonWeakened(board, nr, nc) || steps === 1) return true;
                    }
                }
                break;
            }
            steps++;
            nr += dr; nc += dc;
        }
    }

    // Check Guard attack: diagonal up to 2, orthogonal up to 1
    for (const [dr, dc] of DIAGONAL) {
        for (let dist = 1; dist <= 2; dist++) {
            const nr = row + dr * dist, nc = col + dc * dist;
            const p = getPiece(board, nr, nc);
            if (p) {
                if (p.color === attackerColor && p.type === PIECE.GUARD) {
                    return true;
                }
                break; // Blocked
            }
        }
    }

    // Check Soldier/Sergeant attacks
    // Soldier attacks forward (one step forward, forward-left, forward-right)
    const fwd = forwardDir(attackerColor);
    const soldierDirs = [fwd, [fwd[0] + DIR.W[0], fwd[1] + DIR.W[1]], [fwd[0] + DIR.E[0], fwd[1] + DIR.E[1]]];
    for (const [dr, dc] of soldierDirs) {
        const nr = row - dr, nc = col - dc;
        const p = getPiece(board, nr, nc);
        if (p && p.color === attackerColor && p.type === PIECE.SOLDIER) {
            return true;
        }
    }

    // Sergeant attacks orthogonally
    for (const [dr, dc] of ORTHOGONAL) {
        const nr = row + dr, nc = col + dc;
        const p = getPiece(board, nr, nc);
        if (p && p.color === attackerColor && p.type === PIECE.SERGEANT) {
            return true;
        }
    }

    // Knight attacks (LightHorse) - L shape
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
        const nr = row + dr, nc = col + dc;
        const p = getPiece(board, nr, nc);
        if (p && p.color === attackerColor && p.type === PIECE.LIGHT_HORSE) {
            return true;
        }
    }

    // HeavyHorse attacks: orthogonal step then knight move
    // (can't capture at knight distance, so only check if adjacent)
    for (const [dr, dc] of ORTHOGONAL) {
        const nr = row + dr, nc = col + dc;
        const p = getPiece(board, nr, nc);
        if (p && p.color === attackerColor && p.type === PIECE.HEAVY_HORSE) {
            return true;
        }
    }

    // Gun attacks forward only: direct within 3 squares with no screen, or over exactly one screen.
    {
        const [fdr, fdc] = forwardDir(attackerColor);
        let piecesBetween = 0;
        let dist = 1;
        let nr = row - fdr, nc = col - fdc;
        while (inBounds(nr, nc)) {
            const p = getPiece(board, nr, nc);
            if (p) {
                if (p.color === attackerColor && p.type === PIECE.LIGHT_CANNON) {
                    if ((piecesBetween === 0 && dist <= 3) || piecesBetween === 1) return true;
                }
                piecesBetween++;
                if (piecesBetween > 1) break;
            }
            nr -= fdr;
            nc -= fdc;
            dist++;
        }
    }

    // Cannon attacks orthogonally over exactly one screen, hitting the first piece behind it.
    for (const [dr, dc] of ORTHOGONAL) {
        let screenFound = false;
        let nr = row + dr, nc = col + dc;
        while (inBounds(nr, nc)) {
            const p = getPiece(board, nr, nc);
            if (p) {
                if (!screenFound) {
                    screenFound = true;
                } else {
                    if (p.color === attackerColor && p.type === PIECE.HEAVY_CANNON) return true;
                    break;
                }
            }
            nr += dr;
            nc += dc;
        }
    }

    return false;
}





