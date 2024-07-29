
    const colors = ['red', 'green', 'blue', 'orange', 'white', 'yellow'];
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    let cubeState = {};
    
    function initCube() {
      faces.forEach((face, index) => {
        cubeState[face] = Array(9).fill(colors[index]);
        const faceElement = document.querySelector(`.${face}`);
        faceElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.style.backgroundColor = colors[index];
          faceElement.appendChild(cell);
        }
      });
    }
    
    function updateCube() {
      faces.forEach(face => {
        const cells = document.querySelectorAll(`.${face} .cell`);
        cells.forEach((cell, index) => {
          cell.style.backgroundColor = cubeState[face][index];
        });
      });
    }
    
    function rotateFace(face, clockwise = true) {
      const newState = [...cubeState[face]];
      const rotationOrder = clockwise ? [6, 3, 0, 7, 4, 1, 8, 5, 2] : [2, 5, 8, 1, 4, 7, 0, 3, 6];
      for (let i = 0; i < 9; i++) {
        newState[i] = cubeState[face][rotationOrder[i]];
      }
      cubeState[face] = newState;
    
      // Update adjacent faces
      const adjacentFaces = {
        'front': ['top', 'right', 'bottom', 'left'],
        'back': ['top', 'left', 'bottom', 'right'],
        'right': ['top', 'back', 'bottom', 'front'],
        'left': ['top', 'front', 'bottom', 'back'],
        'top': ['back', 'right', 'front', 'left'],
        'bottom': ['front', 'right', 'back', 'left']
      };
    
      const affectedCells = {
        'front': [[6,7,8], [0,3,6], [2,1,0], [8,5,2]],
        'back': [[2,1,0], [0,3,6], [6,7,8], [8,5,2]],
        'right': [[8,5,2], [0,3,6], [0,3,6], [8,5,2]],
        'left': [[0,3,6], [0,3,6], [8,5,2], [8,5,2]],
        'top': [[0,1,2], [0,1,2], [0,1,2], [0,1,2]],
        'bottom': [[6,7,8], [6,7,8], [6,7,8], [6,7,8]]
      };
    
      const adj = adjacentFaces[face];
      const aff = affectedCells[face];
    
      let temp = [cubeState[adj[0]][aff[0][0]], cubeState[adj[0]][aff[0][1]], cubeState[adj[0]][aff[0][2]]];
    
      if (clockwise) {
        for (let i = 0; i < 3; i++) {
          cubeState[adj[0]][aff[0][i]] = cubeState[adj[3]][aff[3][i]];
          cubeState[adj[3]][aff[3][i]] = cubeState[adj[2]][aff[2][i]];
          cubeState[adj[2]][aff[2][i]] = cubeState[adj[1]][aff[1][i]];
          cubeState[adj[1]][aff[1][i]] = temp[i];
        }
      } else {
        for (let i = 0; i < 3; i++) {
          cubeState[adj[0]][aff[0][i]] = cubeState[adj[1]][aff[1][i]];
          cubeState[adj[1]][aff[1][i]] = cubeState[adj[2]][aff[2][i]];
          cubeState[adj[2]][aff[2][i]] = cubeState[adj[3]][aff[3][i]];
          cubeState[adj[3]][aff[3][i]] = temp[i];
        }
      }
    
      updateCube();
    }
    
    function rotateMiddle(slice, clockwise = true) {
      const sliceConfig = {
        'M': {
          faces: ['top', 'front', 'bottom', 'back'],
          indices: [1, 4, 7],
          reverse: ['back']
        },
        'E': {
          faces: ['front', 'right', 'back', 'left'],
          indices: [3, 4, 5],
          reverse: []
        },
        'S': {
          faces: ['top', 'right', 'bottom', 'left'],
          indices: [1, 4, 7],
          reverse: ['left', 'right']
        }
      };
    
      const { faces, indices, reverse } = sliceConfig[slice];
      const temp = indices.map(i => cubeState[faces[0]][i]);
    
      if (clockwise) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            let fromFace = faces[3];
            let toFace = faces[0];
            if (reverse.includes(fromFace)) {
              cubeState[toFace][indices[j]] = cubeState[fromFace][indices[2-j]];
            } else if (reverse.includes(toFace)) {
              cubeState[toFace][indices[2-j]] = cubeState[fromFace][indices[j]];
            } else {
              cubeState[toFace][indices[j]] = cubeState[fromFace][indices[j]];
            }
          }
          faces.unshift(faces.pop());
        }
      } else {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            let fromFace = faces[1];
            let toFace = faces[0];
            if (reverse.includes(fromFace)) {
              cubeState[toFace][indices[j]] = cubeState[fromFace][indices[2-j]];
            } else if (reverse.includes(toFace)) {
              cubeState[toFace][indices[2-j]] = cubeState[fromFace][indices[j]];
            } else {
              cubeState[toFace][indices[j]] = cubeState[fromFace][indices[j]];
            }
          }
          faces.push(faces.shift());
        }
      }
    
      updateCube();
    }
    
    function scramble() {
      const allMoves = [
        ...faces.flatMap(face => [`${face}`, `${face}'`]),
        'M', "M'", 'E', "E'", 'S', "S'"
      ];
      for (let i = 0; i < 20; i++) {
        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        if (randomMove.length === 1 || randomMove === "M'" || randomMove === "E'" || randomMove === "S'") {
          if (randomMove.includes('M') || randomMove.includes('E') || randomMove.includes('S')) {
            rotateMiddle(randomMove[0], !randomMove.includes("'"));
          } else {
            rotateFace(randomMove, true);
          }
        } else {
          rotateFace(randomMove[0], false);
        }
      }
    }
    
    function reset() {
      initCube();
    }
    
    // 3D rotation
    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    
    const scene = document.getElementById('scene');
    const cube = document.getElementById('cube');
    
    scene.addEventListener('mousedown', (e) => {
        isDragging = true;
    });
    
    scene.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
    
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
    
        const rotationSpeed = 0.005;
    
        cube.style.transform = `${cube.style.transform} rotateY(${deltaMove.x * rotationSpeed}rad) rotateX(${-deltaMove.y * rotationSpeed}rad)`;
    
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });
    
    document.addEventListener('mouseup', (e) => {
        isDragging = false;
    });
    
    initCube();