const GRID_SIZE = 5;
const gridEl = document.getElementById('grid');
const btnSolve = document.getElementById('btn-solve');
const btnReset = document.getElementById('btn-reset');
const statusEl = document.getElementById('iter-count');

let gridData = {
    width: GRID_SIZE,
    height: GRID_SIZE,
    start: [0, 0],
    end: [4, 4],
    obstacles: [[1, 1], [2, 2], [3, 3]],
    values: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0.0)),
    policy: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('')),
    isSolved: false
};

const cellTypes = ['empty', 'start', 'end', 'obstacle'];

const arrows = {
    'Up': '↑',
    'Down': '↓',
    'Left': '←',
    'Right': '→',
    'Goal': 'END',
    '': ''
};

const randomArrows = ['↑', '↓', '←', '→'];

function initGrid() {
    gridEl.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell type-empty';
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => handleCellClick(r, c));
            gridEl.appendChild(cell);
        }
    }
    updateCellTypes();
    renderGrid();
}

function getCellType(r, c) {
    if (gridData.start && gridData.start[0] === r && gridData.start[1] === c) return 'start';
    if (gridData.end && gridData.end[0] === r && gridData.end[1] === c) return 'end';
    if (gridData.obstacles.some(o => o[0] === r && o[1] === c)) return 'obstacle';
    return 'empty';
}

function updateCellTypes() {
    const cells = gridEl.children;
    for (let i = 0; i < cells.length; i++) {
        const r = parseInt(cells[i].dataset.r);
        const c = parseInt(cells[i].dataset.c);
        const type = getCellType(r, c);
        cells[i].className = `cell type-${type}`;
    }
}

function handleCellClick(r, c) {
    const drawToolInput = document.querySelector('input[name="draw-tool"]:checked');
    const drawTool = drawToolInput ? drawToolInput.value : 'obstacle';
    const currentType = getCellType(r, c);

    // Remove from current role
    if (currentType === 'obstacle') {
        gridData.obstacles = gridData.obstacles.filter(o => o[0] !== r || o[1] !== c);
    }
    if (currentType === 'start') gridData.start = null;
    if (currentType === 'end') gridData.end = null;

    // Assign new role
    if (drawTool === 'start') {
        gridData.start = [r, c];
    } else if (drawTool === 'end') {
        gridData.end = [r, c];
    } else if (drawTool === 'obstacle') {
        if (currentType !== 'obstacle') {
            gridData.obstacles.push([r, c]);
        }
    }

    resetValues(); // Reset iteration when board changes
}

function resetValues() {
    gridData.values = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0.0));
    gridData.policy = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''));
    gridData.isSolved = false;
    statusEl.textContent = 'Not Run';
    updateCellTypes();
    renderGrid();
}

function computeOptimalPath() {
    const path = [];
    if (!gridData.start || !gridData.end) return path;

    let [r, c] = gridData.start;
    let visited = new Set();
    
    // limit iterations to avoid infinite loops if policy has cycles
    for(let i=0; i < 100; i++) {
        const key = `${r},${c}`;
        path.push([r, c]);
        if (r === gridData.end[0] && c === gridData.end[1]) break;
        if (visited.has(key)) break; // Loop detected
        visited.add(key);

        const action = gridData.policy[r][c];
        if (!action || action === 'Goal') break;
        
        if (action === 'Up') r--;
        else if (action === 'Down') r++;
        else if (action === 'Left') c--;
        else if (action === 'Right') c++;
        
        if (r < 0 || r >= gridData.height || c < 0 || c >= gridData.width) break;
    }
    return path;
}

function renderGrid() {
    const cells = gridEl.children;
    updateCellTypes();
    
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('optimal-path');
    }

    let pathSet = new Set();
    if (gridData.isSolved) {
        const path = computeOptimalPath();
        path.forEach(p => pathSet.add(`${p[0]},${p[1]}`));
    }

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const idx = r * GRID_SIZE + c;
            const cell = cells[idx];
            const type = getCellType(r, c);
            
            if (pathSet.has(`${r},${c}`) && type !== 'obstacle') {
                cell.classList.add('optimal-path');
            }

            if (type === 'obstacle') {
                cell.innerHTML = '';
                continue;
            }
            
            let content = '';

            if (!gridData.isSolved) {
                if (type === 'start') {
                    content = 'START';
                } else if (type === 'end') {
                    content = 'END';
                } else {
                    const a = randomArrows[Math.floor(Math.random() * randomArrows.length)];
                    content = `<span class="arrow" style="opacity: 0.5">${a}</span>`;
                }
            } else {
                const val = gridData.values[r][c].toFixed(2);
                if (type === 'end') {
                    content = `<div style="text-align:center;line-height:1.2;font-size:0.9rem">END<br/><span style="font-size: 1.1rem">${val}</span></div>`;
                } else if (!gridData.policy[r][c]) {
                    if (type === 'start') {
                        content = `<div style="text-align:center;line-height:1.2;font-size:0.9rem">START<br/><span style="font-size: 1.1rem">${val}</span></div>`;
                    } else {
                        content = `<span class="value-text">${val}</span>`;
                    }
                } else {
                    const action = gridData.policy[r][c];
                    const arrow = arrows[action] || '';
                    if (type === 'start') {
                         content = `<div style="text-align:center;line-height:1.1;font-size:0.9rem">START<br/><strong style="font-size: 1.1rem">${arrow}</strong><br/><span style="font-size: 0.9rem">${val}</span></div>`;
                    } else {
                         content = `<div style="text-align:center;line-height:1"><strong class="arrow" style="font-size: 1.5rem">${arrow}</strong><br/><span class="value-text" style="font-size: 0.9rem">${val}</span></div>`;
                    }
                }
            }
            cell.innerHTML = content;
        }
    }
}

async function apiRequest(endpoint) {
    if (!gridData.start || !gridData.end) {
        alert("Please set a Start and an End point before running.");
        return;
    }

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                width: gridData.width,
                height: gridData.height,
                start: gridData.start,
                end: gridData.end,
                obstacles: gridData.obstacles,
                values: gridData.values
            })
        });
        const data = await res.json();
        gridData.values = data.values;
        gridData.policy = data.policy;
        
        gridData.isSolved = true;
        statusEl.textContent = "Converged Optimal Policy";    
        renderGrid();
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message + '\n\n' + err.stack);
    }
}

btnSolve.addEventListener('click', () => apiRequest('/api/solve'));
btnReset.addEventListener('click', () => {
    // Reset to initial state
    gridData.start = [0, 0];
    gridData.end = [4, 4];
    gridData.obstacles = [[1, 1], [2, 2], [3, 3]];
    resetValues();
});

initGrid();
