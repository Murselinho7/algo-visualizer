# Algo Visualizer

![HTML](https://img.shields.io/badge/html-css-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-vanilla-F7DF1E?logo=javascript&logoColor=111)
![Install](https://img.shields.io/badge/install-none-success)
![License](https://img.shields.io/badge/license-MIT-blue)

A single page that animates two sorting algorithms and two grid searches. Nothing is installed and nothing is built. Double-click `index.html`.

## Run it

```bash
start index.html
```

Or serve the folder with any static file server. The page loads `style.css` and `app.js` from the same directory.

### Controls

| Control | What it does |
| --- | --- |
| Algorithm | Bubble Sort, Quick Sort, breadth-first search, or Dijkstra |
| Speed | Slider from slow (one step at a time) to fast (many steps per frame) |
| Size | How many bars the sorting view shuffles. Hidden on the grid. |
| Randomize | New bar heights, or a new wall and weight field |
| Pause / Resume | Freezes the animation. Space does the same when focus is on the page. |
| Run | Starts the selected algorithm. Starting again cancels the current run. |
| Draw | On the grid: paint walls, erase, or move the start and the goal. Drag to paint. |

Colors while sorting: cyan is untouched, yellow is a comparison, red is a swap, purple is the pivot, green is a finished index.

Colors on the grid: cyan is the start, pink is the goal, yellow has been visited, blue is the cell being settled, green is the path, near-black is a wall. Dijkstra also prints the enter-cost of each open cell.

## Complexity

`n` is the number of bars. `V` is the number of cells. `E` is the number of steps between neighbors (up, down, left, right).

| Algorithm | Average | Worst | Extra memory | What the page does |
| --- | --- | --- | --- | --- |
| Bubble Sort | O(n²) | O(n²) | O(1) | Repeated neighbor swaps. After pass `i`, the last unsorted index is in its final place. |
| Quick Sort | O(n log n) | O(n²) | O(log n) recursion | Lomuto partition. The pivot is the last element of the range, then it is swapped into its final index. |
| Breadth-first search | O(V + E) | O(V + E) | O(V) | A queue. Equal step costs, so the first time the goal is reached is a shortest path. |
| Dijkstra | O((V + E) log V) | O((V + E) log V) | O(V) | A binary heap. Entering a cell costs the number drawn on it. Edge weights are never negative, which is what makes the first settlement of a cell final. |

Quick Sort's worst case here is an array that is already sorted, because the last element is always the pivot and each partition peels off one item. Randomize before a second run if you want the average shape again. Bubble Sort does the same amount of comparing on every input; only the swap count changes.

On this grid `E` is about `4V` at the borders and less where walls sit. The BFS queue uses a head index, so removing the front cell does not reshuffle the array. Dijkstra pushes a new heap entry when a cheaper path is found and ignores stale entries when they surface.

## GitHub Pages

1. Put `index.html`, `style.css`, `app.js`, and this README at the root of a repository.
2. Push `main`.
3. Open **Settings → Pages** and deploy from branch `main`, folder `/ (root)`.
4. The site is `https://<user>.github.io/<repository>/`.

If this folder stays inside a larger repository, publish that folder as its own repository. Pages serves one site root per repo. An empty `.nojekyll` file next to `index.html` skips Jekyll if a project site ignores unknown files.

## Files

| File | Role |
| --- | --- |
| `index.html` | Controls and stage |
| `style.css` | Dark layout and the color key |
| `app.js` | Algorithms, animation, and grid editing |

The search and sort functions are pure. In Node they can be required from `app.js` because the page boot only runs when `document` exists.

## License

Released under the MIT License.
