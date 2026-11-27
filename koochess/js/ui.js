/**
 * 丂棋 (KooChess) - UI Controller
 * Board rendering, user interaction, game flow.
 */

// ── App State ──────────────────────────────────────────
let gameState = null;
let selectedCell = null;        // { row, col, preview? } or null
let legalMoves = [];            // Legal moves for selected piece
let mageActionMode = 'move';    // 'move' | 'summon' when a friendly Mage is selected
let vsAI = false;               // Play against AI
let aiVsAi = false;             // Let both sides be controlled by AI
let aiDuelReady = false;        // AI duel waits until the user starts it
let setupMode = false;          // Free endgame board editor
let setupColor = RED;
let setupPieceType = PIECE.SOLDIER;
let setupTurn = RED;
let setupDragPayload = null;
const SETUP_PIECES = [
    PIECE.SOLDIER, PIECE.SERGEANT, PIECE.GENERAL,
    PIECE.LIGHT_CANNON, PIECE.LIGHT_HORSE,
    PIECE.HEAVY_CANNON, PIECE.HEAVY_HORSE,
    PIECE.ROOK, PIECE.BISHOP, PIECE.MAGE,
    PIECE.FORTRESS, PIECE.GUARD, PIECE.KING, PIECE.DRAGON,
];
let aiColor = BLACK;            // AI plays black (player is red)
let aiDepth = 2;                // Matches default selected option in #ai-depth
let aiRedDepth = 2;
let aiBlackDepth = 2;
let aiThinking = false;
const AI_MOVE_DELAY = 450;
let lastMoveAnim = null;        // { fromRow, fromCol, toRow, toCol, wasCapture } for animation
let gameStarted = false;        // Whether game has started (mode selected)
let aiRunId = 0;                // Invalidates pending async AI moves

// ── Mode Selection ─────────────────────────────────────

function selectMode(size) {
    setBoardSize(size);
    document.getElementById('mode-overlay').classList.add('hidden');
    document.getElementById('app').style.display = '';
    const sub = document.querySelector('.header .subtitle');
    if (sub) sub.textContent = size === 8 ? '8×8 简易棋类' : '10×10 策略棋类';
    document.getElementById('board').style.gridTemplateColumns = `repeat(${size}, var(--cell-size))`;
    document.getElementById('board').style.gridTemplateRows = `repeat(${size}, var(--cell-size))`;
    gameStarted = true;
    setupMode = false;
    initGame();
    updateAIButtons();
}

// ── Initialization ─────────────────────────────────────

function initGame() {
    gameState = createGameState();
    selectedCell = null;
    legalMoves = [];
    aiThinking = false;
    if (!setupMode) aiDuelReady = false;
    render();
    updateStatus();
    updateMoveHistory();
    updateCapturedPanels();

    aiRunId++;
    if (isAITurn()) {
        scheduleAIMove();
    }
}

// ── Rendering ──────────────────────────────────────────

function render() {
    renderBoard();
    updateStatus();
}

const PIECE_SEAL = {
    [PIECE.SOLDIER]: '卒',
    [PIECE.SERGEANT]: '士',
    [PIECE.GENERAL]: '長',
    [PIECE.LIGHT_CANNON]: '銃',
    [PIECE.HEAVY_CANNON]: '砲',
    [PIECE.LIGHT_HORSE]: '馬',
    [PIECE.HEAVY_HORSE]: '驃',
    [PIECE.ROOK]: '車',
    [PIECE.BISHOP]: '角',
    [PIECE.MAGE]: '法',
    [PIECE.FORTRESS]: '堡',
    [PIECE.GUARD]: '護',
    [PIECE.KING]: '王',
    [PIECE.DRAGON]: '龍',
};

const PIECE_EMBLEM_SVG = {
    [PIECE.SOLDIER]: '<path d="M12 4l4 5-2.5 1v8h-3V10L8 9z"/>',
    [PIECE.SERGEANT]: '<path d="M12 4l6 6-6 9-6-9z"/><circle cx="12" cy="10" r="2"/>',
    [PIECE.GENERAL]: '<path d="M12 3l2.6 5.4 6 .8-4.3 4.2 1 5.9-5.3-2.8-5.3 2.8 1-5.9L3.4 9.2l6-.8z"/>',
    [PIECE.LIGHT_CANNON]: '<circle cx="12" cy="12" r="6"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
    [PIECE.HEAVY_CANNON]: '<circle cx="10" cy="15" r="4"/><path d="M12 13l7-7M16 4l4 4"/>',
    [PIECE.LIGHT_HORSE]: '<path d="M7 19h10M8 19c0-4 2-6 3-8l-3-2 2-4 5 1 2 4-3 3c1 2 2 4 2 6"/>',
    [PIECE.HEAVY_HORSE]: '<path d="M6 19h12M7 19c0-4 2-6 3-8l-3-2 3-5 5 1 2 3-3 3 2 8"/><path d="M4 7l4 1M17 5l3-2"/>',
    [PIECE.ROOK]: '<path d="M6 5h3v3h2V5h2v3h2V5h3v5l-2 2v7H8v-7L6 10z"/>',
    [PIECE.BISHOP]: '<path d="M12 3c3 3 4 6 2 9l3 7H7l3-7c-2-3-1-6 2-9z"/>',
    [PIECE.MAGE]: '<polygon points="12,3 19,16 5,16"/><polygon points="12,21 5,8 19,8"/>',
    [PIECE.FORTRESS]: '<path d="M5 7h3V4h2v3h4V4h2v3h3v13H5z"/>',
    [PIECE.GUARD]: '<path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6z"/>',
    [PIECE.KING]: '<path d="M4 17h16l1-8-4.5 3.5L12 5l-4.5 7.5L3 9z"/><path d="M5 20h14"/>',
    [PIECE.DRAGON]: '<path d="M5 17c2-5 5-8 8-8 2 0 3 1 3 3s-2 3-4 2c-1-.5-1-2 0-3 2-3 5-5 8-5M7 6l2 2M17 17l-2 2"/>',
};

function createPieceElement(piece, isJustMoved) {
    const pieceEl = document.createElement('div');
    const name = PIECE_NAME[piece.type][piece.color];
    pieceEl.className = `piece ${piece.color} type-${piece.type}`;
    if (name.length > 1) pieceEl.classList.add('wide');
    if (isJustMoved) pieceEl.classList.add('just-moved');

    const shadow = document.createElement('span');
    shadow.className = 'piece-shadow';
    shadow.setAttribute('aria-hidden', 'true');

    const base = document.createElement('span');
    base.className = 'piece-base';
    base.setAttribute('aria-hidden', 'true');

    const face = document.createElement('span');
    face.className = 'piece-face';

    const emblem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    emblem.setAttribute('viewBox', '0 0 24 24');
    emblem.setAttribute('class', 'piece-emblem');
    emblem.setAttribute('aria-hidden', 'true');
    emblem.innerHTML = PIECE_EMBLEM_SVG[piece.type] || '';

    const glyph = document.createElement('span');
    glyph.className = 'piece-glyph';
    glyph.textContent = name;

    const seal = document.createElement('span');
    seal.className = 'piece-seal';
    seal.setAttribute('aria-hidden', 'true');
    seal.textContent = PIECE_SEAL[piece.type] || '';

    face.append(emblem, glyph, seal);
    pieceEl.append(shadow, base, face);
    return pieceEl;
}

function renderBoard() {
    const boardEl = document.getElementById('board');
    if (!boardEl || !gameState) return;
    boardEl.innerHTML = '';

    const lastMove = gameState.moveHistory.length > 0
        ? gameState.moveHistory[gameState.moveHistory.length - 1].move
        : null;

    const kingInCheckPos = gameState.inCheck
        ? findKing(gameState.board, gameState.currentTurn)
        : null;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.classList.add((r + c) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (setupMode) {
                cell.classList.add('setup-cell');
            }

            if (lastMove && !lastMove.special) {
                if ((r === lastMove.fromRow && c === lastMove.fromCol) ||
                    (r === lastMove.toRow && c === lastMove.toCol)) {
                    cell.classList.add('last-move');
                }
            }

            if (selectedCell && r === selectedCell.row && c === selectedCell.col) {
                cell.classList.add(selectedCell.preview ? 'preview-selected' : 'selected');
            }

            if (kingInCheckPos && r === kingInCheckPos.row && c === kingInCheckPos.col) {
                cell.classList.add('in-check');
            }

            const validMove = getVisibleMoveForCell(r, c);
            if (validMove) {
                const target = getPiece(gameState.board, r, c);
                const isSummon = validMove.special === 'summon';
                if (selectedCell && selectedCell.preview) {
                    cell.classList.add('preview-target');
                }
                if (isSummon) {
                    cell.classList.add('valid-summon');
                } else if (target) {
                    cell.classList.add('valid-capture');
                } else {
                    cell.classList.add('valid-move');
                }
            }

            if (lastMoveAnim) {
                if (r === lastMoveAnim.fromRow && c === lastMoveAnim.fromCol) {
                    cell.classList.add('move-from');
                }
                if (r === lastMoveAnim.toRow && c === lastMoveAnim.toCol) {
                    cell.classList.add('last-move');
                    if (lastMoveAnim.wasCapture) {
                        cell.classList.add('capture-flash');
                    }
                }
            }

            if (r === BOARD_SIZE - 1) {
                const fileLabel = document.createElement('span');
                fileLabel.className = 'coord-label coord-file';
                fileLabel.textContent = String.fromCharCode(97 + c);
                cell.appendChild(fileLabel);
            }
            if (c === 0) {
                const rankLabel = document.createElement('span');
                rankLabel.className = 'coord-label coord-rank';
                rankLabel.textContent = BOARD_SIZE - r;
                cell.appendChild(rankLabel);
            }

            const piece = gameState.board[r][c];
            if (piece) {
                const moved = !!(lastMoveAnim && r === lastMoveAnim.toRow && c === lastMoveAnim.toCol);
                const pieceEl = createPieceElement(piece, moved);
                if (setupMode) {
                    pieceEl.draggable = true;
                    pieceEl.addEventListener('dragstart', (e) => {
                        setupDragPayload = { source: 'board', fromRow: r, fromCol: c };
                        e.dataTransfer.setData('text/plain', 'board');
                    });
                }
                cell.appendChild(pieceEl);
            }

            if (setupMode) {
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    cell.classList.add('setup-drop-hover');
                });
                cell.addEventListener('dragleave', () => {
                    cell.classList.remove('setup-drop-hover');
                });
                cell.addEventListener('drop', (e) => onSetupDrop(e, r, c));
            }

            cell.addEventListener('click', () => onCellClick(r, c));
            boardEl.appendChild(cell);
        }
    }
}

function getVisibleMoveForCell(r, c) {
    const normalMove = legalMoves.find(m => !m.special && m.toRow === r && m.toCol === c);
    const summonMove = legalMoves.find(m => m.special === 'summon' && m.summonRow === r && m.summonCol === c);
    if (mageActionMode === 'summon') {
        return summonMove || null;
    }
    return normalMove || summonMove || null;
}

// ── Click Handling ─────────────────────────────────────

function onCellClick(row, col) {
    if (setupMode) {
        onSetupCellClick(row, col);
        return;
    }
    if (gameState.gameOver) return;
    if (aiThinking) return;
    if (isAITurn()) return;

    const clickedPiece = getPiece(gameState.board, row, col);

    if (selectedCell && !selectedCell.preview) {
        const matchingMove = getVisibleMoveForCell(row, col);

        if (matchingMove) {
            const targetPiece = getPiece(gameState.board, matchingMove.toRow, matchingMove.toCol);
            lastMoveAnim = {
                fromRow: matchingMove.fromRow,
                fromCol: matchingMove.fromCol,
                toRow: matchingMove.toRow,
                toCol: matchingMove.toCol,
                wasCapture: !!targetPiece || matchingMove.special === 'summon',
            };

            makeMove(gameState, matchingMove);
            selectedCell = null;
            legalMoves = [];
            mageActionMode = 'move';
            render();
            updateMoveHistory();
            updateCapturedPanels();

            setTimeout(() => { lastMoveAnim = null; render(); }, 400);

            if (!gameState.gameOver && isAITurn()) {
                scheduleAIMove();
            }
            return;
        }
    }

    if (clickedPiece) {
        selectedCell = {
            row,
            col,
            preview: clickedPiece.color !== gameState.currentTurn,
        };
        mageActionMode = 'move';
        legalMoves = getLegalMoves(gameState, clickedPiece.color)
            .filter(m => m.fromRow === row && m.fromCol === col);
        render();
        return;
    }

    selectedCell = null;
    legalMoves = [];
    mageActionMode = 'move';
    render();
}

// ── Status Bar ─────────────────────────────────────────

function updateStatus() {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar || !gameState) return;

    statusBar.className = '';

    if (setupMode) {
        const pieceText = setupPieceType === 'empty'
            ? '擦除'
            : PIECE_NAME[setupPieceType][setupColor];
        const colorText = setupColor === RED ? '红方' : '黑方';
        statusBar.textContent = `残局布阵：点选或拖动托盘棋子到棋盘。当前：${colorText} ${pieceText}。`;
        return;
    }

    if (aiVsAi && !aiDuelReady) {
        statusBar.textContent = 'AI对战准备中：先调整红黑双方难度，然后点击“开始AI对战”。';
        return;
    }

    statusBar.textContent = getGameStatusText(gameState);

    if (!gameState.gameOver && !aiThinking && selectedCell && !selectedCell.preview) {
        const selPiece = getPiece(gameState.board, selectedCell.row, selectedCell.col);
        if (selPiece && selPiece.type === PIECE.MAGE) {
            const hasSummon = legalMoves.some(m => m.special === 'summon');
            const cooldown = gameState.mageCooldown.get(selPiece.id) || 0;
            const captured = selPiece.color === RED ? gameState.capturedByRed : gameState.capturedByBlack;
            const hasSoldier = captured.some(p => p.type === PIECE.SOLDIER);

            if (hasSummon) {
                const hint = document.createElement('span');
                hint.className = 'mage-hint-tag is-ready';
                hint.textContent = '法可召唤：正交走子 · 斜向紫色格召唤兵';
                statusBar.appendChild(hint);
            } else {
                const hint = document.createElement('span');
                hint.className = 'mage-hint-tag';
                if (cooldown > 0) {
                    hint.textContent = `法不可召唤（冷却中，还需 ${cooldown} 回合）`;
                } else if (!hasSoldier) {
                    hint.textContent = '法不可召唤（需先吃掉敌方「兵」）';
                } else {
                    hint.textContent = '法斜向4格无安全空位可召唤';
                }
                statusBar.appendChild(hint);
            }
        }
    }

    if (gameState.gameOver) {
        statusBar.classList.add('game-over');
    } else if (gameState.inCheck) {
        statusBar.classList.add('check');
    }

    if (aiThinking) {
        statusBar.textContent = 'AI思考中...';
        statusBar.classList.add('check');
    }
}

// ── Move History ───────────────────────────────────────

function updateMoveHistory() {
    const moveList = document.getElementById('move-list');
    if (!moveList || !gameState) return;
    moveList.innerHTML = '';

    const history = gameState.moveHistory;
    for (let i = 0; i < history.length; i++) {
        const entry = history[i];
        const move = entry.move;
        const moveNum = Math.floor(i / 2) + 1;

        const entryEl = document.createElement('div');
        entryEl.className = 'move-entry';

        let moveText = '';
        if (move.special === 'summon') {
            moveText = `召${colToFile(move.summonCol)}${BOARD_SIZE - move.summonRow}`;
        } else {
            moveText = `${colToFile(move.fromCol)}${BOARD_SIZE - move.fromRow}` +
                       `${entry.captured ? 'x' : '-'}${colToFile(move.toCol)}${BOARD_SIZE - move.toRow}`;
            if (entry.wasPromotion) {
                const promoName = entry.prevType === PIECE.SOLDIER
                    ? PIECE_NAME[PIECE.SERGEANT].red : PIECE_NAME[PIECE.GENERAL].red;
                moveText += `=${promoName}`;
            }
        }

        if (i % 2 === 0) {
            entryEl.innerHTML = `<span class="move-num">${moveNum}.</span>${moveText}`;
        } else {
            entryEl.innerHTML = `<span class="move-num"></span>${moveText}`;
        }

        moveList.appendChild(entryEl);
    }

    moveList.parentElement.scrollTop = moveList.parentElement.scrollHeight;
}

function colToFile(col) {
    return String.fromCharCode(97 + col);
}

// ── Captured Pieces ────────────────────────────────────

function updateCapturedPanels() {
    const redCaptured = document.getElementById('red-captured');
    const blackCaptured = document.getElementById('black-captured');
    if (!redCaptured || !blackCaptured || !gameState) return;

    redCaptured.innerHTML = '';
    for (const p of gameState.capturedByRed) {
        const span = document.createElement('span');
        span.className = 'captured-piece';
        span.textContent = PIECE_NAME[p.type][p.color];
        redCaptured.appendChild(span);
    }

    blackCaptured.innerHTML = '';
    for (const p of gameState.capturedByBlack) {
        const span = document.createElement('span');
        span.className = 'captured-piece';
        span.textContent = PIECE_NAME[p.type][p.color];
        blackCaptured.appendChild(span);
    }
}

// ── AI Move ────────────────────────────────────────────

function isAITurn() {
    if (!gameState || gameState.gameOver || setupMode) return false;
    return (aiVsAi && aiDuelReady) || (vsAI && gameState.currentTurn === aiColor);
}

function currentAIDepth() {
    if (!aiVsAi) return aiDepth;
    return gameState.currentTurn === RED ? aiRedDepth : aiBlackDepth;
}

function scheduleAIMove() {
    if (!isAITurn()) return;
    if (aiThinking) return;

    const runId = aiRunId;
    aiThinking = true;
    updateStatus();

    setTimeout(() => {
        if (runId !== aiRunId || !gameState || !isAITurn()) {
            aiThinking = false;
            updateStatus();
            return;
        }

        findBestMoveAsync(gameState, currentAIDepth()).then(result => {
            aiThinking = false;
            if (runId !== aiRunId || !gameState || !isAITurn()) {
                updateStatus();
                return;
            }

            if (!result || !result.move) {
                updateStatus();
                return;
            }

            const aiTarget = getPiece(gameState.board, result.move.toRow, result.move.toCol);
            lastMoveAnim = {
                fromRow: result.move.fromRow,
                fromCol: result.move.fromCol,
                toRow: result.move.toRow,
                toCol: result.move.toCol,
                wasCapture: !!aiTarget || result.move.special === 'summon',
            };

            const success = makeMove(gameState, result.move);
            if (success) {
                selectedCell = null;
                legalMoves = [];
                render();
                updateMoveHistory();
                updateCapturedPanels();

                setTimeout(() => { lastMoveAnim = null; render(); }, 400);

                if (!gameState.gameOver && isAITurn()) {
                    scheduleAIMove();
                }
            } else {
                updateStatus();
            }
        });
    }, AI_MOVE_DELAY);
}

// ── Endgame Setup ──────────────────────────────────────

function createBlankBoard() {
    resetPieceIdCounter();
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function resetPlayableState(turn = RED) {
    gameState.currentTurn = turn;
    gameState.capturedByRed = [];
    gameState.capturedByBlack = [];
    gameState.moveHistory = [];
    gameState.mageCooldown = new Map();
    gameState.positionHistory = new Map();
    gameState.halfMoveClock = 0;
    gameState.fullMoveNumber = 1;
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.gameOverReason = null;
    gameState.inCheck = isInCheck(gameState.board, gameState.currentTurn);
    recordPosition(gameState);
}

function hasKing(color) {
    return !!findKing(gameState.board, color);
}

function renderSetupPalette() {
    const palette = document.getElementById('setup-palette');
    if (!palette) return;
    palette.innerHTML = '';

    const rows = [
        { color: RED, label: '红方' },
        { color: BLACK, label: '黑方' },
    ];

    for (const row of rows) {
        const label = document.createElement('div');
        label.className = 'setup-palette-label';
        label.textContent = row.label;
        palette.appendChild(label);

        const rowEl = document.createElement('div');
        rowEl.className = 'setup-palette-row';
        for (const type of SETUP_PIECES) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `setup-piece-btn ${row.color}`;
            btn.textContent = PIECE_NAME[type][row.color];
            btn.title = `${row.label} ${PIECE_NAME[type][row.color]}`;
            btn.draggable = true;
            btn.classList.toggle('active', setupColor === row.color && setupPieceType === type);
            btn.addEventListener('click', () => {
                setupColor = row.color;
                setupPieceType = type;
                renderSetupPalette();
                updateStatus();
            });
            btn.addEventListener('dragstart', (e) => {
                setupDragPayload = { source: 'palette', color: row.color, type };
                e.dataTransfer.setData('text/plain', 'palette');
            });
            rowEl.appendChild(btn);
        }
        palette.appendChild(rowEl);
    }

    const emptyLabel = document.createElement('div');
    emptyLabel.className = 'setup-palette-label';
    emptyLabel.textContent = '工具';
    palette.appendChild(emptyLabel);

    const tools = document.createElement('div');
    tools.className = 'setup-palette-row';
    const emptyBtn = document.createElement('button');
    emptyBtn.type = 'button';
    emptyBtn.className = 'setup-piece-btn empty';
    emptyBtn.textContent = '擦除';
    emptyBtn.draggable = true;
    emptyBtn.classList.toggle('active', setupPieceType === 'empty');
    emptyBtn.addEventListener('click', () => {
        setupPieceType = 'empty';
        renderSetupPalette();
        updateStatus();
    });
    emptyBtn.addEventListener('dragstart', (e) => {
        setupDragPayload = { source: 'empty' };
        e.dataTransfer.setData('text/plain', 'empty');
    });
    emptyBtn.addEventListener('dragover', (e) => e.preventDefault());
    emptyBtn.addEventListener('drop', (e) => {
        e.preventDefault();
        if (setupDragPayload && setupDragPayload.source === 'board') {
            removePiece(gameState.board, setupDragPayload.fromRow, setupDragPayload.fromCol);
            setupDragPayload = null;
            resetPlayableState(setupTurn);
            render();
            updateMoveHistory();
            updateCapturedPanels();
        }
    });
    tools.appendChild(emptyBtn);
    palette.appendChild(tools);
}

function enterEndgameSetup() {
    if (!gameState) return;
    aiRunId++;
    aiThinking = false;
    aiDuelReady = false;
    setupMode = true;
    selectedCell = null;
    legalMoves = [];
    lastMoveAnim = null;
    gameState.board = createBlankBoard();
    resetPlayableState(setupTurn);
    updateAIButtons();
    renderSetupPalette();

    render();
    updateMoveHistory();
    updateCapturedPanels();
}

function placeSetupPiece(row, col, color, type) {
    setPiece(gameState.board, row, col, {
        type,
        color,
        hasMoved: true,
        id: nextPieceId(),
    });
}

function finishSetupEdit() {
    selectedCell = null;
    legalMoves = [];
    resetPlayableState(setupTurn);
    renderSetupPalette();
    render();
    updateMoveHistory();
    updateCapturedPanels();
}

function onSetupCellClick(row, col) {
    if (setupPieceType === 'empty') {
        removePiece(gameState.board, row, col);
    } else {
        placeSetupPiece(row, col, setupColor, setupPieceType);
    }
    finishSetupEdit();
}

function onSetupDrop(event, row, col) {
    event.preventDefault();
    event.currentTarget.classList.remove('setup-drop-hover');
    if (!setupDragPayload) return;

    if (setupDragPayload.source === 'board') {
        const piece = getPiece(gameState.board, setupDragPayload.fromRow, setupDragPayload.fromCol);
        if (piece) {
            removePiece(gameState.board, setupDragPayload.fromRow, setupDragPayload.fromCol);
            setPiece(gameState.board, row, col, piece);
        }
    } else if (setupDragPayload.source === 'palette') {
        placeSetupPiece(row, col, setupDragPayload.color, setupDragPayload.type);
    } else if (setupDragPayload.source === 'empty') {
        removePiece(gameState.board, row, col);
    }

    setupDragPayload = null;
    finishSetupEdit();
}

function clearSetupBoard() {
    if (!gameState) return;
    aiRunId++;
    gameState.board = createBlankBoard();
    resetPlayableState(setupTurn);
    render();
    updateMoveHistory();
    updateCapturedPanels();
}

function startEndgame() {
    if (!gameState) return false;
    if (!hasKing(RED) || !hasKing(BLACK)) {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) statusBar.textContent = '残局至少需要红方和黑方各一个王。';
        return false;
    }

    setupMode = false;
    aiRunId++;
    selectedCell = null;
    legalMoves = [];
    lastMoveAnim = null;
    resetPlayableState(setupTurn);
    updateAIButtons();
    render();
    updateMoveHistory();
    updateCapturedPanels();

    if (isAITurn()) scheduleAIMove();
    return true;
}

// ── Controls ───────────────────────────────────────────

function newGame() {
    lastMoveAnim = null;
    setupMode = false;
    initGame();
    updateAIButtons();
}

function backToMenu() {
    lastMoveAnim = null;
    gameState = null;
    selectedCell = null;
    legalMoves = [];
    setupMode = false;
    aiDuelReady = false;
    document.getElementById('app').style.display = 'none';
    document.getElementById('mode-overlay').classList.remove('hidden');
    document.getElementById('board').innerHTML = '';
    updateAIButtons();
}

function undo() {
    if (aiThinking || setupMode) return;
    lastMoveAnim = null;

    const undosToMake = (vsAI || (aiVsAi && aiDuelReady)) ? 2 : 1;

    for (let i = 0; i < undosToMake; i++) {
        if (!undoMove(gameState)) break;
    }

    selectedCell = null;
    legalMoves = [];
    render();
    updateMoveHistory();
    updateCapturedPanels();
}

function updateAIButtons() {
    const aiBtn = document.getElementById('btn-ai');
    if (aiBtn) {
        aiBtn.classList.toggle('active', vsAI);
        aiBtn.textContent = vsAI ? 'vs AI ✓' : 'vs AI';
    }

    const duelBtn = document.getElementById('btn-ai-duel');
    if (duelBtn) {
        duelBtn.classList.toggle('active', aiVsAi);
        duelBtn.textContent = aiVsAi ? (aiDuelReady ? 'AI对战中 ✓' : 'AI对战准备') : 'AI对战';
    }

    const duelDepths = document.getElementById('duel-ai-depths');
    if (duelDepths) {
        duelDepths.classList.toggle('hidden', !aiVsAi);
    }

    const startDuelBtn = document.getElementById('btn-start-ai-duel');
    if (startDuelBtn) {
        startDuelBtn.classList.toggle('hidden', !aiVsAi || aiDuelReady);
    }

    const setupControls = document.getElementById('setup-controls');
    if (setupControls) {
        setupControls.classList.toggle('hidden', !setupMode);
    }

    const setupBtn = document.getElementById('btn-endgame');
    if (setupBtn) {
        setupBtn.classList.toggle('active', setupMode);
        setupBtn.textContent = setupMode ? '布阵中 ✓' : '残局布阵';
    }

    if (setupMode) renderSetupPalette();
}

function toggleAI() {
    vsAI = !vsAI;
    if (vsAI) {
        aiVsAi = false;
        aiDuelReady = false;
    }
    aiRunId++;
    if (setupMode) {
        updateAIButtons();
        updateStatus();
        return;
    }
    newGame();
}

function toggleAIDuel() {
    aiVsAi = !aiVsAi;
    aiDuelReady = false;
    if (aiVsAi) vsAI = false;
    aiRunId++;
    if (setupMode) {
        updateAIButtons();
        updateStatus();
        return;
    }
    newGame();
}

function startAIDuel() {
    if (!aiVsAi) {
        aiVsAi = true;
        vsAI = false;
    }
    if (setupMode && !startEndgame()) return;
    aiDuelReady = true;
    aiRunId++;
    updateAIButtons();
    render();
    if (isAITurn()) scheduleAIMove();
}

function setAIDepth(depth) {
    aiDepth = depth;
    const select = document.getElementById('ai-depth');
    if (select) select.value = depth;
}

function setAIDuelDepth(color, depth) {
    if (color === RED) {
        aiRedDepth = depth;
        const select = document.getElementById('ai-red-depth');
        if (select) select.value = depth;
    } else {
        aiBlackDepth = depth;
        const select = document.getElementById('ai-black-depth');
        if (select) select.value = depth;
    }
}

// ── Event Binding ──────────────────────────────────────

function bindControls() {
    document.getElementById('btn-mode-full').addEventListener('click', () => selectMode(10));
    document.getElementById('btn-mode-lite').addEventListener('click', () => selectMode(8));

    document.getElementById('btn-new-game').addEventListener('click', backToMenu);
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-ai').addEventListener('click', toggleAI);
    document.getElementById('btn-ai-duel').addEventListener('click', toggleAIDuel);
    document.getElementById('btn-start-ai-duel').addEventListener('click', startAIDuel);
    document.getElementById('btn-endgame').addEventListener('click', enterEndgameSetup);
    document.getElementById('btn-clear-board').addEventListener('click', clearSetupBoard);
    document.getElementById('btn-start-endgame').addEventListener('click', startEndgame);

    document.getElementById('ai-depth').addEventListener('change', (e) => {
        setAIDepth(parseInt(e.target.value));
    });
    document.getElementById('ai-red-depth').addEventListener('change', (e) => {
        setAIDuelDepth(RED, parseInt(e.target.value));
    });
    document.getElementById('ai-black-depth').addEventListener('change', (e) => {
        setAIDuelDepth(BLACK, parseInt(e.target.value));
    });
    document.getElementById('setup-turn').addEventListener('change', (e) => {
        setupTurn = e.target.value;
        if (setupMode && gameState) resetPlayableState(setupTurn);
        updateStatus();
    });

    const overlay = document.getElementById('rules-overlay');
    document.getElementById('btn-rules').addEventListener('click', () => {
        overlay.classList.remove('hidden');
    });
    document.getElementById('btn-close-rules').addEventListener('click', () => {
        overlay.classList.add('hidden');
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            newGame();
        }
    });
}

// ── Bootstrap ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('app').style.display = 'none';
    bindControls();
    updateAIButtons();
});


