/**
 * 丂棋 (KooChess) - Game Constants
 * 10×10 full / 8×8 lite chess variant
 */

// ── Board ──────────────────────────────────────────────
let BOARD_SIZE = 10;
function setBoardSize(size) { BOARD_SIZE = size; }

// ── Colors ─────────────────────────────────────────────
const RED   = 'red';
const BLACK = 'black';

// ── Piece Types ────────────────────────────────────────
const PIECE = {
    // First row (front)
    SOLDIER:     'soldier',      // 兵
    SERGEANT:    'sergeant',     // 士
    GENERAL:     'general',      // 长
    // Second row (middle)
    LIGHT_CANNON:  'lightCannon',   // 枪
    LIGHT_HORSE:   'lightHorse',    // 马
    HEAVY_CANNON:  'heavyCannon',   // 炮
    HEAVY_HORSE:   'heavyHorse',    // 骠
    // Third row (back)
    ROOK:        'rook',         // 车
    BISHOP:      'bishop',       // 角
    MAGE:        'mage',         // 法
    FORTRESS:    'fortress',     // 堡
    GUARD:       'guard',        // 护
    KING:        'king',         // 王
    DRAGON:      'dragon',       // 龙
};

// ── Display Names ──────────────────────────────────────
const PIECE_NAME = {
    [PIECE.SOLDIER]:      { red: '兵', black: '兵' },
    [PIECE.SERGEANT]:     { red: '士', black: '士' },
    [PIECE.GENERAL]:      { red: '长', black: '长' },
    [PIECE.LIGHT_CANNON]: { red: '枪', black: '枪' },
    [PIECE.LIGHT_HORSE]:  { red: '马', black: '马' },
    [PIECE.HEAVY_CANNON]: { red: '炮', black: '炮' },
    [PIECE.HEAVY_HORSE]:  { red: '骠', black: '骠' },
    [PIECE.ROOK]:         { red: '车', black: '车' },
    [PIECE.BISHOP]:       { red: '角', black: '角' },
    [PIECE.MAGE]:         { red: '法', black: '法' },
    [PIECE.FORTRESS]:     { red: '堡', black: '堡' },
    [PIECE.GUARD]:        { red: '护', black: '护' },
    [PIECE.KING]:         { red: '王', black: '王' },
    [PIECE.DRAGON]:       { red: '龙', black: '龙' },
};

// ── Piece Values (for AI evaluation) ───────────────────
const PIECE_VALUE = {
    [PIECE.SOLDIER]:      100,
    [PIECE.SERGEANT]:     250,
    [PIECE.GENERAL]:      400,
    [PIECE.LIGHT_CANNON]: 390,
    [PIECE.LIGHT_HORSE]:  410,
    [PIECE.HEAVY_CANNON]: 330,
    [PIECE.HEAVY_HORSE]:  500,
    [PIECE.ROOK]:         560,
    [PIECE.BISHOP]:       460,
    [PIECE.MAGE]:         400,
    [PIECE.FORTRESS]:     450,
    [PIECE.GUARD]:        430,
    [PIECE.KING]:         10000,
    [PIECE.DRAGON]:       900,
};

// ── Promotion chain ────────────────────────────────────
// Soldier -> Sergeant -> General (only when capturing non-SOLDIER/SERGEANT)
const PROMOTION = {
    [PIECE.SOLDIER]:  PIECE.SERGEANT,
    [PIECE.SERGEANT]: PIECE.GENERAL,
};

// Pieces that trigger promotion when captured (anything that's not a Soldier or Sergeant)
function triggersPromotion(pieceType) {
    return pieceType !== PIECE.SOLDIER && pieceType !== PIECE.SERGEANT;
}

// ── Direction Vectors ──────────────────────────────────
// Row direction: positive = down (toward red side)
const DIR = {
    N:  [-1,  0],
    S:  [ 1,  0],
    E:  [ 0,  1],
    W:  [ 0, -1],
    NE: [-1,  1],
    NW: [-1, -1],
    SE: [ 1,  1],
    SW: [ 1, -1],
};

// Orthogonal directions (N, S, E, W)
const ORTHOGONAL = [DIR.N, DIR.S, DIR.E, DIR.W];

// Diagonal directions (NE, NW, SE, SW)
const DIAGONAL = [DIR.NE, DIR.NW, DIR.SE, DIR.SW];

// All 8 directions
const ALL_DIRS = [...ORTHOGONAL, ...DIAGONAL];

// ── Forward direction (depends on color) ───────────────
// Black: row 0→10 (forward = South), Red: row 10→0 (forward = North)
function forwardDir(color) {
    return color === BLACK ? DIR.S : DIR.N;
}

// ── Piece ID counter ────────────────────────────────────
let _pieceIdCounter = 1;
function nextPieceId() { return _pieceIdCounter++; }
function resetPieceIdCounter() { _pieceIdCounter = 1; }

// ── Initial Board Layout ───────────────────────────────
// Returns a fresh 10×10 board with all pieces in starting positions
function createInitialBoard() {
    resetPieceIdCounter();
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    function place(row, col, type, color) {
        board[row][col] = { type, color, hasMoved: false, id: nextPieceId() };
    }

    // ── Black pieces (top, rows 0-2) ──
    // Row 0 (back): 车 角 法 堡 王 龙 堡 法 角 车 (双角在 b/i 异色格)
    const blackBack = [
        PIECE.ROOK, PIECE.BISHOP, PIECE.MAGE,
        PIECE.FORTRESS,
        PIECE.KING,
        PIECE.DRAGON,
        PIECE.FORTRESS,
        PIECE.MAGE, PIECE.BISHOP, PIECE.ROOK
    ];
    for (let c = 0; c < BOARD_SIZE; c++) {
        place(0, c, blackBack[c], BLACK);
    }

    // Row 1 (middle): 枪 _ 马 _ 炮 骠 _ 马 _ 枪
    place(1, 0, PIECE.LIGHT_CANNON, BLACK);
    place(1, 2, PIECE.LIGHT_HORSE, BLACK);
    place(1, 4, PIECE.HEAVY_CANNON, BLACK);
    place(1, 5, PIECE.HEAVY_HORSE, BLACK);
    place(1, 7, PIECE.LIGHT_HORSE, BLACK);
    place(1, 9, PIECE.LIGHT_CANNON, BLACK);

    // Row 2 (front): 兵 兵 兵 士 兵 兵 士 兵 兵 兵
    const blackFront = [
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER,
        PIECE.SERGEANT,
        PIECE.SOLDIER, PIECE.SOLDIER,
        PIECE.SERGEANT,
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER
    ];
    for (let c = 0; c < BOARD_SIZE; c++) {
        place(2, c, blackFront[c], BLACK);
    }

    // ── Red pieces (bottom, rows 7-9) ──
    // Row 7 (front): 兵 兵 兵 士 兵 兵 士 兵 兵 兵
    const redFront = [
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER,
        PIECE.SERGEANT,
        PIECE.SOLDIER, PIECE.SOLDIER,
        PIECE.SERGEANT,
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER
    ];
    for (let c = 0; c < BOARD_SIZE; c++) {
        place(7, c, redFront[c], RED);
    }

    // Row 8 (middle): 枪 _ 马 _ 炮 骠 _ 马 _ 枪
    place(8, 0, PIECE.LIGHT_CANNON, RED);
    place(8, 2, PIECE.LIGHT_HORSE, RED);
    place(8, 4, PIECE.HEAVY_CANNON, RED);
    place(8, 5, PIECE.HEAVY_HORSE, RED);
    place(8, 7, PIECE.LIGHT_HORSE, RED);
    place(8, 9, PIECE.LIGHT_CANNON, RED);

    // Row 9 (back): 车 角 法 堡 王 龙 堡 法 角 车
    const redBack = [
        PIECE.ROOK, PIECE.BISHOP, PIECE.MAGE,
        PIECE.FORTRESS,
        PIECE.KING,
        PIECE.DRAGON,
        PIECE.FORTRESS,
        PIECE.MAGE, PIECE.BISHOP, PIECE.ROOK
    ];
    for (let c = 0; c < BOARD_SIZE; c++) {
        place(9, c, redBack[c], RED);
    }

    return board;
}

// ── 8×8 Lite Board Layout ─────────────────────────────────
function createInitialBoardLite() {
    resetPieceIdCounter();
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));

    function place(row, col, type, color) {
        board[row][col] = { type, color, hasMoved: false, id: nextPieceId() };
    }

    // ── Black pieces (top, rows 0-2) ──
    // Row 0 (back): 车 角 法 王 龙 法 角 车 (双角在 b/g 异色格)
    const blackBack = [PIECE.ROOK, PIECE.BISHOP, PIECE.MAGE, PIECE.KING, PIECE.DRAGON, PIECE.MAGE, PIECE.BISHOP, PIECE.ROOK];
    for (let c = 0; c < 8; c++) place(0, c, blackBack[c], BLACK);

    // Row 1 (middle): 枪 _ 马 _ _ 骠 _ 枪
    place(1, 0, PIECE.LIGHT_CANNON, BLACK);
    place(1, 2, PIECE.LIGHT_HORSE, BLACK);
    place(1, 5, PIECE.HEAVY_HORSE, BLACK);
    place(1, 7, PIECE.LIGHT_CANNON, BLACK);

    // Row 2 (front): 兵 兵 兵 士 士 兵 兵 兵
    const blackFront = [
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER,
        PIECE.SERGEANT, PIECE.SERGEANT,
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER
    ];
    for (let c = 0; c < 8; c++) place(2, c, blackFront[c], BLACK);

    // ── Red pieces (bottom, rows 5-7) ──
    // Row 5 (front): 兵 兵 兵 士 士 兵 兵 兵
    const redFront = [
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER,
        PIECE.SERGEANT, PIECE.SERGEANT,
        PIECE.SOLDIER, PIECE.SOLDIER, PIECE.SOLDIER
    ];
    for (let c = 0; c < 8; c++) place(5, c, redFront[c], RED);

    // Row 6 (middle): 枪 _ 马 _ _ 骠 _ 枪
    place(6, 0, PIECE.LIGHT_CANNON, RED);
    place(6, 2, PIECE.LIGHT_HORSE, RED);
    place(6, 5, PIECE.HEAVY_HORSE, RED);
    place(6, 7, PIECE.LIGHT_CANNON, RED);

    // Row 7 (back): 车 角 法 王 龙 法 角 车
    const redBack = [PIECE.ROOK, PIECE.BISHOP, PIECE.MAGE, PIECE.KING, PIECE.DRAGON, PIECE.MAGE, PIECE.BISHOP, PIECE.ROOK];
    for (let c = 0; c < 8; c++) place(7, c, redBack[c], RED);

    return board;
}

// ── Opponent color ─────────────────────────────────────
function opponentColor(color) {
    return color === RED ? BLACK : RED;
}





