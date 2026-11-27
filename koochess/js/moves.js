/**
 * 丂棋 (KooChess) - Move Generation
 * Generates pseudo-legal moves for all piece types.
 * (Does NOT filter for leaving own king in check — that's done in game.js)
 */

// ── Move Generation ────────────────────────────────────

/**
 * Generate all pseudo-legal moves for a piece at (row, col).
 * Returns array of move objects: { fromRow, fromCol, toRow, toCol, promoteTo?, special?, summonRow?, summonCol? }
 */
function generatePieceMoves(board, row, col) {
    const piece = getPiece(board, row, col);
    if (!piece) return [];

    const moves = [];
    const color = piece.color;
    const type = piece.type;

    switch (type) {
        case PIECE.SOLDIER:      generateSoldierMoves(board, row, col, piece, moves); break;
        case PIECE.SERGEANT:     generateSergeantMoves(board, row, col, piece, moves); break;
        case PIECE.GENERAL:      generateGeneralMoves(board, row, col, piece, moves); break;
        case PIECE.LIGHT_CANNON: generateLightCannonMoves(board, row, col, piece, moves); break;
        case PIECE.LIGHT_HORSE:  generateLightHorseMoves(board, row, col, piece, moves); break;
        case PIECE.HEAVY_CANNON: generateHeavyCannonMoves(board, row, col, piece, moves); break;
        case PIECE.HEAVY_HORSE:  generateHeavyHorseMoves(board, row, col, piece, moves); break;
        case PIECE.ROOK:         generateSlidingMoves(board, row, col, piece, ORTHOGONAL, moves); break;
        case PIECE.BISHOP:       generateSlidingMoves(board, row, col, piece, DIAGONAL, moves); break;
        case PIECE.MAGE:         generateMageMoves(board, row, col, piece, moves); break;
        case PIECE.FORTRESS:     generateFortressMoves(board, row, col, piece, moves); break;
        case PIECE.GUARD:        generateGuardMoves(board, row, col, piece, moves); break;
        case PIECE.KING:         generateKingMoves(board, row, col, piece, moves); break;
        case PIECE.DRAGON:       generateDragonMoves(board, row, col, piece, moves); break;
    }

    return moves;
}

/** Add a move with promotion check */
function addMove(board, fromRow, fromCol, toRow, toCol, piece, moves) {
    const target = getPiece(board, toRow, toCol);

    // Can't capture own piece
    if (target && target.color === piece.color) return;

    // Fortress can only be captured by Cannon, King, Dragon
    if (target && target.color !== piece.color && target.type === PIECE.FORTRESS) {
        if (piece.type !== PIECE.HEAVY_CANNON &&
            piece.type !== PIECE.KING &&
            piece.type !== PIECE.DRAGON) {
            return; // This piece cannot capture the Fortress
        }
    }

    const move = { fromRow, fromCol, toRow, toCol };

    // Soldier reaches last row → promote to Sergeant
    const lastRow = piece.color === RED ? 0 : BOARD_SIZE - 1;
    if (piece.type === PIECE.SOLDIER && toRow === lastRow) {
        move.promoteTo = PIECE.SERGEANT;
    }

    // Check capture promotion
    if (target && target.color !== piece.color) {
        if (piece.type === PIECE.SOLDIER && triggersPromotion(target.type)) {
            move.promoteTo = PIECE.SERGEANT;
        } else if (piece.type === PIECE.SERGEANT && triggersPromotion(target.type)) {
            move.promoteTo = PIECE.GENERAL;
        }
    }

    moves.push(move);
}

// ── Soldier (兵) ────────────────────────────────────────
// First move: forward, forward-left, forward-right (one step each)
// After first move: forward only (one step)
// Capture: same as movement (forward 3 directions)
function generateSoldierMoves(board, row, col, piece, moves) {
    const fwd = forwardDir(piece.color);
    const fwdLeft =  [fwd[0] + DIR.W[0], fwd[1] + DIR.W[1]];
    const fwdRight = [fwd[0] + DIR.E[0], fwd[1] + DIR.E[1]];

    const dirs = piece.hasMoved ? [fwd] : [fwd, fwdLeft, fwdRight];

    for (const [dr, dc] of dirs) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        const target = getPiece(board, tr, tc);

        // Soldier moves and captures forward only
        if (!target || target.color !== piece.color) {
            addMove(board, row, col, tr, tc, piece, moves);
        }
    }
}

// ── Sergeant (士) ──────────────────────────────────────
// Moves and captures: forward, back, left, right (one step each)
function generateSergeantMoves(board, row, col, piece, moves) {
    for (const [dr, dc] of ORTHOGONAL) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        const target = getPiece(board, tr, tc);
        if (!target || target.color !== piece.color) {
            addMove(board, row, col, tr, tc, piece, moves);
        }
    }
}

// ── General (长) ───────────────────────────────────────
// All 8 directions, one step
function generateGeneralMoves(board, row, col, piece, moves) {
    for (const [dr, dc] of ALL_DIRS) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        const target = getPiece(board, tr, tc);
        if (!target || target.color !== piece.color) {
            addMove(board, row, col, tr, tc, piece, moves);
        }
    }
}

// ── Gun (枪) ───────────────────────────────────────
// Move: 1-2 steps orthogonally (no capture)
// Capture: forward only; direct within 3 squares, or over one screen at any distance
function generateLightCannonMoves(board, row, col, piece, moves) {
    // Non-capture movement: 1-2 steps orthogonally
    for (const [dr, dc] of ORTHOGONAL) {
        for (let dist = 1; dist <= 2; dist++) {
            const tr = row + dr * dist, tc = col + dc * dist;
            if (!inBounds(tr, tc)) break;
            if (getPiece(board, tr, tc)) break;
            moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
        }
    }

    // Capture: forward only
    const [dr, dc] = forwardDir(piece.color);
    let screenFound = false;
    let nr = row + dr, nc = col + dc;
    let dist = 1;

    while (inBounds(nr, nc)) {
        const target = getPiece(board, nr, nc);
        if (target) {
            if (!screenFound) {
                // No screen yet: can directly shoot only the first 3 forward squares.
                if (dist <= 3 && target.color !== piece.color) {
                    addMove(board, row, col, nr, nc, piece, moves);
                }
                screenFound = true;
            } else {
                // One screen found: capture the first piece beyond it at any distance.
                if (target.color !== piece.color) {
                    addMove(board, row, col, nr, nc, piece, moves);
                }
                break;
            }
        }
        nr += dr;
        nc += dc;
        dist++;
    }
}

// ── LightHorse (轻骑兵) ─────────────────────────────────
// L-shape (like chess knight)
function generateLightHorseMoves(board, row, col, piece, moves) {
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        addMove(board, row, col, tr, tc, piece, moves);
    }
}

// ── Cannon (炮) ─────────────────────────────────────
// Move: 1 step orthogonally (no capture)
// Capture: exactly one screen, then the first enemy piece behind it
function generateHeavyCannonMoves(board, row, col, piece, moves) {
    // Non-capture movement: 1 step orthogonally
    for (const [dr, dc] of ORTHOGONAL) {
        const tr = row + dr, tc = col + dc;
        if (inBounds(tr, tc) && !getPiece(board, tr, tc)) {
            moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
        }
    }

    // Capture: exactly one screen, then the first enemy piece behind it.
    for (const [dr, dc] of ORTHOGONAL) {
        let screen = null;
        let nr = row + dr, nc = col + dc;
        while (inBounds(nr, nc)) {
            const target = getPiece(board, nr, nc);
            if (target) {
                if (!screen) {
                    screen = target;
                } else {
                    if (target.color !== piece.color) {
                        addMove(board, row, col, nr, nc, piece, moves);
                    }
                    break;
                }
            }
            nr += dr;
            nc += dc;
        }
    }
}

// ── HeavyHorse (重骑兵) ─────────────────────────────────
// Move: 1 step orthogonally (must be empty), then knight jump (can capture)
// Only the knight jump destination can be a capture
function generateHeavyHorseMoves(board, row, col, piece, moves) {
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dr, dc] of ORTHOGONAL) {
        const midRow = row + dr, midCol = col + dc;
        // First step must be to an empty square
        if (!inBounds(midRow, midCol)) continue;
        if (getPiece(board, midRow, midCol)) continue;

        // Knight jump from the intermediate position
        for (const [kr, kc] of knightMoves) {
            const tr = midRow + kr, tc = midCol + kc;
            if (!inBounds(tr, tc)) continue;
            const target = getPiece(board, tr, tc);
            if (!target || target.color !== piece.color) {
                // HeavyHorse cannot capture Fortress
                if (target && target.type === PIECE.FORTRESS) continue;
                const move = { fromRow: row, fromCol: col, toRow: tr, toCol: tc };
                moves.push(move);
            }
        }
    }
}

// ── Sliding pieces (Rook, Bishop, Dragon) ──────────────
function generateSlidingMoves(board, row, col, piece, directions, moves) {
    for (const [dr, dc] of directions) {
        let nr = row + dr, nc = col + dc;
        while (inBounds(nr, nc)) {
            const target = getPiece(board, nr, nc);
            if (target) {
                if (target.color !== piece.color) {
                    addMove(board, row, col, nr, nc, piece, moves);
                }
                break;
            }
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc });
            nr += dr; nc += dc;
        }
    }
}

// ── Mage (法) ──────────────────────────────────────────
// Move: 1 step orthogonally (can capture)
// Special: can summon a captured soldier to adjacent 8 squares
function generateMageMoves(board, row, col, piece, moves) {
    for (const [dr, dc] of ORTHOGONAL) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        addMove(board, row, col, tr, tc, piece, moves);
    }
    // Summon moves are generated in game.js (need captured pieces list)
}

// ── Fortress (堡) ──────────────────────────────────────
// Orthogonal (N/S/E/W): up to 2 steps (first step must be empty for 2nd).
// Diagonal: 1 step only.
// No cooldown.
// Can only BE captured by Cannon, King, Dragon (handled elsewhere).
function generateFortressMoves(board, row, col, piece, moves) {
    for (const [dr, dc] of ALL_DIRS) {
        const isOrtho = (dr === 0 || dc === 0);

        // 1-step (all directions)
        const tr1 = row + dr, tc1 = col + dc;
        if (inBounds(tr1, tc1)) {
            const t1 = getPiece(board, tr1, tc1);
            if (!t1 || t1.color !== piece.color) {
                addMove(board, row, col, tr1, tc1, piece, moves);
            }
        }

        // 2-step (orthogonal only, first step must be empty)
        if (isOrtho) {
            const tr2 = row + dr * 2, tc2 = col + dc * 2;
            if (inBounds(tr2, tc2) && !getPiece(board, tr1, tc1)) {
                const t2 = getPiece(board, tr2, tc2);
                if (!t2 || t2.color !== piece.color) {
                    addMove(board, row, col, tr2, tc2, piece, moves);
                }
            }
        }
    }
}

// ── Guard (护) ─────────────────────────────────────────
// Diagonal: up to 2 steps. Orthogonal: up to 1 step.
function generateGuardMoves(board, row, col, piece, moves) {
    // Diagonal: up to 2
    for (const [dr, dc] of DIAGONAL) {
        for (let dist = 1; dist <= 2; dist++) {
            const tr = row + dr * dist, tc = col + dc * dist;
            if (!inBounds(tr, tc)) break;
            const target = getPiece(board, tr, tc);
            if (target) {
                if (target.color !== piece.color) {
                    addMove(board, row, col, tr, tc, piece, moves);
                }
                break;
            }
            moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc });
        }
    }
    // Orthogonal: up to 1
    for (const [dr, dc] of ORTHOGONAL) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        addMove(board, row, col, tr, tc, piece, moves);
    }
}

// ── Dragon (龙) ────────────────────────────────────────
// Like chess Queen (all 8 directions sliding).
// BUT: if any enemy Mage is diagonally adjacent, Dragon is weakened
// and can only move 1 step this turn.
function generateDragonMoves(board, row, col, piece, moves) {
    // Check if any enemy Mage is diagonally adjacent
    let mageNearby = false;
    const enemyColor = opponentColor(piece.color);
    for (const [dr, dc] of DIAGONAL) {
        const nr = row + dr, nc = col + dc;
        const p = getPiece(board, nr, nc);
        if (p && p.type === PIECE.MAGE && p.color === enemyColor) {
            mageNearby = true;
            break;
        }
    }

    if (mageNearby) {
        // Weakened: only 1 step in any direction
        for (const [dr, dc] of ALL_DIRS) {
            const tr = row + dr, tc = col + dc;
            if (!inBounds(tr, tc)) continue;
            addMove(board, row, col, tr, tc, piece, moves);
        }
    } else {
        // Full power: slide in all 8 directions
        generateSlidingMoves(board, row, col, piece, ALL_DIRS, moves);
    }
}

// ── King (王) ──────────────────────────────────────────
// All 8 directions, one step
function generateKingMoves(board, row, col, piece, moves) {
    for (const [dr, dc] of ALL_DIRS) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        addMove(board, row, col, tr, tc, piece, moves);
    }
}

// ── Summon Moves (for Mage) ────────────────────────────
// Generate summon moves: place captured soldier on empty diagonal adjacent square
function generateSummonMoves(board, row, col, piece, capturedPieces) {
    const moves = [];
    // Filter captured pieces that are soldiers
    const capturedSoldiers = capturedPieces.filter(p => p.type === PIECE.SOLDIER);
    if (capturedSoldiers.length === 0) return moves;

    // Check diagonal 4 squares for empty spots
    for (const [dr, dc] of DIAGONAL) {
        const tr = row + dr, tc = col + dc;
        if (!inBounds(tr, tc)) continue;
        if (!getPiece(board, tr, tc)) {
            moves.push({
                fromRow: row, fromCol: col,
                toRow: row, toCol: col, // Mage doesn't move
                special: 'summon',
                summonRow: tr, summonCol: tc,
            });
        }
    }
    return moves;
}

// ── Generate ALL moves for a color (pseudo-legal) ──────
function generateAllMoves(board, color, capturedPieces, mageCooldown) {
    const moves = [];
    const pieces = getPiecesOfColor(board, color);

    for (const { row, col, piece } of pieces) {
        const pieceMoves = generatePieceMoves(board, row, col);

        // Add summon moves for mages (if not on cooldown)
        if (piece.type === PIECE.MAGE && !mageCooldown.has(piece.id)) {
            const summonMoves = generateSummonMoves(board, row, col, piece, capturedPieces);
            moves.push(...summonMoves);
        }

        moves.push(...pieceMoves);
    }

    return moves;
}







