let canvas;
let ctx;
let circlectx;
let circleCanvas;
let tutorialOn = false;
let tutorialDone = false;
let addTetrominoTutorialDone = false;
let drawnOnce = false;
let gameBoardArrayHeight = 20;
let gameBoardArrayWidth = 12;
let startX = 4;
let startY = 0;
let score = 0;
let level = 1;
let winOrLose = "Paused";
let coordinateArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0));
let currentTetromino = [[1,0], [0,1], [1,1], [2,1]];
let upNextTetromino = [];
let upNextTetrominoColor;
let tetrominos = [];
let tetrominoColors = ['cyan'];
let tetrominoId = [];
//let tetrominoColors = ['cyan', 'purple', 'blue', 'yellow', 'orange', 'green', 'red'];
let currentTetrominoColor;
let randomTetromino = Math.floor(Math.random() * tetrominos.length);
let gameBoardArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0));
let DIRECTION = {
	IDLE: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3
};
let direction;
let stoppedShapeArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0));
let gameSpeed = 1000;
let gamePaused = true;
let intervalId = window.setInterval(function(){
	if(winOrLose !== "Game Over"){
		MoveTetrominoDown();
	}
}, gameSpeed);
window.clearInterval(intervalId);
let output;
let editor;
let swapped = false;
let upNextTetrominoSave;
let upNextTetrominoColorSave;
let swappedTetromino = 0;
let firstDone;


class Coordinates{
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}



document.addEventListener('DOMContentLoaded', SetupCanvas);

function CreateCoordinateArray(){
	let i = 0, j = 0;
	let maxWidth = 300; //198
	let maxLength = 332;
	let blockWidth = 17;
	for(let y = 9; y <= maxLength; y += blockWidth) {
		for(let x = 11; x <= maxWidth; x += blockWidth){
			coordinateArray[i][j] = new Coordinates(x,y);
			//console.log(i + ":" + j + " = " + coordinateArray[i][j].x + ":" + coordinateArray[i][j].y);
			i++;
		}
		j++;
		i = 0;
	}
}

function SetupCanvas() {
	canvas = document.getElementById('my-canvas')
	ctx = canvas.getContext('2d');
	canvas.width = 702;
	canvas.height = 717;

	ctx.scale(2, 2);

	ctx.fillStyle = '#555555';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = 'black';
	ctx.strokeRect(6, 6, 210, 346);

	ctx.fillStyle = 'black';
	ctx.font = '16px Arial';

	ctx.strokeRect(225, 6, 120, 80);

	ctx.fillText("SCORE", 225, 113);

	ctx.strokeRect(225, 118, 120, 19);

	ctx.fillText(score.toString(), 235, 133);

	ctx.fillText("LEVEL", 225, 158);
	ctx.strokeRect(295, 143, 50, 19);
	ctx.fillText(level.toString(), 305, 158);

	ctx.fillText("GAMESTATE", 225, 183);
	ctx.fillText(winOrLose, 257.5, 208);
	ctx.strokeRect(225, 188, 120, 30);
	ctx.fillText("CONTROLS", 225, 243);
	ctx.strokeRect(225, 248, 120, 104);
	ctx.font = '14px Arial';
	ctx.fillText("< > : Move L&R", 235, 268);
	ctx.fillText("v : Move Down", 235, 293);
	ctx.fillText("^ : Rotate Right", 235, 318);
	ctx.fillText("C : Swap Block", 235, 343);


	document.addEventListener('keydown', HandleKeyPress);
	CreateTetrominos();
	CreateTetromino();
	UpNextTetromino();

	CreateCoordinateArray();
	initializeEditor();

	setTimeout(function (){
		let confirmAction = confirm("Do you want a tutorial?");
		if(confirmAction) {
			tutorialOn = true;
			output.setOptions({
				fontSize: "24px",
				readOnly: true
			});
			output.setValue("Seems like a normal game of tetris. " +
				"Why don't you try using the Play button on the top right to start it up?");
			document.getElementById("output").style.borderColor = "orange"
			document.getElementById("output").style.borderWidth = "3px";
			drawCircle();
		} else {
			tutorialDone = true;
			addTetrominoTutorialDone = true;
			drawnOnce = true;
			output.session.setMode("ace/mode/javascript");
			output.setValue("/*\n"+ timeStamp() +
				"The following commands exist: */\n " +
				"addTetromino([[coords1], [coords2]], 'color'); //add a tetromino\n " +
				"listTetrominos(); //displays a list of all tetrominos \n " +
				"deleteTetromino(id); //deletes a tetromino \n "+
				"changeNextTetromino(id); //changes the next tetromino \n " +
				"showCommands(); //displays a list of all commands \n "+
				"restartGame(); // starts a new game");
		}
	}, 10);

}

function drawCircle(){
	circleCanvas = document.getElementById('circle');
	circlectx = circleCanvas.getContext('2d');
	circlectx.beginPath();
	circlectx.arc(circleCanvas.width / 2, circleCanvas.height / 2,
		30, 0 , 2*Math.PI, false);
	circlectx.lineWidth = 3;
	circlectx.strokeStyle = '#FF0000';
	circlectx.stroke();
	if(drawnOnce){
		document.getElementById("output").style.borderColor = "orange"
		document.getElementById("output").style.borderWidth = "3px";
		output.setValue("Huh... There seem to be some blocks missing! " +
			"Why don't you pause the game again and add some yourself?");
	}
	drawnOnce = true;
}


function DrawTetromino(){
	if(!gamePaused){
		for(let i = 0; i < currentTetromino.length; i++) {
			let x = currentTetromino[i][0] + startX;
			let y = currentTetromino[i][1] + startY;
			gameBoardArray[x][y] = 1;
			let coorX = coordinateArray[x][y].x;
			let coorY = coordinateArray[x][y].y;
			ctx.fillStyle = currentTetrominoColor;
			ctx.fillRect(coorX, coorY, 16, 16);

		}
	}
}

//MoveAllRowsDown(1, 20);

function DrawNextTetromino(){
		ctx.fillStyle = '#555555';
		ctx.fillRect(226, 7, 118, 78);
		for(let i = 0; i < upNextTetromino.length; i++) {
			let x = upNextTetromino[i][0] + 14;
			let y = upNextTetromino[i][1];
			let coorX = coordinateArray[x][y].x;
			let coorY = coordinateArray[x][y].y;
			ctx.fillStyle = upNextTetrominoColor;
			ctx.fillRect(coorX+1, coorY+4, 16, 16);

	}
}

function HandleKeyPress(key){
	if(gamePaused){
		return;
	}
	if(winOrLose !== "Game Over") {
		if (key.keyCode === 37) {
			direction = DIRECTION.LEFT;
			if (!HittingTheWall() && !CheckForHorizontalCollision()) {
				DeleteTetromino();
				startX--;
				DrawTetromino();
				CheckForVerticalCollision();
			}
		} else if (key.keyCode === 38) {
			RotateTetromino();
		} else if (key.keyCode === 39) {
			direction = DIRECTION.RIGHT;
			if (!HittingTheWall() && !CheckForHorizontalCollision()) {
				DeleteTetromino();
				startX++;
				DrawTetromino();
			}
		} else if (key.keyCode === 40) {
			MoveTetrominoDown();
		} else if (key.keyCode === 67) {
			swapTetrominos();
			swapped = true;
		}
	}
}

function MoveTetrominoDown(){
	direction = DIRECTION.DOWN;
	if(!CheckForVerticalCollision()) {
		DeleteTetromino();
		startY++;
		DrawTetromino();
		DrawNextTetromino();
	}
}

function swapTetrominos(){
	if(!swapped){
		upNextTetrominoSave = upNextTetromino;
		upNextTetrominoColorSave = upNextTetrominoColor;
		DeleteTetromino()

		upNextTetromino = currentTetromino;
		upNextTetrominoColor = currentTetrominoColor;

		currentTetromino = upNextTetrominoSave;
		currentTetrominoColor = upNextTetrominoColorSave;

		randomTetromino = swappedTetromino;
		startY = 0;
		startX = 4;
		DrawNextTetromino();
		DrawTetromino();
	}
}

function pauseGame(){
	if(gamePaused){
		if(!tutorialDone){
			document.getElementById("output").style.borderColor = "#555555";
			document.getElementById("output").style.borderWidth = "1px";
			circlectx.clearRect(0, 0, canvas.width, canvas.height);
			output.setValue("");
			setTimeout(function (){
				drawCircle();
			}, 10000);
		}

		winOrLose = "Playing";
		ctx.fillStyle = '#555555';
		ctx.fillRect(226, 189, 118, 28);
		ctx.font = '16px Arial'
		ctx.fillStyle = 'black';
		ctx.fillText(winOrLose, 257.5, 208);

		intervalId = window.setInterval(function(){
			if(winOrLose !== "Game Over"){
				MoveTetrominoDown();
			}
		}, gameSpeed);
		gamePaused = false;
	} else {
		if(!tutorialDone){
			circlectx.clearRect(0, 0, canvas.width, canvas.height);
			output.setValue("Try using the command addTetromino() and use some self imagined " +
				"coordinates to make a full block with the help of the grid above. Also dont forget to" +
				" add a color afterwards!\nExample: addTetromino([[0,0], [0,1], [1,0]], 'orange');")
			tutorialDone = true;
		}
		winOrLose = "Paused";
		ctx.fillStyle = '#555555';
		ctx.fillRect(226, 189, 118, 28);
		ctx.font = '16px Arial'
		ctx.fillStyle = 'black';
		ctx.fillText(winOrLose, 257.5, 208);

		window.clearInterval(intervalId);
		gamePaused = true;
	}
}


function DeleteTetromino(){
	for(let i = 0; i < currentTetromino.length; i++){
		let x = currentTetromino[i][0] + startX;
		let y = currentTetromino[i][1] + startY;
		gameBoardArray[x][y] = 0;
		let coorX = coordinateArray[x][y].x
		let coorY = coordinateArray[x][y].y
		ctx.fillStyle = '#555555';
		ctx.fillRect(coorX, coorY, 16, 16);
	}
}

function CreateTetrominos(){
	// Push I
	tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
	tetrominoId.push(1);
	// T
	/*tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
	tetrominoId.push(2)
	// Push J
	tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
	tetrominoId.push(3);
	// Push O
	tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
	tetrominoId.push(4);
	// Push L
	tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
	tetrominoId.push(5);
	// Push S
	tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
	tetrominoId.push(6);
	// Push Z
	tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
	tetrominoId.push(7);*/
}

function CreateTetromino(){
	currentTetromino = tetrominos[randomTetromino];
	currentTetrominoColor = tetrominoColors[randomTetromino];
}

function UpNextTetromino(){
	randomTetromino = Math.floor(Math.random() * tetrominos.length);
	upNextTetromino = tetrominos[randomTetromino];
	upNextTetrominoColor = tetrominoColors[randomTetromino];
}

function HittingTheWall(){
	for(let i = 0; i < currentTetromino.length; i++){
		let newX = currentTetromino[i][0] + startX;
		if(newX <= 0 && direction === DIRECTION.LEFT){
			return true;
		} else if(newX >= 11 && direction === DIRECTION.RIGHT){
			return true;
		}
	}
	return false;
}

function CheckCollision(tetrominoCopy){
	if(startY <= 2){
		winOrLose = "Game Over";
		ctx.fillStyle = '#555555';
		ctx.fillRect(226, 189, 118, 28);
		ctx.font = '16px Arial'
		ctx.fillStyle = 'black';
		ctx.fillText(winOrLose, 245, 208);
	} else {
		for(let i = 0; i < tetrominoCopy.length; i++){
			let square = tetrominoCopy[i];
			let x = square[0] + startX;
			let y = square[1] + startY;
			stoppedShapeArray[x][y] = currentTetrominoColor;
		}
		CheckForCompletedRows();
		CreateTetromino();
		UpNextTetromino();
		direction = DIRECTION.IDLE;
		startX = 4;
		startY = 0;
		DrawTetromino();
	}
}

function CheckForVerticalCollision(){
	let collision = false;
	let tetrominoCopy = currentTetromino;
	for(let i = 0; i < tetrominoCopy.length; i++) {
		let square = tetrominoCopy[i];
		let x = square[0] + startX;
		let y = square[1] + startY;
		if (direction === DIRECTION.DOWN) {
			y++;
		}
		if (gameBoardArray[x][y + 1] === 1) {
			if (typeof stoppedShapeArray[x][y + 1] === 'string') {
				DeleteTetromino();
				startY++;
				DrawTetromino();
				collision = true;
				break;
			}

		}
		if (y >= 20) {
			collision = true;
			break;
		}
	}
	if(collision === true) {
		swappedTetromino = randomTetromino;
		CheckCollision(tetrominoCopy);
		swapped = false;
	}
}

function CheckForHorizontalCollision(){
	let tetrominoCopy = currentTetromino;
	let collision = false;
	for(let i = 0; i < tetrominoCopy.length; i++) {
		let square = tetrominoCopy[i];
		let x = square[0] + startX;
		let y = square[1] + startY;

		if(direction === DIRECTION.LEFT){
			x--;
		} else if(direction === DIRECTION.RIGHT){
			x++;
		}
		var stoppedShapeVal = stoppedShapeArray[x][y];
		if(typeof stoppedShapeVal === 'string'){
			collision = true;
			break;
		}
	}
	return collision;
}

function CheckForCompletedRows(){
	let rowsToDelete = 0;
	let startOfDeletion = 0;
	for(let y = 0; y < gameBoardArrayHeight; y++){
		let completed = true;
		for(let x = 0; x < gameBoardArrayWidth; x++){
			let square = stoppedShapeArray[x][y];
			if(square === 0 || (typeof square === 'undefined')){
				completed = false;
				break;
			}
		}
		if(completed) {
			if(startOfDeletion === 0) startOfDeletion = y;
			rowsToDelete++;
			for(let i = 0; i < gameBoardArrayWidth; i++){
				stoppedShapeArray[i][y] = 0;
				gameBoardArray[i][y] = 0;
				console.log(i + "y: " +y)
				let coorX = coordinateArray[i][y].x;
				let coorY = coordinateArray[i][y].y;
				ctx.fillStyle = '#555555';
				ctx.fillRect(coorX, coorY, 16, 16);
			}
		}
	}
	if(rowsToDelete > 0){
		if(rowsToDelete === 1) {
			score += 10;
		} else if(rowsToDelete === 2){
			score += 20;
		} else if(rowsToDelete === 3){
			score += 40;
		} else {
			score += 80;
		}
		ctx.fillStyle = '#555555';
		ctx.fillRect(226, 119, 118, 17);
		ctx.fillStyle = 'black';
		ctx.font = '16px Arial';
		ctx.fillText(score.toString(), 235, 133);
		MoveAllRowsDown(rowsToDelete, startOfDeletion);

		if(score >= level*100){
			level++;
			ctx.fillStyle = '#555555';
			ctx.fillRect(296, 144, 48, 17);
			ctx.fillStyle = 'black';
			ctx.font = '16px Arial';
			ctx.fillText(level.toString(), 305, 158);
			if(level < 10) {
				gameSpeed -= 100;
			} else if(level >= 10){
				gameSpeed = 50;
			}
			clearInterval(intervalId);
			intervalId = window.setInterval(function (){
				if(winOrLose !== "Game Over"){
					MoveTetrominoDown();
				}
			}, gameSpeed);

		}

	}

}

function MoveAllRowsDown(rowsToDelete, startOfDeletion){
	console.log(rowsToDelete+ "bla " + startOfDeletion)
	for(var i = startOfDeletion-1; i >= 0; i--){
		for(var x = 0; x < gameBoardArrayWidth; x++){
			var y2 = i + rowsToDelete;
			var square = stoppedShapeArray[x][i];
			var nextSquare = stoppedShapeArray[x][y2];
			if(typeof square === 'string'){
				nextSquare = square;
				gameBoardArray[x][y2] = 1;
				stoppedShapeArray[x][y2] = square;
				let coorX = coordinateArray[x][y2].x;
				let coorY = coordinateArray[x][y2].y;
				ctx.fillStyle = nextSquare;
				ctx.fillRect(coorX, coorY, 16, 16);

				square = 0;
				gameBoardArray[x][i] = 0;
				stoppedShapeArray[x][i] = 0;
				coorX = coordinateArray[x][i].x;
				coorY = coordinateArray[x][i].y;
				ctx.fillStyle = '#555555';
				ctx.fillRect(coorX, coorY, 16, 16);
			}
		}
	}

}

function RotateTetromino(){
	let newRotation = new Array();
	let tetrominoCopy = currentTetromino;
	let currentTetrominoBU;
	for(let i = 0; i < tetrominoCopy.length; i++){
		currentTetrominoBU = [...currentTetromino];
		let x = tetrominoCopy[i][0];
		let y = tetrominoCopy[i][1];
		let newY = x;
		let newX = (GetLastSquareX() - y);
		newRotation.push([newX, newY]);
	}
	DeleteTetromino();
	try{
		currentTetromino = newRotation;

		DrawTetromino();
	} catch (e){
		if(e instanceof TypeError) {
			currentTetromino = currentTetrominoBU;
			DeleteTetromino();
			DrawTetromino();
		}
	}
}

function GetLastSquareX(){
	let lastX = 0;
	for(let i = 0; i < currentTetromino.length; i++){
		let square = currentTetromino[i];
		if (square[0] > lastX)
			lastX = square[0];
	}
	return lastX;
}

function isColor(strColor){
	var s = new Option().style;
	s.color = strColor;
	return s.color === strColor;
}

function addTetromino(block, color = "blue"){
	if(!isColor(color)){
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nColor: " + color + " is not a supported Color! Try another one!*/");
	} else if(typeof block[0] === "string"){
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nBlock: Input for block can not be String! Use Integer/Numbers!*/");
	} else {
		if (!addTetrominoTutorialDone) {
			output.setOptions({
				fontSize: "16px"
			});
			document.getElementById("output").style.borderColor = "#555555";
			document.getElementById("output").style.borderWidth = "1px";
			output.setValue("/*\nCongratulations! You have successfully added your first Block! \n" +
				"You can see your written Command and the Output in the box above the commandline.\n" +
				"You can see further commands by entering showCommands();*/");
			addTetrominoTutorialDone = true;
		}
		let blockString = "";
		tetrominos.push(block);
		tetrominoId.push(tetrominoId.length + 1);
		for (let count = 0; count < block.length; count++) {
			blockString += "[" + block[count] + "]";
		}
		tetrominoColors.push(color);
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nCreated tetromino with coords: " + blockString + " and color: " + color + "!*/");
	}

}


function listTetrominos(){
	let tetrominoString = "";
	let tetrominoString2 = "";
	for(let count=0; count < tetrominos.length; count++){
		for(let count2=0; count2 < tetrominos[count].length; count2++){
				tetrominoString2 +="["+ tetrominos[count][count2]+"]";
		}
		tetrominoString += "\n Nr."+ tetrominoId[count] +" Coordinates "+tetrominoString2 +
			" with color " +tetrominoColors[count];
		tetrominoString2 = "";
	}
	output.session.insert(0, "\n\n/*\n"+ timeStamp() +"Input: "+ editor.getValue() +"\n\n" +
		"Output: \nFollowing Tetrominos exist:"+tetrominoString+"*/");
}




function deleteTetromino(id){
	id = id + "";
	if (id > tetrominos.length) {
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nTetromino with id " + id + " does not exist!*/");
	} else if (id < 0) {
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nTetromino id can not be negative value!*/");
	} else if (typeof id !== "number") {
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nTetromino id has to be a numerical value!*/");
	} else {
		let blockString = "";
		let colorString = tetrominoColors[id - 1];
		for (let count = 0; count < tetrominos[id - 1].length; count++) {
			blockString += "[" + tetrominos[id - 1][count] + "]";
		}
		tetrominos.splice(id - 1, 1)
		tetrominoColors.splice(id - 1, 1);
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \nDeleted tetromino with coords: " + blockString + " and color: " + colorString + "!*/");
	}
}

function changeNextTetromino(id){
	upNextTetromino = tetrominos[id-1];
	upNextTetrominoColor = tetrominoColors[id-1];
	randomTetromino = id - 1;
	DrawNextTetromino();
	output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
		"Output: \n\nChanged next tetromino to: "+ id+"*/");
}

function timeStamp(){
	let h = new Date().getHours();
	if(h<=9){
		h = "0" + h;
	}
	let m = new Date().getMinutes();
	if(m<=9){
		m = "0" + m;
	}
	let s = new Date().getSeconds();
	if(s<=9){
		s = "0" + s;
	}
	return "[" + h + ":" + m + ":" + s + "]";
}

function restartGame(){
	gamePaused = false;
	pauseGame();
	level = 1;
	ctx.fillStyle = '#555555';
	ctx.fillRect(296, 144, 48, 17);
	ctx.fillStyle = 'black';
	ctx.font = '16px Arial';
	ctx.fillText(level.toString(), 305, 158);

	gameSpeed = 1000;
	clearInterval(intervalId);

	score = 0;
	ctx.fillStyle = '#555555';
	ctx.fillRect(226, 119, 118, 17);
	ctx.fillStyle = 'black';
	ctx.font = '16px Arial';
	ctx.fillText(score.toString(), 235, 133);

	ctx.fillStyle = '#555555';
	ctx.fillRect(10, 16, 205, 332);
	for(let x = 0; x < gameBoardArrayWidth; x++) {
		for(let y = 0; y < gameBoardArrayHeight; y++){
			stoppedShapeArray[x][y] = 0;
			gameBoardArray[x][y] = 0;
		}
	}
	CreateTetromino();
	let randomNext = Math.floor(Math.random() * tetrominoId.length + 1);
	upNextTetromino = tetrominos[randomNext];
	upNextTetrominoColor = tetrominoColors[randomNext];
	randomTetromino = randomNext;
	DrawNextTetromino();
	output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
		"Output: \n\nRestarted the game!*/");
	startY = 0;
	startX = 4;
	DrawTetromino();
}

function showCommands(){
	output.session.insert(0, "\n\n/*\n"+ timeStamp() +"Input: " + editor.getValue() + "\n\nOutput: \n" +
		"The following commands exist: */\n " +
		"addTetromino([[coords1], [coords2]], 'color'); //add a tetromino\n " +
		"listTetrominos(); //displays a list of all tetrominos \n " +
		"deleteTetromino(id); //deletes a tetromino \n "+
		"changeNextTetromino(id); //changes the next tetromino \n " +
		"showCommands(); //displays a list of all commands \n "+
		"restartGame(); // starts a new game");
}

function goToLastLine(){
	let row = output.session.getLength() - 1
	let column = output.session.getLine(row).length
	output.gotoLine(row + 1, column)
}

// TEXT EDITOR -------------------------------------------------------------------------------------------------------
function runCode(){
	let code = editor.getValue();
	let script = document.createElement('script');
	let input = "";
	for(let characterCount = 0; characterCount < code.length; characterCount++){
		if(code[characterCount] === "("){
			break;
		} else {
			input += code[characterCount];
		}
	}

	try {
		if(typeof eval(input) !== "function" && code !== ""){
			output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
				"Output: \n\n"+ editor.getValue() +" is not a valid command!*/");
		} else if(!editor.getValue().endsWith(";") && code !== "") {
			output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
				"Output: \n\nInput is missing semicolon!*/");
		} else {
			try {
				let codeNode = document.createTextNode(code);
				script.appendChild(codeNode);
				document.body.appendChild(script);
			} catch (e) {
				script.text = code;
				document.body.appendChild(script);
			}
		}
	} catch (e){
		output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + editor.getValue() + "\n\n" +
			"Output: \n\n"+ editor.getValue() +" is not a valid command! \nTry using showCommands(); " +
			"to display all the possible commands!*/");
	}
	output.session.setMode("ace/mode/javascript");
	editor.setValue("");
	goToLastLine();
}

function initializeEditor() {
	editor = ace.edit("editor", {
		wrap: true
	});
	editor.setTheme("ace/theme/monokai");
	editor.session.setMode("ace/mode/javascript");
	editor.setOptions({
		fontSize: "16px"
	});
	editor.renderer.setShowGutter(false);

	output = ace.edit("output", {
		wrap: true
	});
	output.setTheme("ace/theme/monokai");
	output.renderer.$cursorLayer.element.style.display = "none"
	output.setOptions({
		fontSize: "16px",
		readOnly: true
	});
}



