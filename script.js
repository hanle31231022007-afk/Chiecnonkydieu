const puzzles = [
    { answer: "HUREA", hint: "Câu hỏi 1: Tên một thương hiệu?" }, // Placeholder hint
    { answer: "HR0003", hint: "Câu hỏi 2: Mã số nhân viên?" }   // Placeholder hint
];

const segments = [
    { color: "#F44336", text: "MẤT LƯỢT", value: 0 },
    { color: "#9C27B0", text: "200", value: 200 },
    { color: "#3F51B5", text: "700", value: 700 },
    { color: "#03A9F4", text: "300", value: 300 },
    { color: "#009688", text: "500", value: 500 },
    { color: "#8BC34A", text: "200", value: 200 },
    { color: "#FFEB3B", text: "900", value: 900 }, // Text color might need adjustment for yellow
    { color: "#FF9800", text: "1000", value: 1000 }, // Jackpot?
    { color: "#795548", text: "400", value: 400 },
    { color: "#607D8B", text: "Chia Đôi", value: "DIV2" }, // Optional fun wedge
    { color: "#E91E63", text: "600", value: 600 },
    { color: "#2196F3", text: "100", value: 100 }
];

let currentRoundIndex = 0;
let score = 0;
let currentRotation = 0;
let isSpinning = false;
let currentPuzzle = null;
let guessedLetters = new Set();
let canSpin = true;
let canGuess = false; // Only guess after spin (unless buying vowel - simplified for now)

// DOM Elements
const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const scoreDisplay = document.getElementById('score');
const puzzleBoardDisplay = document.getElementById('puzzleBoard');
const hintDisplay = document.getElementById('hintText');
const keyboardDisplay = document.getElementById('keyboard');
const messageDisplay = document.getElementById('messageDisplay');
const roundDisplay = document.getElementById('roundNumber');
const solveBtn = document.getElementById('solveBtn');
const solveModal = document.getElementById('solveModal');
const solveInput = document.getElementById('solveInput');
const submitSolve = document.getElementById('submitSolve');
const cancelSolve = document.getElementById('cancelSolve');
const nextRoundBtn = document.getElementById('nextRoundBtn');

// Init
function initGame() {
    drawWheel();
    loadRound(0);
    generateKeyboard();
    spinBtn.addEventListener('click', spinWheel);
    solveBtn.addEventListener('click', openSolveModal);
    submitSolve.addEventListener('click', handleSolve);
    cancelSolve.addEventListener('click', () => solveModal.classList.add('hidden'));
    nextRoundBtn.addEventListener('click', nextRound);
}

function loadRound(index) {
    if (index >= puzzles.length) {
        showMessage("CHÚC MỪNG! BẠN ĐÃ CHIẾN THẮNG TOÀN BỘ TRÒ CHƠI!");
        spinBtn.disabled = true;
        solveBtn.disabled = true;
        return;
    }
    
    currentRoundIndex = index;
    currentPuzzle = puzzles[index];
    guessedLetters.clear();
    roundDisplay.textContent = index + 1;
    hintDisplay.textContent = currentPuzzle.hint;
    score = 0; // Reset score per round optional, usually keeps growing? Let's keep growing.
    // scoreDisplay.textContent = score; 
    
    renderBoard();
    resetKeyboard();
    
    canSpin = true;
    canGuess = false;
    spinBtn.disabled = false;
    nextRoundBtn.classList.add('hidden');
    showMessage("Hãy quay nón để bắt đầu!");
}

function drawWheel() {
    const numSegments = segments.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const radius = wheelCanvas.width / 2;
    const centerX = radius;
    const centerY = radius;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    // Draw outer rim
    ctx.beginPath();
    ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FFD700";
    ctx.stroke();

    for (let i = 0; i < numSegments; i++) {
        const angle = i * arcSize;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 15, angle, angle + arcSize);
        ctx.fillStyle = segments[i].color;
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px Montserrat";
        if (segments[i].color === "#FFEB3B") ctx.fillStyle = "#000"; // Black text on yellow
        ctx.fillText(segments[i].text, radius - 30, 10);
        ctx.restore();
    }
    
    // Center cap
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.restore();
}

function spinWheel() {
    if (!canSpin || isSpinning) return;
    
    isSpinning = true;
    canSpin = false;
    spinBtn.disabled = true;
    solveBtn.disabled = true;
    showMessage("Đang quay...");

    // Random spin duration and rotation
    const spinDuration = 3000 + Math.random() * 2000; // 3-5s
    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const targetAngle = Math.random() * 360;
    const totalRotation = (extraSpins * 360) + targetAngle;
    
    const startObj = { rotation: currentRotation };
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = elapsed / spinDuration;
        
        if (progress > 1) progress = 1;
        
        // Easing function (easeOutCubic)
        const ease = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startObj.rotation + (totalRotation * ease);
        
        // CSS transform handles the visual rotation for smoothness
        wheelCanvas.style.transform = `rotate(-${currentRotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            handleSpinResult();
        }
    }
    
    requestAnimationFrame(animate);
}

function handleSpinResult() {
    // Calculate which segment we stopped on
    const numSegments = segments.length;
    const degreesPerSegment = 360 / numSegments;
    // Normalize rotation to 0-360
    const finalAngle = currentRotation % 360;
    
    // The pointer is at top (270 degrees in canvas coords, or simply index calculation dependent on coordinate system)
    // Canvas 0 is right (3 o'clock). Pointer is at 12 o'clock (-90 deg or 270 deg).
    // Let's rely on the visual logic: Check logic with visual.
    // CSS rotates the canvas negatively.
    // If we rotate -90 deg, the segment at 3 o'clock moves to 12 o'clock.
    
    // Easy formula: Index = floor(((rotation + Offset) % 360) / degPerSeg)
    // If pointer is at top, offset depends on where index 0 starts.
    // Currently Index 0 starts at 0 rad (3 o'clock).
    // To get Index 0 to Pointer, we rotate -90 deg (270 deg).
    // So, Pointer Index matches the angle passing the pointer.
    
    const index = Math.floor(((currentRotation + 90) % 360) / degreesPerSegment);
    const winIndex = (numSegments - 1 - index + numSegments) % numSegments; // Reverse index direction because rotation is opposite? 
    // Let's simplify: 
    // If rotation is 0, pointer points to segment roughly at 90deg (Index 0 is 0-30deg... wait. 270deg is top).
    // Let's just create a robust lookup.
    // actualRotation = currentRotation % 360.
    // pointerAngle = 90 (top, if canvas 0 is right).
    // segmentAngle at pointer = (pointerAngle + actualRotation) % 360.
    
    const pointerAngle = (currentRotation + 90) % 360; // 270 is top in standard 0-at-right, but here +90 shifts 0-Index to Top.
    // Actually, simpler:
    const segLength = 360 / segments.length;
    const winningSegmentIndex = Math.floor(((360 - (currentRotation % 360)) + 90) % 360 / segLength) % segments.length; // Adjusted trial/error formula logic

    /* 
       Let's trace:
       Draw starts at 0 rad (right).
       Segment 0 is 0 to 30 deg.
       Pointer is Top (270 deg / -90 deg).
       To get Seg 0 to Pointer, we rotate CANVAS -270deg (or +90?).
       CSS rotate(-currentRotation).
    */

    const result = segments[winningSegmentIndex];
    
    // messageDisplay.textContent = `Kết quả: ${result.text}`;
    
    if (result.value === 0) {
        showMessage("MẤT LƯỢT! Rất tiếc.");
        // Audio effect here
        setTimeout(() => {
            canSpin = true;
            spinBtn.disabled = false;
        }, 1500);
    } else if (result.value === 'DIV2') {
        score = Math.floor(score / 2);
        updateScore();
        showMessage("CHIA ĐÔI ĐIỂM SỐ!");
        canGuess = true;
        enableKeyboard();
    } else {
        const val = parseInt(result.value);
        showMessage(`Bạn quay được ${val} điểm. Hãy chọn 1 chữ cái!`);
        canGuess = true;
        enableKeyboard();
        // Store potential points to add if guess is correct
        window.currentSpinValue = val;
    }
    
    solveBtn.disabled = false;
}

function renderBoard() {
    puzzleBoardDisplay.innerHTML = '';
    const answer = currentPuzzle.answer;
    
    for (let char of answer) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        
        if (char === ' ') {
            tile.classList.add('space');
        } else {
            if (guessedLetters.has(char)) {
                tile.textContent = char;
            } else {
                tile.classList.add('not-revealed-yet');
            }
        }
        puzzleBoardDisplay.appendChild(tile);
    }
}

function generateKeyboard() {
    const chars = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY0123456789"; // Include numbers for HR0003
    keyboardDisplay.innerHTML = '';
    
    for (let char of chars) {
        const btn = document.createElement('button');
        btn.textContent = char;
        btn.classList.add('key');
        btn.id = `key-${char}`;
        btn.onclick = () => handleGuess(char);
        keyboardDisplay.appendChild(btn);
    }
}

function resetKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(k => {
        k.disabled = true;
        k.classList.remove('correct');
    });
}

function enableKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(k => {
        if (!guessedLetters.has(k.textContent)) {
            k.disabled = false;
        }
    });
}

function handleGuess(char) {
    if (!canGuess) return;
    
    document.getElementById(`key-${char}`).disabled = true;
    guessedLetters.add(char);
    
    const count = normalizeString(currentPuzzle.answer).split(char).length - 1;
    // Simple check without normalization first if exact match desired, 
    // but useful for VNI logic. For now strict match.
    // Actually, Puzzles are "HUREA" and "HR0003".
    
    let occurrences = 0;
    const answer = currentPuzzle.answer;
    let revealedSomething = false;

    // Check occurrences
    for (let c of answer) {
        if (c === char) occurrences++;
    }

    if (occurrences > 0) {
        // Correct guess
        const points = window.currentSpinValue * occurrences;
        score += points;
        updateScore();
        showMessage(`ĐÚNG RỒI! Có ${occurrences} chữ ${char}. +${points} điểm.`);
        
        // Reveal on board
        renderBoard(); // Re-render to show new letters
        
        // Check if fully solved (by filling all letters)
        checkAutoWin();
    } else {
        // Wrong guess
        showMessage(`TIẾC QUÁ! Không có chữ ${char} nào.`);
    }

    canGuess = false;
    canSpin = true;
    spinBtn.disabled = false;
    disableKeyboard();
}

function disableKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(k => k.disabled = true);
}

function checkAutoWin() {
    const answer = currentPuzzle.answer;
    const isWin = answer.split('').every(c => c === ' ' || guessedLetters.has(c));
    if (isWin) {
        handleWin();
    }
}

function openSolveModal() {
    solveModal.classList.remove('hidden');
    solveInput.focus();
}

function handleSolve() {
    const guess = solveInput.value.toUpperCase().trim();
    solveModal.classList.add('hidden');
    solveInput.value = '';
    
    if (guess === currentPuzzle.answer) {
        handleWin();
    } else {
        showMessage("SAI RỒI! BẠN MẤT TOÀN BỘ ĐIỂM TRONG VÒNG NÀY.");
        score = 0;
        updateScore();
    }
}

function handleWin() {
    showMessage(`CHÚC MỪNG! BẠN ĐÃ GIẢI ĐƯỢC Ô CHỮ: ${currentPuzzle.answer}`);
    // Reveal all
    currentPuzzle.answer.split('').forEach(c => guessedLetters.add(c));
    renderBoard();
    
    canSpin = false;
    spinBtn.disabled = true;
    canGuess = false;
    disableKeyboard();
    
    nextRoundBtn.classList.remove('hidden');
}

function nextRound() {
    loadRound(currentRoundIndex + 1);
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function showMessage(msg) {
    messageDisplay.textContent = msg;
}

// Helpers
function normalizeString(str) {
    // Basic helper if needed for Vietnamese accents later
    return str; 
}

// Start
initGame();
