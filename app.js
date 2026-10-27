"use strict";

class MinHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(distance, id) {
    const items = this.items;
    items.push({ distance: distance, id: id });
    let index = items.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (items[parent].distance <= items[index].distance) break;
      const swap = items[parent];
      items[parent] = items[index];
      items[index] = swap;
      index = parent;
    }
  }

  pop() {
    const items = this.items;
    if (!items.length) return null;
    const top = items[0];
    const last = items.pop();
    if (items.length) {
      items[0] = last;
      let index = 0;
      while (true) {
        let smallest = index;
        const left = index * 2 + 1;
        const right = left + 1;
        if (left < items.length && items[left].distance < items[smallest].distance) smallest = left;
        if (right < items.length && items[right].distance < items[smallest].distance) smallest = right;
        if (smallest === index) break;
        const swap = items[smallest];
        items[smallest] = items[index];
        items[index] = swap;
        index = smallest;
      }
    }
    return [top.distance, top.id];
  }
}

function bubbleSteps(input) {
  const values = input.slice();
  const steps = [];
  const count = values.length;
  for (let pass = 0; pass < count; pass += 1) {
    for (let index = 0; index < count - 1 - pass; index += 1) {
      steps.push({ type: "compare", i: index, j: index + 1 });
      if (values[index] > values[index + 1]) {
        const tmp = values[index];
        values[index] = values[index + 1];
        values[index + 1] = tmp;
        steps.push({ type: "swap", i: index, j: index + 1 });
      }
    }
    steps.push({ type: "sorted", i: count - 1 - pass });
  }
  return steps;
}

function quickSteps(input) {
  const values = input.slice();
  const steps = [];

  function partition(low, high) {
    steps.push({ type: "pivot", i: high });
    const pivot = values[high];
    let store = low;
    for (let index = low; index < high; index += 1) {
      steps.push({ type: "compare", i: index, j: high });
      if (values[index] <= pivot) {
        if (store !== index) {
          const tmp = values[store];
          values[store] = values[index];
          values[index] = tmp;
          steps.push({ type: "swap", i: store, j: index });
        }
        store += 1;
      }
    }
    if (store !== high) {
      const tmp = values[store];
      values[store] = values[high];
      values[high] = tmp;
      steps.push({ type: "swap", i: store, j: high });
    }
    return store;
  }

  function sort(low, high) {
    if (low > high) return;
    if (low === high) {
      steps.push({ type: "sorted", i: low });
      return;
    }
    const pivotIndex = partition(low, high);
    steps.push({ type: "sorted", i: pivotIndex });
    sort(low, pivotIndex - 1);
    sort(pivotIndex + 1, high);
  }

  if (values.length) sort(0, values.length - 1);
  for (let index = 0; index < values.length; index += 1) {
    steps.push({ type: "sorted", i: index });
  }
  return steps;
}

function neighbors(id, cols, rows) {
  const row = Math.floor(id / cols);
  const col = id % cols;
  const found = [];
  if (row > 0) found.push(id - cols);
  if (row + 1 < rows) found.push(id + cols);
  if (col > 0) found.push(id - 1);
  if (col + 1 < cols) found.push(id + 1);
  return found;
}

function rebuild(prev, start, end) {
  if (start === end) return [start];
  if (!prev.has(end)) return null;
  const path = [end];
  let current = end;
  const guard = prev.size + 2;
  for (let step = 0; step < guard; step += 1) {
    current = prev.get(current);
    if (current == null) return null;
    path.push(current);
    if (current === start) {
      path.reverse();
      return path;
    }
  }
  return null;
}

function bfs(model) {
  const cols = model.cols;
  const rows = model.rows;
  const walls = model.walls;
  const start = model.start;
  const end = model.end;
  if (walls.has(start) || walls.has(end)) {
    return { visited: [], path: null, blocked: true };
  }
  const queue = [start];
  let head = 0;
  const seen = new Set([start]);
  const prev = new Map();
  const visited = [];
  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    visited.push(current);
    if (current === end) break;
    const next = neighbors(current, cols, rows);
    for (let i = 0; i < next.length; i += 1) {
      const id = next[i];
      if (seen.has(id) || walls.has(id)) continue;
      seen.add(id);
      prev.set(id, current);
      queue.push(id);
    }
  }
  return { visited: visited, path: rebuild(prev, start, end), blocked: false };
}

function dijkstra(model) {
  const cols = model.cols;
  const rows = model.rows;
  const walls = model.walls;
  const start = model.start;
  const end = model.end;
  const weights = model.weights;
  if (walls.has(start) || walls.has(end)) {
    return { visited: [], path: null, blocked: true };
  }
  const total = cols * rows;
  const dist = new Array(total).fill(Infinity);
  dist[start] = 0;
  const prev = new Map();
  const heap = new MinHeap();
  heap.push(0, start);
  const visited = [];
  const done = new Set();
  while (heap.size) {
    const popped = heap.pop();
    const distance = popped[0];
    const current = popped[1];
    if (done.has(current) || distance !== dist[current]) continue;
    done.add(current);
    visited.push(current);
    if (current === end) break;
    const next = neighbors(current, cols, rows);
    for (let i = 0; i < next.length; i += 1) {
      const id = next[i];
      if (walls.has(id) || done.has(id)) continue;
      const candidate = distance + (weights[id] || 1);
      if (candidate < dist[id]) {
        dist[id] = candidate;
        prev.set(id, current);
        heap.push(candidate, id);
      }
    }
  }
  return {
    visited: visited,
    path: rebuild(prev, start, end),
    blocked: false,
    dist: dist[end],
  };
}

const api = {
  MinHeap: MinHeap,
  bubbleSteps: bubbleSteps,
  quickSteps: quickSteps,
  bfs: bfs,
  dijkstra: dijkstra,
  rebuild: rebuild,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

const FACTS = {
  bubble: "Bubble Sort. Average and worst case O(n²), memory O(1). Each pass walks the unsorted prefix and swaps neighbors that are out of order. The last index of that pass is finished.",
  quick: "Quick Sort. Average O(n log n), worst O(n²), extra memory O(log n) for the recursion. This view pivots on the last element, so an array that is already sorted is the slow case.",
  bfs: "Breadth-first search. Time O(V + E), memory O(V). Every step has the same cost, so the first time the goal is dequeued the path is a shortest path. Yellow cells were visited. Green cells are the path.",
  dijkstra: "Dijkstra. Time O((V + E) log V) with the binary heap used here, memory O(V). The number in a cell is the cost of entering it. Walls are skipped. Yellow cells were settled. Green cells are the cheapest path.",
};

function boot() {
  const COLS = 18;
  const ROWS = 11;
  const algoEl = document.getElementById("algo");
  const speedEl = document.getElementById("speed");
  const sizeEl = document.getElementById("size");
  const sizeField = document.getElementById("size-field");
  const drawField = document.getElementById("draw-field");
  const drawEl = document.getElementById("draw");
  const clearBtn = document.getElementById("clear");
  const randomBtn = document.getElementById("randomize");
  const pauseBtn = document.getElementById("pause");
  const runBtn = document.getElementById("run");
  const statusEl = document.getElementById("status");
  const barsEl = document.getElementById("bars");
  const gridEl = document.getElementById("grid");
  const legendEl = document.getElementById("legend");
  const complexityEl = document.getElementById("complexity");

  const model = {
    cols: COLS,
    rows: ROWS,
    walls: new Set(),
    weights: [],
    start: COLS + 1,
    end: (ROWS - 2) * COLS + (COLS - 2),
  };

  const state = {
    values: [],
    running: false,
    paused: false,
    token: 0,
    painting: false,
  };

  function isPathMode() {
    return algoEl.value === "bfs" || algoEl.value === "dijkstra";
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function makeArray(count) {
    const values = [];
    for (let index = 0; index < count; index += 1) {
      values.push(Math.round(12 + (index * 86) / Math.max(1, count - 1)));
    }
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      const tmp = values[index];
      values[index] = values[swap];
      values[swap] = tmp;
    }
    return values;
  }

  function renderBars(kinds) {
    barsEl.textContent = "";
    for (let index = 0; index < state.values.length; index += 1) {
      const bar = document.createElement("div");
      bar.className = "bar " + ((kinds && kinds[index]) || "idle");
      bar.style.height = state.values[index] + "%";
      bar.title = String(state.values[index]);
      barsEl.appendChild(bar);
    }
  }

  function fillWeights() {
    const total = COLS * ROWS;
    model.weights = [];
    for (let index = 0; index < total; index += 1) {
      model.weights.push(1 + Math.floor(Math.random() * 9));
    }
  }

  function randomWalls() {
    model.walls.clear();
    const total = COLS * ROWS;
    for (let index = 0; index < total; index += 1) {
      if (index === model.start || index === model.end) continue;
      if (Math.random() < 0.24) model.walls.add(index);
    }
    fillWeights();
  }

  function renderGrid(marks) {
    const visited = (marks && marks.visited) || new Set();
    const path = (marks && marks.path) || new Set();
    const frontier = marks ? marks.frontier : null;
    gridEl.style.gridTemplateColumns = "repeat(" + COLS + ", minmax(0, 1fr))";
    gridEl.textContent = "";
    const total = COLS * ROWS;
    const showWeights = algoEl.value === "dijkstra";
    for (let index = 0; index < total; index += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.i = String(index);
      if (model.walls.has(index)) cell.classList.add("wall");
      else if (index === model.start) cell.classList.add("start");
      else if (index === model.end) cell.classList.add("end");
      else if (path.has(index)) cell.classList.add("path");
      else if (index === frontier) cell.classList.add("frontier");
      else if (visited.has(index)) cell.classList.add("visited");
      if (showWeights && !model.walls.has(index) && index !== model.start && index !== model.end) {
        cell.textContent = String(model.weights[index]);
      }
      gridEl.appendChild(cell);
    }
  }

  function renderLegend() {
    const items = isPathMode()
      ? [
          ["start", "Start"],
          ["end", "Goal"],
          ["wall", "Wall"],
          ["visited", "Visited"],
          ["frontier", "Current"],
          ["path", "Path"],
        ]
      : [
          ["idle", "Unsorted"],
          ["compare", "Comparing"],
          ["swap", "Swapping"],
          ["pivot", "Pivot"],
          ["sorted", "Finished"],
        ];
    legendEl.textContent = "";
    items.forEach(function (item) {
      const li = document.createElement("li");
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      if (isPathMode()) swatch.style.background = colorFor(item[0]);
      else swatch.style.background = barColor(item[0]);
      li.appendChild(swatch);
      li.appendChild(document.createTextNode(item[1]));
      legendEl.appendChild(li);
    });
  }

  function colorFor(name) {
    return {
      start: "#2de2e6",
      end: "#ff4d8d",
      wall: "#3a465c",
      visited: "#ffe14a",
      frontier: "#7eb6ff",
      path: "#3ddc97",
    }[name];
  }

  function barColor(name) {
    return {
      idle: "#3ec6e0",
      compare: "#ffe14a",
      swap: "#ff4d4d",
      pivot: "#b388ff",
      sorted: "#3ddc97",
    }[name];
  }

  function syncChrome() {
    const pathMode = isPathMode();
    sizeField.hidden = pathMode;
    drawField.hidden = !pathMode;
    clearBtn.hidden = !pathMode;
    barsEl.hidden = pathMode;
    gridEl.hidden = !pathMode;
    complexityEl.textContent = FACTS[algoEl.value];
    renderLegend();
    if (pathMode) renderGrid();
    else renderBars();
  }

  function cancelRun() {
    state.token += 1;
    state.running = false;
    state.paused = false;
    pauseBtn.textContent = "Pause";
  }

  function pace() {
    const value = Number(speedEl.value);
    const t = (value - 1) / 99;
    if (t > 0.92) return { delay: 0, batch: 28 };
    if (t > 0.75) return { delay: 16, batch: 4 };
    return { delay: Math.round(260 * Math.pow(1 - t, 1.5)), batch: 1 };
  }

  function wait(ms, token) {
    return new Promise(function (resolve) {
      let left = ms;
      function tick() {
        if (token !== state.token) {
          resolve(false);
          return;
        }
        if (state.paused) {
          setTimeout(tick, 30);
          return;
        }
        if (left <= 0) {
          requestAnimationFrame(function () {
            resolve(token === state.token);
          });
          return;
        }
        const slice = Math.min(30, left);
        left -= slice;
        setTimeout(tick, slice);
      }
      tick();
    });
  }

  async function runSort() {
    const token = state.token;
    const original = state.values.slice();
    const steps = algoEl.value === "quick" ? quickSteps(original) : bubbleSteps(original);
    const values = original.slice();
    const kinds = new Array(values.length).fill("idle");
    let comparisons = 0;
    let swaps = 0;
    renderBars(kinds);

    for (let index = 0; index < steps.length;) {
      const plan = pace();
      const stop = Math.min(steps.length, index + plan.batch);
      for (let cursor = 0; cursor < kinds.length; cursor += 1) {
        if (kinds[cursor] !== "sorted") kinds[cursor] = "idle";
      }
      for (; index < stop; index += 1) {
        const step = steps[index];
        if (step.type === "compare") {
          comparisons += 1;
          kinds[step.i] = "compare";
          kinds[step.j] = "compare";
        } else if (step.type === "pivot") {
          kinds[step.i] = "pivot";
        } else if (step.type === "swap") {
          swaps += 1;
          const tmp = values[step.i];
          values[step.i] = values[step.j];
          values[step.j] = tmp;
          kinds[step.i] = "swap";
          kinds[step.j] = "swap";
        } else if (step.type === "sorted") {
          kinds[step.i] = "sorted";
        }
      }
      state.values = values;
      renderBars(kinds);
      setStatus("Comparisons " + comparisons + " · Swaps " + swaps);
      const alive = await wait(plan.delay, token);
      if (!alive) return;
    }
    state.values = values;
    setStatus("Sorted. Comparisons " + comparisons + " · Swaps " + swaps + ".");
  }

  async function runSearch() {
    const token = state.token;
    const result = algoEl.value === "dijkstra" ? dijkstra(model) : bfs(model);
    if (result.blocked) {
      setStatus("Start or goal is inside a wall.");
      return;
    }
    const visited = new Set();
    let frontier = null;
    const planBase = pace();
    for (let index = 0; index < result.visited.length;) {
      const plan = pace();
      const stop = Math.min(result.visited.length, index + Math.max(1, plan.batch));
      for (; index < stop; index += 1) {
        frontier = result.visited[index];
        visited.add(frontier);
      }
      renderGrid({ visited: visited, frontier: frontier, path: new Set() });
      setStatus("Visited " + visited.size + " cells");
      const alive = await wait(index === result.visited.length ? planBase.delay : plan.delay, token);
      if (!alive) return;
    }
    if (!result.path) {
      renderGrid({ visited: visited, frontier: null, path: new Set() });
      setStatus("No path. The walls separate the start from the goal. Visited " + visited.size + ".");
      return;
    }
    const path = new Set(result.path);
    renderGrid({ visited: visited, frontier: null, path: path });
    const length = result.path.length - 1;
    const cost = algoEl.value === "dijkstra" && result.dist !== Infinity ? " · Cost " + result.dist : "";
    setStatus("Path found. Visited " + visited.size + " · Length " + length + cost + ".");
  }

  async function run() {
    cancelRun();
    const token = ++state.token;
    state.running = true;
    state.paused = false;
    pauseBtn.textContent = "Pause";
    runBtn.disabled = false;
    try {
      if (isPathMode()) await runSearch();
      else await runSort();
    } finally {
      if (token === state.token) {
        state.running = false;
        state.paused = false;
        pauseBtn.textContent = "Pause";
      }
    }
  }

  function applyDraw(id, dragging) {
    if (state.running) return;
    const mode = drawEl.value;
    if (mode === "start") {
      if (dragging || id === model.end || model.walls.has(id)) return;
      model.start = id;
    } else if (mode === "end") {
      if (dragging || id === model.start || model.walls.has(id)) return;
      model.end = id;
    } else if (id === model.start || id === model.end) {
      return;
    } else if (mode === "erase") {
      model.walls.delete(id);
    } else if (dragging) {
      model.walls.add(id);
    } else if (model.walls.has(id)) {
      model.walls.delete(id);
    } else {
      model.walls.add(id);
    }
    renderGrid();
    setStatus("Grid updated.");
  }

  algoEl.addEventListener("change", function () {
    cancelRun();
    syncChrome();
    setStatus("Ready.");
  });

  sizeEl.addEventListener("input", function () {
    if (isPathMode()) return;
    cancelRun();
    state.values = makeArray(Number(sizeEl.value));
    renderBars();
    setStatus("New array of " + state.values.length + " bars.");
  });

  randomBtn.addEventListener("click", function () {
    cancelRun();
    if (isPathMode()) {
      randomWalls();
      renderGrid();
      setStatus("Walls and weights shuffled.");
    } else {
      state.values = makeArray(Number(sizeEl.value));
      renderBars();
      setStatus("Array shuffled.");
    }
  });

  clearBtn.addEventListener("click", function () {
    cancelRun();
    model.walls.clear();
    renderGrid();
    setStatus("Walls cleared.");
  });

  pauseBtn.addEventListener("click", function () {
    if (!state.running) return;
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "Resume" : "Pause";
    setStatus(state.paused ? "Paused." : "Running.");
  });

  runBtn.addEventListener("click", function () {
    run();
  });

  gridEl.addEventListener("pointerdown", function (event) {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    state.painting = true;
    applyDraw(Number(cell.dataset.i), false);
  });
  gridEl.addEventListener("pointerover", function (event) {
    if (!state.painting) return;
    const cell = event.target.closest(".cell");
    if (!cell) return;
    applyDraw(Number(cell.dataset.i), true);
  });
  window.addEventListener("pointerup", function () {
    state.painting = false;
  });

  window.addEventListener("keydown", function (event) {
    if (event.code !== "Space" || event.target !== document.body) return;
    event.preventDefault();
    if (!state.running) return;
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  });

  fillWeights();
  randomWalls();
  state.values = makeArray(Number(sizeEl.value));
  syncChrome();
  setStatus("Press Run. Randomize builds a new array, or a new set of walls.");
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
