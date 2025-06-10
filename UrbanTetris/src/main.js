import './style.css'
import { BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT, EVENT_MOVEMENTS } from './board.js'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT
context.scale(BLOCK_SIZE, BLOCK_SIZE)

const nextCanvas = document.getElementById("next")
const nextCtx = nextCanvas.getContext("2d")

const NEXT_BLOCK_SIZE = 20
const NEXT_WIDTH = 6 
const NEXT_HEIGHT = 6 

nextCanvas.width = NEXT_WIDTH * NEXT_BLOCK_SIZE
nextCanvas.height = NEXT_HEIGHT * NEXT_BLOCK_SIZE
nextCtx.scale(NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE)

let isPaused = false
let Score = 0

const PIECES = [
  {
    id: 1,
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "#FFD700" //  (Cuadrado) - Amarillo
  },
  {
    id: 2,
    shape: [
      [1, 1, 1, 1]
    ],
    color: "#00FFFF" //  (Línea) - Cian
  },
  {
    id: 3,
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "#800080" // T - Púrpura
  },
  {
    id: 4,
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "#FFA500" // L - Naranja
  },
  {
    id: 5,
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "#0000FF" // J - Azul
  },
  {
    id: 6,
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "#FF0000" // S - Rojo
  },
  {
    id: 7,
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "#00FF00" // Z - Verde
  }
];

function getRandomPiece() {
  return structuredClone(PIECES[Math.floor(Math.random() * PIECES.length)])
}

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

function createBoard(width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

let tiempoRef = Date.now()
let acumulado = 0

setInterval(() => {
  const timer = document.getElementById('timer')
  if (!isPaused) {
    const ahora = Date.now()
    acumulado += ahora - tiempoRef
    tiempoRef = ahora
  } else {
    tiempoRef = Date.now()
  }

  timer.innerHTML = formatearMS(acumulado)
}, 1000 / 60)




function formatearMS(tiempo_ms) {
  const S = Math.floor(tiempo_ms / 1000) % 60
  const M = Math.floor(tiempo_ms / 60000) % 60
  const H = Math.floor(tiempo_ms / 3600000)
  const ceros = (n, cant) => String(n).padStart(cant, '0')
  
  return `${ceros(H, 2)}:${ceros(M, 2)}:${ceros(S, 2)}`
}

const pauseBtn = document.getElementById('pause-btn')
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused
  pauseBtn.innerText = isPaused ? 'CONTINUAR' : 'PAUSE'
})


const restartBtn = document.getElementById('restart-btn')
restartBtn.addEventListener('click', () => {

  board.forEach((row) => row.fill(0))
  

  Score = 0
  
  acumulado = 0
  tiempoRef = Date.now()
  
  currentPiece = getRandomPiece()
  currentPiece.position = { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 }
  
  nextPiece = getRandomPiece()
  drawNextPiece(nextPiece)
  
  // Reiniciar contadores del game loop
  dropCounter = 0
  lasTime = 0
  
  if (isPaused) {
    isPaused = false
    pauseBtn.innerText = 'PAUSE'
  }
  
  draw()
})

// piezas
let currentPiece = getRandomPiece()
currentPiece.position = { x: 5, y: 0 }

let nextPiece = getRandomPiece()
drawNextPiece(nextPiece)

function drawNextPiece(piece) {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height)

  const rows = piece.shape.length
  const cols = piece.shape[0].length
  const offsetX = Math.floor((nextCanvas.width / NEXT_BLOCK_SIZE - cols) / 2)
  const offsetY = Math.floor((nextCanvas.height / NEXT_BLOCK_SIZE - rows) / 2)

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        nextCtx.fillStyle = piece.color
        nextCtx.fillRect(x + offsetX, y + offsetY, 1, 1)
        nextCtx.strokeStyle = piece.color 
        nextCtx.strokeRect(x + offsetX, y + offsetY, 1, 1)
      }
    })
  })
}
let dropCounter = 0
let lasTime = 0

function update(time = 0) {
  if (isPaused) {
    window.requestAnimationFrame(update)
    return
  }

  const deltaTime = time - lasTime
  lasTime = time
  dropCounter += deltaTime

  if (dropCounter > 1000) {
    currentPiece.position.y++
    dropCounter = 0
    if (checkCollision()) {
      currentPiece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  draw()
  window.requestAnimationFrame(update)
}

function draw() {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value == 1) {
        context.fillStyle = '#ffacec'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = currentPiece.color
        context.fillRect(x + currentPiece.position.x, y + currentPiece.position.y, 1, 1)
      }
    })
  })

  document.querySelector('span').innerText = Score
}

document.addEventListener('keydown', (event) => {
  if (event.key == EVENT_MOVEMENTS.LEFT) {
    currentPiece.position.x--
    if (checkCollision()) currentPiece.position.x++
  }

  if (event.key == EVENT_MOVEMENTS.RIGHT) {
    currentPiece.position.x++
    if (checkCollision()) currentPiece.position.x--
  }

  if (event.key == EVENT_MOVEMENTS.DOWN) {
    currentPiece.position.y++
    if (checkCollision()) {
      currentPiece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  if (event.key == 'ArrowUp') {
    const rotated = []
    for (let i = 0; i < currentPiece.shape[0].length; i++) {
      const row = []
      for (let j = currentPiece.shape.length - 1; j >= 0; j--) {
        row.push(currentPiece.shape[j][i])
      }
      rotated.push(row)
    }

    const prevShape = currentPiece.shape
    currentPiece.shape = rotated
    if (checkCollision()) {
      currentPiece.shape = prevShape
    }
  }
})

function checkCollision() {
  return currentPiece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 &&
        board[y + currentPiece.position.y]?.[x + currentPiece.position.x] !== 0
      )
    })
  })
}

function solidifyPiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value == 1) {
        board[y + currentPiece.position.y][x + currentPiece.position.x] = 1
      }
    })
  })

  currentPiece = nextPiece
  currentPiece.position = { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 }

  nextPiece = getRandomPiece()
  drawNextPiece(nextPiece)

  if (checkCollision()) {
    window.alert('Game Over')
    board.forEach((row) => row.fill(0))
  }
}

function removeRows() {
  const rowsToRemove = []
  board.forEach((row, y) => {
    if (row.every(value => value == 1)) {
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
    Score += 1
  })
}

update()