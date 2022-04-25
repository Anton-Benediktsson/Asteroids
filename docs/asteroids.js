let canvas;
let ctx;
let canvasWidth = 1400;
let canvasHeight = 1000;
let keys = [];
let ship;
let bullets = [];
let asteroids = [];
let score = 0;
let lives = 3;

const fullScreenButton = document.getElementById('fullScreenButton');

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas(){
    canvas = document.getElementById("my-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();
    joystick1 = new JoystickController("stick1", 64, 8);

    for(let i = 0; i < 8; i++){
        asteroids.push(new Asteroid());
    }
    document.body.addEventListener("keydown", HandleKeyDown);
    document.body.addEventListener("keyup", HandleKeyUp);

    Render();
}
// Move event handling functions so that we can turn off
// event handling if game over is reached
function HandleKeyDown(e){
    keys[e.keyCode] = true;
}
function HandleKeyUp(e){
    keys[e.keyCode] = false;
    if (e.keyCode === 32 && ship.visible){
        bullets.push(new Bullet(ship.angle));
    }
}

function toggleFullScreen(){
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            alert("Error fullscreen");
        });
    } else {
        document.exitFullscreen();
    }
}
fullScreenButton.addEventListener('click',toggleFullScreen);

class Ship {
    constructor() {
        this.visible = true;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.movingForward = false;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.rotateSpeed = 0.001;
        this.radius = 15;
        this.radians = 0;
        this.angle = 0;
        this.strokeColor = 'white';
        // Used to know where to fire the bullet from
        this.noseX = canvasWidth / 2 + 15;
        this.noseY = canvasHeight / 2;
    }
    Rotate(dir) {
        this.angle += this.rotateSpeed * dir;
    }
    Update() {
        // Get current direction ship is facing
        this.radians = this.angle / Math.PI * 180;

        // If moving forward calculate changing values of x & y
        // If you want to find the new point x use the 
        // formula oldX + cos(radians) * distance
        // Forumla for y oldY + sin(radians) * distance
        if (this.movingForward) {
            this.velX += Math.cos(radians) * this.speed;
            this.velY += Math.sin(radians) * this.speed;
        }
        // If ship goes off board place it on the opposite
        // side    
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
        // Slow ship speed when not holding key
        this.velX *= 0.99;
        this.velY *= 0.99;

        // Change value of x & y while accounting for
        // air friction    
        this.x -= this.velX;
        this.y -= this.velY;
    }
    Draw() {
        ctx.strokeStyle = this.strokeColor;
        ctx.beginPath();
        // Angle between vertices of the ship
        let vertAngle = ((Math.PI * 2) / 3);

        let radians = this.angle / Math.PI * 180;
        // Where to fire bullet from
        this.noseX = this.x - this.radius * Math.cos(radians);
        this.noseY = this.y - this.radius * Math.sin(radians);

        for (let i = 0; i < 3; i++) {
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
}

class Bullet{
    constructor(angle) {
        this.visible = true;
        this.x = ship.noseX;
        this.y = ship.noseY;
        this.angle = angle;
        this.height = 4;
        this.width = 4;
        this.speed = 5;
        this.velX = 0;
        this.velY = 0;
    }
    Update(){
        let radians = this.angle / Math.PI * 180;
        this.x -= Math.cos(radians) * this.speed;
        this.y -= Math.sin(radians) * this.speed;
    }
    Draw(){
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}

class Asteroid{
    constructor(x,y,radius,level,collisionRadius) {
        this.visible = true;
        this.x = x || Math.floor(Math.random() * canvasWidth);
        this.y = y || Math.floor(Math.random() * canvasHeight);
        this.speed = 3;
        this.radius = radius || 50;
        this.angle = Math.floor(Math.random() * 359);
        this.strokeColor = 'white';
        this.collisionRadius = collisionRadius || 46;
        // Used to decide if this asteroid can be broken into smaller pieces
        this.level = level || 1;  
    }
    Update(){
        let radians = this.angle / Math.PI * 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
    }
    Draw(){
        ctx.beginPath();
        let vertAngle = ((Math.PI * 2) / 6);
        var radians = this.angle / Math.PI * 180;
        for(let i = 0; i < 6; i++){
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function restartGame(){
    ship.x = canvasWidth / 2;
    ship.y = canvasHeight / 2;
    ship.velX = 0;
    ship.velY = 0;
    score = 0;
    lives = 3;
    ship.visible = true;
    asteroids = [];
    for(let i = 0; i < 8; i++){
        let asteroid = new Asteroid();
        asteroids.push(asteroid);
    }
}

class JoystickController
{
	// stickID: ID of HTML element (representing joystick) that will be dragged
	// maxDistance: maximum amount joystick can move in any direction
	// deadzone: joystick must move at least this amount from origin to register value change
	constructor( stickID, maxDistance, deadzone )
	{
		this.id = stickID;
		// location from which drag begins, used to calculate offsets
		this.dragStart = null;

		// track touch identifier in case multiple joysticks present
		this.touchId = null;
		
		this.active = false;
		this.value = { x: 0, y: 0 }; 

		let self = this;

		function handleDown(event)
		{
		    self.active = true;

			// touch event fired before mouse event; prevent redundant mouse event from firing
			event.preventDefault();

		    if (event.changedTouches)
		    	self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
		    else
		    	self.dragStart = { x: event.clientX, y: event.clientY };

			// if this is a touch event, keep track of which one
		    if (event.changedTouches)
		    	self.touchId = event.changedTouches[0].identifier;
		}
		
		function handleMove(event) 
		{
		    if ( !self.active ) return;

		    // if this is a touch event, make sure it is the right one
		    // also handle multiple simultaneous touchmove events
		    let touchmoveId = null;
		    if (event.changedTouches)
		    {
		    	for (let i = 0; i < event.changedTouches.length; i++)
		    	{
		    		if (self.touchId == event.changedTouches[i].identifier)
		    		{
		    			touchmoveId = i;
		    			event.clientX = event.changedTouches[i].clientX;
		    			event.clientY = event.changedTouches[i].clientY;
		    		}
		    	}

		    	if (touchmoveId == null) return;
		    }

		    const xDiff = event.clientX - self.dragStart.x;
		    const yDiff = event.clientY - self.dragStart.y;
		    const angle = Math.atan2(yDiff, xDiff);
			const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
			const xPosition = distance * Math.cos(angle);
			const yPosition = distance * Math.sin(angle);

			// deadzone adjustment
			const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
		    const xPosition2 = distance2 * Math.cos(angle);
			const yPosition2 = distance2 * Math.sin(angle);
		    const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
		    const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));
		    
		    self.value = { x: xPercent, y: yPercent};
            ship.Rotate(self.value.x);
            ship.velX += Math.cos(ship.radians) * ship.speed;
            ship.velY += Math.sin(ship.radians) * ship.speed;
		  }

		function handleUp(event) 
		{
		    if ( !self.active ) return;

		    // if this is a touch event, make sure it is the right one
		    if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

		    // reset everything
		    self.value = { x: 0, y: 0 };
		    self.touchId = null;
		    self.active = false;
		}

		document.addEventListener('mousedown', handleDown, {passive: false});
		document.addEventListener('touchstart', handleDown, {passive: false});
		document.addEventListener('mousemove', handleMove, {passive: false});
		document.addEventListener('touchmove', handleMove, {passive: false});
		document.addEventListener('mouseup', handleUp);
		document.addEventListener('touchend', handleUp);
	}
}

function CircleCollision(p1x, p1y, r1, p2x, p2y, r2){
    let radiusSum;
    let xDiff;
    let yDiff;

    radiusSum = r1 + r2;
    xDiff = p1x - p2x;
    yDiff = p1y - p2y;

    if (radiusSum > Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))) {
        return true;
    } else {
        return false;
    }
}

// Handles drawing life ships on screen
function DrawLifeShips(){
    let startX = 1350;
    let startY = 10;
    let points = [[9, 9], [-9, 9]];
    ctx.strokeStyle = 'white'; // Stroke color of ships
    // Cycle through all live ships remaining
    for(let i = 0; i < lives; i++){
        // Start drawing ship
        ctx.beginPath();
        // Move to origin point
        ctx.moveTo(startX, startY);
        // Cycle through all other points
        for(let j = 0; j < points.length; j++){
            ctx.lineTo(startX + points[j][0], 
                startY + points[j][1]);
        }
        // Draw from last point to 1st origin point
        ctx.closePath();
        // Stroke the ship shape white
        ctx.stroke();
        // Move next shape 30 pixels to the left
        startX -= 30;
    }
}

function Render() {
    if (ship.visible) {
        // Check if the ship is moving forward
        ship.movingForward = (keys[87]);
        if (keys[68]) {
            // d key rotate right
            ship.Rotate(1);
        }
        if (keys[65]) {
            // a key rotate left
            ship.Rotate(-1);
        }
    }
        
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Display score
    ctx.fillStyle = 'white';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE : " + score.toString(), 20, 35);

    // If no lives signal game over
    if(lives <= 0){
        // HOMEWORK SOLUTION
        // If Game over remove event listeners to stop getting keyboard input
        ship.visible = false;
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2);
        if (keys[13] && !ship.visible) restartGame();
    }

    // HOME WORK SOLUTION : Creates a new level and increases asteroid speed
    if(asteroids.length === 0){
        ship.x = canvasWidth / 2;
        ship.y = canvasHeight / 2;
        ship.velX = 0;
        ship.velY = 0;
        for(let i = 0; i < 8; i++){
            let asteroid = new Asteroid();
            asteroid.speed += .5;
            asteroids.push(asteroid);
        }
    }

    // Draw life ships
    DrawLifeShips();

    // Check for collision of ship with asteroid
    if (asteroids.length !== 0) {
        for(let k = 0; k < asteroids.length; k++){
            if(CircleCollision(ship.x, ship.y, 11, asteroids[k].x, asteroids[k].y, asteroids[k].collisionRadius)){
                ship.x = canvasWidth / 2;
                ship.y = canvasHeight / 2;
                ship.velX = 0;
                ship.velY = 0;
                lives -= 1;
            }
        }
    }

    // Check for collision with bullet and asteroid
    if (asteroids.length !== 0 && bullets.length != 0){
loop1:
        for(let l = 0; l < asteroids.length; l++){
            for(let m = 0; m < bullets.length; m++){
                if(CircleCollision(bullets[m].x, bullets[m].y, 3, asteroids[l].x, asteroids[l].y, asteroids[l].collisionRadius)){
                    // Check if asteroid can be broken into smaller pieces
                    if(asteroids[l].level === 1){
                        asteroids.push(new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 25, 2, 22));
                        asteroids.push(new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 25, 2, 22));
                    } else if(asteroids[l].level === 2){
                        asteroids.push(new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 15, 3, 12));
                        asteroids.push(new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 15, 3, 12));
                    }
                    asteroids.splice(l,1);
                    bullets.splice(m,1);
                    score += 20;

                    // Used to break out of loops because splicing arrays
                    // you are looping through will break otherwise
                    break loop1;
                }
            }
        }
    }

    if(ship.visible){
        ship.Update();
        ship.Draw();
    }
    
    if (bullets.length !== 0) {
        for(let i = 0; i < bullets.length; i++){
            bullets[i].Update();
            bullets[i].Draw();
        }
    }
    if (asteroids.length !== 0) {
        for(let j = 0; j < asteroids.length; j++){
            asteroids[j].Update();
            // Pass j so we can track which asteroid points
            // to store
            asteroids[j].Draw(j);
        }
    }
    requestAnimationFrame(Render);
}