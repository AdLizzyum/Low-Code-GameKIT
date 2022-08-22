let canvas;
let ctx;
let output;
let editor;
let gamePaused = true;
let initialized = false;
let FPS = 30;
let GAME_LIVES = 1;
let FRICTION = 0.7;
let LASER_EXPLODE_DURATION = 0.1;
let LASER_DISTANCE = 0.6;
let LASER_MAX = 10;
let LASER_SPEED = 500;
let ASTEROIDS_POINTS_LARGE = 20;
let ASTEROIDS_POINTS_MEDIUM = 50;
let ASTEROIDS_POINTS_SMALL = 100;
let ASTEROIDS_JAG = 0.3;
let ASTEROIDS_NUM = 0;
let ASTEROIDS_SIZE = 100;
let ASTEROIDS_SPD = 50;
let ASTEROIDS_VERT = 10;
let SAVE_KEY_SCORE = "highscore";
let SHIP_SIZE = 30;
let SHIP_THRUST = 5;
let SHIP_EXPLODE_DURATION = 0.3;
let SHIP_BLINK_DURATION = 0.1;
let SHIP_INV_DURATION = 3;
let TURN_SPEED = 360;
let SHOW_BOUNDING = false;
let SHOW_CENTRE_DOT = false;
let TEXT_FADE_TIME = 2.5;
let TEXT_SIZE = 40;
let invulnerable = false;
let shootButton = 32;
let forwardButton = 38;
let leftButton = 37;
let rightButton = 39;
var level, lives, asteroids, score, scoreHigh, ship, text, textAlpha, exploding, blinkOn;
let keyCodeSens;
let eventListenerExists = false;
let keyBindSave = "";
let settingKeybind = false;
let code;
let validCommand = false;
let creatingAsteroids = false;
let tutorialOn;
let tutorialDone = false;
let triggeredOnce = false;
let introTriggered = false;
let keybindTutorialDone = false;
let shootTutorialActive = false;
let asteroidTriggered = false;
let asteroidTutorialActive = false;
let endOfTutorial = false;
let asteroidSize;
let keybindEditorTutorial = "function keyDown(/** @type {keyboardEvent} */ ev) {\n" +
    "    if(ev.keyCode === ){\n" +
    "        \n" +
    "    }\n" +
    "}\n\n" +
    "function keyUp(/** @type {keyboardEvent} */ ev) {\n" +
    "    if(ev.keyCode === ){\n" +
    "        \n" +
    "    }\n" +
    "}\n"+
    "document.addEventListener(\"keydown\", keyDown);\n" +
    "document.addEventListener(\"keyup\", keyUp);"

let keybindOutputTutorial = "//  Try binding a movement method to a key: \n " +
    "thrust(); //move forward with thrusters \n " +
    "stopThruster(); //stops the ship thruster \n " +
    "moveLeft(); //rotates the ship to the left \n " +
    "moveRight(); //rotates the ship to the right \n " +
    "stopRotating(); //stops ship-rotation \n" +
    "//  Putting the keyCode into the if condition runs the specified method on button press.\n" +
    "//  keyDown is active while the button is held. keyUp activates when the button is let go.";

let laserBindingOutput = "//Try using these methods in keybindings:\n " +
    "shootLaser(); //shoots a laser \n "+
    "reloadLaser(); //readies a new laser \n" +
    "//To add more conditions, add else if()\n" +
    "//Example: \nif(ev.keyCode === 37){\n" +
    "   moveLeft();\n" +
    "} else if(ev.keyCode === 32){\n" +
    "   shootLaser();\n" +
    "}\n" +
    "//Reminder: keyDown on press, keyUp on release";

document.addEventListener('DOMContentLoaded', SetupCanvas);


function SetupCanvas() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    newGame();

    ship = newShip();

    keyCodeSens = document.getElementById("keyCodeSens");
    keyCodeSens.addEventListener("keydown", function(event) {
        if(event.key === " "){
            document.getElementById("keyCodeSens").innerHTML = "KeyCode: SPACE" +
                " has the keyCode " + event.keyCode;
        }else {
            document.getElementById("keyCodeSens").innerHTML = "KeyCode: "+event.key.toUpperCase() +
                " has the keyCode " + event.keyCode;
        }
    }, false);

}

function setKeybindings(){
    settingKeybind = true;
    if(keybindTutorialDone && !shootTutorialActive){
        output.session.insert(0, "\n\n/*\n"+ timeStamp() +"Input: " + code + "\n\nOutput: \n" +
            "The following methods can be bound to keys: */\n " +
            "createAsteroid('small'|'medium'|'large'); //add an asteroid\n " +
            "toggleInvulnerability(); //toggles invulnerability \n " +
            "shootLaser(); //shoots a laser \n "+
            "reloadLaser(); //readies a new laser \n " +
            "thrust(); //turn on ship thruster moving forward \n " +
            "stopThruster(); //stops the ship thruster \n " +
            "moveLeft(); //rotates the ship to the left \n " +
            "moveRight(); //rotates the ship to the right \n " +
            "stopRotating(); //stops any rotation of the ship");

        if(eventListenerExists){
            document.removeEventListener("keydown", keyDown);
            const body = document.getElementsByTagName('body')[0];
            for(var scriptCount = 0; scriptCount < body.getElementsByTagName('script').length; scriptCount++){
                body.removeChild(body.getElementsByTagName('script')[0])
            }
            editor.setValue(keyBindSave);
        } else {
            editor.setValue("function keyDown(/** @type {keyboardEvent} */ ev) {\n" +
                "    if(ev.keyCode === ){\n" +
                "        shootLaser();\n" +
                "    }\n" +
                "}\n\n" +
                "function keyUp(/** @type {keyboardEvent} */ ev) {\n" +
                "    if(ev.keyCode === ){\n" +
                "        reloadLaser();\n" +
                "    }\n" +
                "}\n"+
                "document.addEventListener(\"keydown\", keyDown);\n" +
                "document.addEventListener(\"keyup\", keyUp);");
            eventListenerExists = true;
        }
    } else if (shootTutorialActive){
        editor.setValue(keyBindSave);
        output.setValue(laserBindingOutput);
    } else {
        output.setValue("//  First we should get the keyCode for the button we want to use. " +
            "To find out the keyCode for a button, simply click on the KeyCode Area down below and press a button.\n");
    }

    validCommand = true;
}

asteroids = [];
createAsteroidBelt();

//document.addEventListener("keydown", keyDown);
//document.addEventListener("keyup", keyUp);

let intervalId = setInterval(update, 1000 / FPS);


function pauseGame(){
    if(gamePaused){
        setTimeout(function (){
            gamePaused = false;
        }, 30);
        TEXT_FADE_TIME = 2.5;
        if(!tutorialDone && !introTriggered){
            document.getElementById("output").style.borderColor = "#555555";
            document.getElementById("output").style.borderWidth = "1px";
            document.getElementById("border-container").style.borderWidth = "0px";
            output.setValue("");
            setTimeout(function (){
                drawCircle();
            }, 5000);
            introTriggered = true;
        }

    } else {
        text = "Paused";
        textAlpha = 1.0;
        setTimeout(function (){
            gamePaused = true;
            }, 30);
        TEXT_FADE_TIME = 0;

    }

}


function update() {
    if (!gamePaused || !initialized) {
        blinkOn = ship.blinkNumber % 2 === 0;
        exploding = ship.explodeTime;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        handleShipMovement();

        if (!exploding) {
            if (blinkOn && !ship.dead) {
                drawShip(ship.x, ship.y, ship.a);
            }
            if (ship.blinkNumber > 0) {
                handleBlinking();
            }
        } else {
            drawExplosion();
        }

        checkDebuggingOptions();

        drawAsteroids();
        drawLaser();

        if (textAlpha >= 0) {
            drawLevelText();
        } else if (ship.dead) {
            newGame();
        }

        drawLives();
        drawScore();
        drawHighScore();

        checkLaserCollision();
        if (!invulnerable) {
            checkCollision();
        } else {
            ship.a += ship.rot;

            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;
        }
        checkShipOutOfBounds();

        moveLasers();
        moveAsteroids();
        if (!initialized) {
            initializeEditor();
        }
    }
    if (!triggeredOnce && keyCodeSens.innerHTML !== "KeyCodes: Click here and press a key to see its keyCode!" && !keybindTutorialDone) {
        keybindTutorial();
    }
    initialized = true;

}

function keybindTutorial(){
    editor.setValue(keybindEditorTutorial);
    output.setValue(keybindOutputTutorial);
    triggeredOnce = true;
}

function createAsteroidBelt() {
    asteroids = [];
    var x, y;
    for (var count = 0; count < ASTEROIDS_NUM + level; count++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 2)));
    }
}


function destroyAsteroid(index) {
    var x = asteroids[index].x;
    var y = asteroids[index].y;
    var r = asteroids[index].r;

    if (r === Math.ceil(ASTEROIDS_SIZE / 2)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
        score += ASTEROIDS_POINTS_LARGE;
    } else if (r === Math.ceil(ASTEROIDS_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
        score += ASTEROIDS_POINTS_MEDIUM;
    } else {
        score += ASTEROIDS_POINTS_SMALL;
    }

    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    asteroids.splice(index, 1);

    if (asteroids.length === 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, color = "white") {
    ctx.strokeStyle = color;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( //nose ship
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo( // rear left ship
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( // rear right ship
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DURATION * FPS);
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}
/*
function keyDown(/** @type {keyboardEvent} *//* ev) {
    if (ship.dead) {
        return;
    }
    if(ev.keyCode === shootButton){
        shootLaser();
    } else if(ev.keyCode === leftButton){ //Movement left
        moveLeft();
    } else if(ev.keyCode === forwardButton){
        thrust();
    } else if(ev.keyCode === rightButton){
        moveRight();
    }
}*/

function shootLaser() {
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPEED * Math.cos(ship.a) / FPS,
            yv: -LASER_SPEED * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }

    ship.canShoot = false;
}

function reloadLaser(){
    if(!ship.dead){
        ship.canShoot = true;
    }
}

function moveLeft(){
    if(!ship.dead){
        ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
    }
}

function moveRight(){
    if(!ship.dead){
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
    }
}

function thrust(){
    if(!ship.dead){
        ship.thrusting = true;
    }
}

function stopThruster(){
    if(!ship.dead){
        ship.thrusting = false;
    }
}

function stopRotating(){
    if(!ship.dead){
        ship.rot = 0;
    }
}

/*function keyUp(/** @type {keyboardEvent} */ /*ev) {
    if(ev.keyCode === shootButton && !ship.dead){
        reloadLaser();
    } else if(ev.keyCode === leftButton && !ship.dead){
        stopRotating();
    } else if(ev.keyCode === forwardButton && !ship.dead){
        stopThruster();
    } else if(ev.keyCode === rightButton && !ship.dead){
        stopRotating();
    }
} */

function isKeyCode(e){
    console.log(e + "  "+ e.key);
    e = e.key;
    console.log(String.fromCharCode(e.keyCode));
    console.log(e.keyCode);
}

function getKeyCode(event) {
    var x = event.which || event.keyCode;
    console.log("The keyCode is: " + x);
}

function newAsteroid(x, y, r) {
    var lvlMult = 1 + 0.1 * level;
    var asteroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2,
        r: r,
        vert: Math.floor(Math.random() * (ASTEROIDS_VERT + 1) + ASTEROIDS_VERT / 2),
        offs: []
    };

    for (var offsetCount = 0; offsetCount < asteroid.vert; offsetCount++) {
        asteroid.offs.push(Math.random() * ASTEROIDS_JAG * 2 + 1 - ASTEROIDS_JAG)
    }

    return asteroid;
}

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    ship = newShip();

    var scoreString = scoreHigh = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreString === null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreString);
    }

    newLevel();
}

function newLevel() {
    if(level > 0){
        text = "Level " + (level + 1);
    } else {
        text = "Start Game!"
    }
    textAlpha = 1.0;
    asteroids = [];
    createAsteroidBelt();
}

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI,
        blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
        blinkNumber: Math.ceil(SHIP_INV_DURATION / SHIP_BLINK_DURATION),
        canShoot: true,
        dead: false,
        lasers: [],
        explodeTime: 0,
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}


function moveLasers() {
    for (var laserCount = ship.lasers.length - 1; laserCount >= 0; laserCount--) {
        if (ship.lasers[laserCount].dist > LASER_DISTANCE * canvas.width) {
            ship.lasers.splice(laserCount, 1);
            continue;
        }

        if (ship.lasers[laserCount].explodeTime > 0) {
            ship.lasers[laserCount].explodeTime--;

            if (ship.lasers[laserCount].explodeTime === 0) {
                ship.lasers.splice(laserCount, 1);
                continue;
            }
        } else {
            ship.lasers[laserCount].x += ship.lasers[laserCount].xv;
            ship.lasers[laserCount].y += ship.lasers[laserCount].yv;

            ship.lasers[laserCount].dist += Math.sqrt(Math.pow(ship.lasers[laserCount].xv, 2)
                + Math.pow(ship.lasers[laserCount].yv, 2));
        }

        if (ship.lasers[laserCount].x < 0) {
            ship.lasers[laserCount].x = canvas.width;
        } else if (ship.lasers[laserCount].x > canvas.width) {
            ship.lasers[laserCount].x = 0;
        }
        if (ship.lasers[laserCount].y < 0) {
            ship.lasers[laserCount].y = canvas.height
        } else if (ship.lasers[laserCount].y > canvas.height) {
            ship.lasers[laserCount].y = 0;
        }

    }
}

function drawExplosion() {
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawLaser() {
    for (var laserCount = 0; laserCount < ship.lasers.length; laserCount++) {
        if (ship.lasers[laserCount].explodeTime === 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[laserCount].x, ship.lasers[laserCount].y,
                SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[laserCount].x, ship.lasers[laserCount].y,
                ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[laserCount].x, ship.lasers[laserCount].y,
                ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[laserCount].x, ship.lasers[laserCount].y,
                ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }
}

function drawLives() {
    var lifeColor
    for (var lifeCount = 0; lifeCount < lives; lifeCount++) {
        lifeColor = exploding && lifeCount === lives - 1 ? "red" : "white";
        drawShip(SHIP_SIZE + lifeCount * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor);
    }
}

function drawAsteroids() {
    var x, y, r, a, vert, offs;
    for (var asteroidCount = 0; asteroidCount < asteroids.length; asteroidCount++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;

        x = asteroids[asteroidCount].x;
        y = asteroids[asteroidCount].y;
        r = asteroids[asteroidCount].r;
        a = asteroids[asteroidCount].a;
        vert = asteroids[asteroidCount].vert;
        offs = asteroids[asteroidCount].offs;

        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

        for (var polyCount = 1; polyCount < vert; polyCount++) {
            ctx.lineTo(
                x + r * offs[polyCount] * Math.cos(a + polyCount * Math.PI * 2 / vert),
                y + r * offs[polyCount] * Math.sin(a + polyCount * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }
}

function drawThrusterFire() {
    ctx.fillStyle = "orange"
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = SHIP_SIZE / 10;
    ctx.beginPath();
    ctx.moveTo( //rear left fire
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
    );
    ctx.lineTo( // rear centre fire
        ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
        ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
    );
    ctx.lineTo( // rear right fire
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function checkCollision() {

        if (!exploding) {
            if (ship.blinkNumber === 0 && !ship.dead) {
                for (var collisionCount = 0; collisionCount < asteroids.length; collisionCount++) {
                    if (distBetweenPoints(ship.x, ship.y, asteroids[collisionCount].x, asteroids[collisionCount].y) <
                        ship.r + asteroids[collisionCount].r) {
                        explodeShip();
                        destroyAsteroid(collisionCount);
                        break;
                    }
                }
            }

            ship.a += ship.rot;

            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;
        } else {
            ship.explodeTime--;

            if (ship.explodeTime === 0) {
                lives--;
                if (lives === 0) {
                    gameOver();
                } else {
                    ship = newShip();
                }
            }
        }

}

function drawHighScore() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white";
    ctx.font = TEXT_SIZE * 0.75 + "px dejavu sans mono"
    ctx.fillText("HIGH SCORE: " + scoreHigh, canvas.width / 2, SHIP_SIZE);
}

function drawScore() {
    ctx.textAlign = "right";
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white";
    ctx.font = TEXT_SIZE + "px dejavu sans mono"
    ctx.fillText(score, canvas.width - SHIP_SIZE / 2, SHIP_SIZE);
}

function checkDebuggingOptions() {
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    if (SHOW_CENTRE_DOT) {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }
}

function handleBlinking() {
    ship.blinkTime--;
    //reduce the blink num
    if (ship.blinkTime === 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DURATION * FPS);
        ship.blinkNumber--;
    }
}

function checkLaserCollision() {
    var ax, ay, ar, lx, ly;
    for (var asteroidCount = asteroids.length - 1; asteroidCount >= 0; asteroidCount--) {

        ax = asteroids[asteroidCount].x;
        ay = asteroids[asteroidCount].y;
        ar = asteroids[asteroidCount].r;

        for (var laserCount = ship.lasers.length - 1; laserCount >= 0; laserCount--) {
            lx = ship.lasers[laserCount].x;
            ly = ship.lasers[laserCount].y;

            if (ship.lasers[laserCount].explodeTime === 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
                destroyAsteroid(asteroidCount);
                ship.lasers[laserCount].explodeTime = Math.ceil(LASER_EXPLODE_DURATION * FPS);
                break;
            }
        }
    }
}

function checkShipOutOfBounds() {
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r;
    }

    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    }
}

function drawLevelText() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"
    ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
    ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono"
    ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
    textAlpha -= 1.0 / TEXT_FADE_TIME / FPS;
}

function moveAsteroids() {
    for (var asteroidCount = 0; asteroidCount < asteroids.length; asteroidCount++) {
        asteroids[asteroidCount].x += asteroids[asteroidCount].xv;
        asteroids[asteroidCount].y += asteroids[asteroidCount].yv;

        //asteroids x-direction
        if (asteroids[asteroidCount].x < 0 - asteroids[asteroidCount].r) {
            asteroids[asteroidCount].x = canvas.width + asteroids[asteroidCount].r;
        } else if (asteroids[asteroidCount].x > canvas.width + asteroids[asteroidCount].r) {
            asteroids[asteroidCount].x = 0 - asteroids[asteroidCount].r;
        }

        //asteroids y-direction
        if (asteroids[asteroidCount].y < 0 - asteroids[asteroidCount].r) {
            asteroids[asteroidCount].y = canvas.height + asteroids[asteroidCount].r;
        } else if (asteroids[asteroidCount].y > canvas.height + asteroids[asteroidCount].r) {
            asteroids[asteroidCount].y = 0 - asteroids[asteroidCount].r;
        }
    }
}

function handleShipMovement() {
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
        if (!exploding && blinkOn) {
            drawThrusterFire();
        } else {
            ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
            ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
        }
    }
}

function createAsteroid(size) {
    let x, y
    do {
        x = Math.floor(Math.random() * canvas.width);
        y = Math.floor(Math.random() * canvas.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
    if (size === "small") {
        validCommand = true;
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
    } else if (size === "medium") {
        validCommand = true;
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
    } else if (size === "large") {
        validCommand = true;
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 2)));
    }
    asteroidSize = size;
    creatingAsteroids = true;
}

function toggleInvulnerability(){
    invulnerable = !invulnerable;
    output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + code + "\n\n" +
            "Output: \nInvulnerability on: " + invulnerable + "\n*/");
    validCommand = true;
}

function showCommands(){
    output.session.insert(0, "\n\n/*\n"+ timeStamp() +"Input: " + code + "\n\nOutput: \n" +
        "The following commands exist: */\n " +
        "createAsteroid('small'|'medium'|'large'); //adds a single asteroid\n " +
        "toggleInvulnerability(); //toggles invulnerability status \n " +
        "showCommands(); //displays a list of all commands \n "+
        "changeableVariables(); //shows alterable variables \n " +
        "setKeybindings(); //set the games keybindings");
    validCommand = true;
}

function changeableVariables(){
    output.session.insert(0, "\n\n/*\n"+ timeStamp() +"Input: " + code + "\n\nOutput: \n" +
        "The following commands exist: */\n " +
        "lives = "+lives+"; //current ships remaining\n " +
        "ASTEROIDS_SIZE = "+ ASTEROIDS_SIZE +"; //Size of the asteroids\n " +
        "ASTEROIDS_SPD = "+ ASTEROIDS_SPD+ "; //Speed of the asteroids\n "+
        "ASTEROIDS_VERT = "+ ASTEROIDS_VERT +"; //Amount of corners of the asteroids \n " +
        "SHIP_SIZE  = "+ SHIP_SIZE +"; //Size of the player ship \n "+
        "SHIP_THRUST = "+ SHIP_THRUST+"; //Strength of the ships thruster \n ");
    validCommand = true;
}

// TEXT EDITOR ------------------------------------------------------------------------------------------------
function goToLastLine(){
    let row = output.session.getLength() - 1
    let column = output.session.getLine(row).length
    output.gotoLine(row + 1, column)
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

function drawCircle(){
        document.getElementById("output").style.borderColor = "orange"
        document.getElementById("output").style.borderWidth = "3px";
        output.setValue("//  Huh... There seem to be a few things missing! " +
            "Let's start by adding ship controls by using command setKeybindings();");
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
    output.session.setMode("ace/mode/javascript");
    output.renderer.$cursorLayer.element.style.display = "none"
    output.setOptions({
        fontSize: "16px",
        readOnly: true
    });


    setTimeout(function (){
        let confirmAction = confirm("Do you want a tutorial?");
        if(confirmAction) {
            tutorialOn = true;
            output.setOptions({
                fontSize: "24px",
                readOnly: true
            });
            output.setValue("//  Seems like a normal game of asteroids. " +
                "Why don't you try using the Play button on the top right to start it up?");
            document.getElementById("output").style.borderColor = "orange"
            document.getElementById("output").style.borderWidth = "3px";
            document.getElementById("border-container").style.borderWidth = "3px";
        } else {
            tutorialDone = true;
            keybindTutorialDone = true;
            output.setValue("/*\n"+
                "The following commands exist: */\n " +
                "createAsteroid('small'|'medium'|'large'); //adds a single asteroid\n " +
                "toggleInvulnerability(); //toggles invulnerability status \n " +
                "showCommands(); //displays a list of all commands \n "+
                "changeableVariables(); //shows alterable variables \n " +
                "setKeybindings(); //sets the games keybindings");
        }
    }, 20);

}

function runCodeTwo() {
    code = editor.getValue();
    editor.setValue("");
    console.log(code);
    let script = document.createElement('script');
    try {
        let codeNode = document.createTextNode(code);
        script.appendChild(codeNode);
        document.body.appendChild(script);
    } catch (e) {
        script.text = code;
        document.body.appendChild(script);
    }

    if(settingKeybind){
        keyBindSave = code;
    }

    if(!validCommand){
        output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + code + "\n\n" +
            "Output: \n\n"+ code +" is not a valid command! \nTry using showCommands(); " +
            "to display all the possible commands!*/");
    }

    if(code !== "setKeybindings();"){
        settingKeybind = false;
        validCommand = false;
    }

    if(asteroidTutorialActive && !asteroidTriggered){
        output.setValue("//  Now that this is done, let's get to creating an asteroid!");
        setTimeout(function (){
            output.setValue("//  For that just use the command: \n createAsteroid('small'|'medium'|'large');\n" +
                "//  Only use one size-value inside the bracket!");
        }, 5000);
        asteroidTriggered = true;
    }

    if(!keybindTutorialDone && output.getValue() === keybindOutputTutorial){
        output.setValue("//  This game now has a keybinding. Try it out in the game above!" +
            " You can always change it again by using setKeybindings(); again! ");
        setTimeout(function (){
            let confirmAction = confirm("Do you want a tutorial on how to create asteroids?");

            if(confirmAction) {
                output.setValue("//  Now that we have added some movement, we need to add some asteroids to shoot. " +
                    "We also need to bind a laser to actually shoot them.");
                document.getElementById("output").style.borderColor = "orange"
                document.getElementById("output").style.borderWidth = "3px";

                setTimeout(function (){
                    output.setValue("//  Use setKeybindings(); once again to bind another key that will then shoot. ");
                    shootTutorialActive = true;
                }, 10000);

            } else {
                document.getElementById("output").style.borderColor = "#555555"
                document.getElementById("output").style.borderWidth = "1px";
                output.setValue("/*\n"+
                    "The following commands exist: */\n " +
                    "createAsteroid('small'|'medium'|'large'); //adds a single asteroid\n " +
                    "toggleInvulnerability(); //toggles invulnerability status \n " +
                    "showCommands(); //displays a list of all commands \n "+
                    "changeableVariables(); //shows alterable variables \n " +
                    "setKeybindings(); //sets the games keybindings");
            }
        }, 10000);

        keybindTutorialDone = true;
    }

    if(output.getValue() === laserBindingOutput){
        asteroidTutorialActive = true;
    }

    if(creatingAsteroids){
        if(shootTutorialActive) {
            if(endOfTutorial){
                alert("You have completed the tutorial! Have fun!");
                shootTutorialActive = false;
                output.setOptions({
                    fontSize: "16px",
                    readOnly: true
                });
                document.getElementById("output").style.borderColor = "#555555"
                document.getElementById("output").style.borderWidth = "1px";
                output.setValue("/*\n"+
                    "The following commands exist: */\n " +
                    "createAsteroid('small'|'medium'|'large'); //adds a single asteroid\n " +
                    "toggleInvulnerability(); //toggles invulnerability status \n " +
                    "showCommands(); //displays a list of all commands \n "+
                    "changeableVariables(); //shows alterable variables \n " +
                    "setKeybindings(); //sets the games keybindings");
                tutorialDone = true;
            } else {
                output.setValue("/*\n" + timeStamp() + "Input: " + code + "\n\n" +
                    "Output: \nCreated an asteroid with the size: " + asteroidSize + "\n\n" +
                    "This will only create a single asteroid though!\n*/");
                setTimeout(function (){
                    output.setValue("//  To add more than one asteroid at once you can use a for-loop!" +
                        " These run for as long as the condition is fulfilled.\n" +
                        "//  Example:\n" +
                        "for(let count = 0; count < 10; count++){\n" +
                        "    createAsteroid('small');\n" +
                        "}\n" +
                        "//  This will run createAsteroid('small') 10 times! " +
                        "The count variable is incremented for each loop until it's 10!");
                    endOfTutorial = true;
                }, 10000);
            }
        } else {
            output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + code + "\n\n" +
                "Output: \nCreated an asteroid with the size: " + asteroidSize + "\n*/");
        }
    } else if(creatingAsteroids && !validCommand){
        output.session.insert(0, "\n\n/*\n" + timeStamp() + "Input: " + code + "\n\n" +
            "Output: \nSize: " + asteroidSize + " is not a supported Size! Try small, medium or large!*/");
    }

    creatingAsteroids = false;
    goToLastLine();
}

