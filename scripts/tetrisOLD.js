document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid')
	let squares = Array.from(document.querySelectorAll('.grid div'))
	const scoreDisplay = document.querySelector('#score')
	const startBtn = document.querySelector('#start-button')
	const width = 10 
	let nextRandom = 0
	let timerId	
	let score = 0
	const colors = [
		'blue',
		'green',
		'purple',
		'yellow',
		'light-Blue',
		'red'
	]

	//Tetris Blocks
	const lTetromino = [
		[1, width+1, width*2+1, 2],
		[width, width+1, width+2, width*2+2],
		[1, width+1, width*2+1, width*2],
		[width, width*2, width*2+1, width*2+2]
	]

	const zTetromino = [
		[width+1, width+2, width*2, width*2+1],
		[0, width, width+1, width*2+1],
		[width+1, width+2, width*2, width*2+1],
		[0, width, width+1, width*2+1]
	]

	const tTetromino = [
		[1, width, width+1, width+2],
		[1, width+1, width+2, width*2+1],
		[width, width+1, width+2, width*2+1],
		[1, width, width+1, width*2+1]
	]

	const oTetromino = [
		[0, 1, width, width+1],
		[0, 1, width, width+1],
		[0, 1, width, width+1],
		[0, 1, width, width+1]
	]

	const iTetromino = [
		[1, width+1, width*2+1, width*3+1],
		[width, width+1, width+2, width+3],
		[1, width+1, width*2+1, width*3+1],
		[width, width+1, width+2, width+3]
	]

	const nTetromino = [
		[1, width+1, width, width*2],
		[width, width+1, width*2+1, width*2+2],
		[1, width+1, width, width*2],
		[width, width+1, width*2+1, width*2+2]
	]

	const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, nTetromino]

	let currentPosition = 4
	let currentRotation = 0

	console.log(theTetrominoes[0][0])

	//randomly select tetromino
	let random = Math.floor(Math.random()*theTetrominoes.length)
	let current = theTetrominoes[random][currentRotation]

	//draw 
	function draw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.add('tetromino')
			squares[currentPosition + index].style.backgroundColor = colors[random]
		})
	}

	//undraw
	function undraw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.remove('tetromino')
			squares[currentPosition + index].style.backgroundColor = ''

		})
	}

	//assign function to keyCodes
	function control(e) {
		if(e.keyCode === 37) {
			moveLeft()
		} else if (e.keyCode === 38) {
			rotate()
		} else if (e.keyCode === 39) {
			moveRight()
		} else if (e.keyCode === 40) {
			moveDown()
		}
	}
	document.addEventListener('keyup', control)

	//move down
	function moveDown() {
		undraw()
		currentPosition += width
		draw()
		freeze()
	}

	//freeze
	function freeze() {
		if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			current.forEach(index => squares[currentPosition + index].classList.add('taken'))
			//new tetromino
			random = nextRandom
			nextRandom = Math.floor(Math.random() * theTetrominoes.length)
			current = theTetrominoes[random][currentRotation]
			currentPosition = 4
			draw()
			displayShape()
			addScore()
			gameOver()
		}
	}

	//movement Left
	function moveLeft() {
		undraw()
		const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
		if(!isAtLeftEdge) currentPosition -= 1 
		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
			currentPosition += 1
		}
		draw()
	}

	//movement Right
	function moveRight() {
		undraw()
		const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
		if(!isAtRightEdge) currentPosition += 1 
		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
			currentPosition -= 1
		}
		draw()
	}


	//Fix rotation at edge
	function isAtRight() {
		return current.some(index => (currentPosition + index + 1) % width === 0)
	}

	function isAtLeft() {
		return current.some(index => (currentPosition + index) % width === 0)
	}

	function checkRotatedPosition(P){
		P = P || currentPosition
		if ((P+1) % width < 4) {
			if (isAtRight()) {
				currentPosition += 1
				checkRotatedPosition(P)
			}
		} 
		else if (P % width > 5) {
			if(isAtLeft()) {
				currentPosition -= 1
				checkRotatedPosition(P)
			}
		}
	}

	//rotation
	function rotate() {
		undraw()
		currentRotation ++ 
		if(currentRotation === current.length){
			currentRotation = 0
		}
		current = theTetrominoes[random][currentRotation]
		checkRotatedPosition()
		draw()
	}

	//show next tetromino
	const displaySquares = document.querySelectorAll('.mini-grid div')
	const displayWidth = 4
	let displayIndex = 0

	//without rotations
	const upNextTetrominoes = [
		[1, displayWidth+1, displayWidth*2+1, 2], //L
		[0, displayWidth, displayWidth+1, displayWidth*2+1], //Z
		[1, displayWidth, displayWidth+1, displayWidth+2], //t
		[0, 1, displayWidth, displayWidth+1], //o
		[1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //i
		[1, displayWidth+1, displayWidth, displayWidth*2] //n
	]

 	function displayShape() {
 		displaySquares.forEach(square => {
 			square.classList.remove('tetromino')
 			square.style.backgroundColor = ''
 		})
 		upNextTetrominoes[nextRandom].forEach(index => {
 			displaySquares[displayIndex + index].classList.add('tetromino')
 			displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
 		})
 	}
	
 	//add Start Button
 	startBtn.addEventListener('click', () => {
 		if(timerId) {
 			clearInterval(timerId)
 			timerId = null
 		} else {
 			draw()
 			timerId = setInterval(moveDown, 1000)
 			nextRandom = Math.floor(Math.random()*theTetrominoes.length)
 			displayShape()
 		}
 	})

 	function addScore(){
 		for (let i = 0; i < 199; i +=width) {
 			const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

 			if(row.every(index => squares[index].classList.contains('taken'))) {
 				score += 10
 				scoreDisplay.innerHTML = score
 				row.forEach(index => {
 					squares[index].classList.remove('taken')
 					squares[index].classList.remove('tetromino')
 					squares[index].style.backgroundColor = ''
 				})
 				const squaresRemoved = squares.splice(i, width)
 				squares = squaresRemoved.concat(squares)
 				squares.forEach(cell => grid.appendChild(cell))
 			}
 		}
 	}

 	function gameOver() {
 		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
 			scoreDisplay.innerHTML = 'end'
 			clearInterval(timerId)
 		}
 	}

})