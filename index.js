// --- IMAGE DEFINITIONS ---
// (No changes here, these are all correct)
const playerImage = new Image();
playerImage.src = '/images/Idle.png';
const playerImage2 = new Image();
playerImage2.src = '/images/Run.png';
const playerImage3 = new Image();
playerImage3.src = '/images/Runleft.png';
const playerImage4 = new Image();
playerImage4.src = '/images/Jump.png';
const playerImage5 = new Image();
playerImage5.src = '/images/JumpLeft.png';
const playerImage6 = new Image();
playerImage6.src = '/images/Idleleft.png';
const platformImage = new Image();
platformImage.src = '/images/Pad_1_3.png';
const backgroundImage = new Image();
backgroundImage.src = '/images/City1.png';

// --- CANVAS SETUP ---
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;

// --- ASSET LOADING AND GAME START ---

// FIX: We need to load ALL 8 images, not just 3.
// Let's store them in an object for easy access.
const imagesToLoad = {
    idle: playerImage,
    run: playerImage2,
    runLeft: playerImage3,
    jump: playerImage4,
    jumpLeft: playerImage5,
    idleLeft: playerImage6,
    platform: platformImage,
    background: backgroundImage
};

// FIX: Create an assets object to hold the *loaded* images.
/** @type {{ 
 * player: { [key: string]: HTMLImageElement | null }, 
 * platform: HTMLImageElement | null, 
 * background: HTMLImageElement | null 
 * }} 
 */
const assets = {
    player: {
        idle: null,
        run: null,
        runLeft: null,
        jump: null,
        jumpLeft: null,
        idleLeft: null
    },
    platform: null,
    background: null
};

let assetsLoadedCount = 0;
// FIX: The total is 8 (6 player + 1 platform + 1 background)
const totalAssets = Object.keys(imagesToLoad).length;

function startGame() {
    assetsLoadedCount++;
    if (assetsLoadedCount === totalAssets) {
        // Only start the game loop when ALL assets are loaded!
        init(); // Initialize objects
        animate();
    }
}

// FIX: Set up onload handlers for ALL images.
imagesToLoad.idle.onload = () => {
    assets.player.idle = imagesToLoad.idle;
    startGame();
};
imagesToLoad.run.onload = () => {
    assets.player.run = imagesToLoad.run;
    startGame();
};
imagesToLoad.runLeft.onload = () => {
    assets.player.runLeft = imagesToLoad.runLeft;
    startGame();
};
imagesToLoad.jump.onload = () => {
    assets.player.jump = imagesToLoad.jump;
    startGame();
};
imagesToLoad.jumpLeft.onload = () => {
    assets.player.jumpLeft = imagesToLoad.jumpLeft;
    startGame();
};
imagesToLoad.idleLeft.onload = () => {
    assets.player.idleLeft = imagesToLoad.idleLeft;
    startGame();
};
imagesToLoad.platform.onload = () => {
    assets.platform = imagesToLoad.platform;
    startGame();
};
imagesToLoad.background.onload = () => {
    assets.background = imagesToLoad.background;
    startGame();
};


// --- GAME CLASSES ---

class Player {
    // FIX: Accept all the loaded sprites in the constructor
    constructor({
        idleImage,
        runImage,
        runLeftImage,
        jumpImage,
        jumpLeftImage,
        idleLeftImage
    }) {
        // FIX: Start the player at a reasonable position (e.g., 100, 100).
        // Your original y:300 + height:400 = 700, which is below the canvas (576).
        // This meant the gravity check failed, and the player never fell.
        this.position = {
            x: 100,
            y: 100
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        // FIX: Set width to match the sprite's source width (177) for correct proportions.
        this.width = 177;
        this.height = 400;
        this.speed = 7; // Add a speed property for horizontal movement
        this.jumpStrength = -25; // Add a property for jump height

        // FIX: Store all sprites and track the current one
        this.sprites = {
            idle: {
                right: idleImage,
                left: idleLeftImage
            },
            run: {
                right: runImage,
                left: runLeftImage
            },
            jump: {
                right: jumpImage,
                left: jumpLeftImage
            }
        };
        this.currentSprite = this.sprites.idle.right;
        this.currentDirection = 'right';
    }

    draw() {
        if (this.currentSprite) {
            c.drawImage(this.currentSprite,
                0, 0, 177, 400, // Source rectangle
                this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply gravity, but stop at the bottom of the canvas
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
            // This is a good place to reset position if they fall off
            // this.position.y = canvas.height - this.height; 
        }

        // --- FIX: Sprite Switching Logic ---
        
        // 1. Determine direction (only update if a key is pressed)
        if (keys.right.pressed) {
            this.currentDirection = 'right';
        } else if (keys.left.pressed) {
            this.currentDirection = 'left';
        }

        // 2. Determine action (Jumping > Running > Idle)
        if (this.velocity.y < 0) { // Going up (jumping)
            this.currentSprite = this.sprites.jump[this.currentDirection];
        } else if (this.velocity.y > 0) { // Falling
            // We use the jump sprite for falling, as we don't have a specific "fall" sprite
            this.currentSprite = this.sprites.jump[this.currentDirection];
        } else if (keys.right.pressed || keys.left.pressed) { // On ground and moving
            this.currentSprite = this.sprites.run[this.currentDirection];
        } else { // On ground and idle
            this.currentSprite = this.sprites.idle[this.currentDirection];
        }
    }
}

class Platform {
    // (No changes needed here, this class is solid)
    constructor({
        x,
        y,
        image
    } = {
        x: 0,
        y: 0,
        image: null
    }) {
        this.position = {
            x: x,
            y: y
        };
        this.image = image;
        this.width = image ? image.width : 200;
        this.height = image ? image.height : 20;
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            c.fillStyle = 'blue';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

class GenericObject {
    // (No changes needed here, this class is solid)
    constructor({
        x,
        y,
        image,
        width,
        height
    }) { // Added width/height for backgrounds
        this.position = {
            x: x,
            y: y
        };
        this.image = image;
        this.width = width || image.width;
        this.height = height || image.height;
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }
}

// --- GLOBAL VARIABLES (Initialized later) ---
let player;
let platforms;
// FIX: Rename to 'genericObjects' since it's an array
let genericObjects;

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
};
let scrollOffset = 0;

// --- INITIALIZATION FUNCTION ---
function init() {
    // FIX: Pass all the loaded player sprites to the new Player
    player = new Player({
        idleImage: assets.player.idle,
        runImage: assets.player.run,
        runLeftImage: assets.player.runLeft,
        jumpImage: assets.player.jump,
        jumpLeftImage: assets.player.jumpLeft,
        idleLeftImage: assets.player.idleLeft
    });

    // FIX: Use the 'genericObjects' variable name
    genericObjects = [
        new GenericObject({
            x: 0,
            y: 0,
            image: assets.background,
            width: canvas.width, // Stretch to canvas width
            height: canvas.height // Stretch to canvas height
        }),
        new GenericObject({
            x: 0 + canvas.width,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
        new GenericObject({
            x: 0 + canvas.width * 2,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
        // ... (rest of your background objects are fine)
        new GenericObject({
            x: 0 + canvas.width * 3,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
         new GenericObject({
            x: 0 + canvas.width * 4,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
         new GenericObject({
            x: 0 + canvas.width * 5,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
         new GenericObject({
            x: 0 + canvas.width * 6,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
         new GenericObject({
            x: 0 + canvas.width * 7,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
        new GenericObject({
            x: 0 + canvas.width * 8,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
        new GenericObject({
            x: 0 + canvas.width * 9,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
        new GenericObject({
            x: 0 + canvas.width * 10,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
        new GenericObject({
            x: 0 + canvas.width * 11,
            y: 0,
            image: assets.background,
            width: canvas.width,
            height: canvas.height
        }),
    ];

    // Instantiate Platforms using the loaded asset
    platforms = [
        new Platform({
            x: -1,
            y: 470,
            image: assets.platform
        }),
        new Platform({
            x: 500,
            y: 470,
            image: assets.platform
        }),
        new Platform({
            x: 300,
            y: 600,
            image: assets.platform
        }), // This one is off-screen, might be intentional
        new Platform({
            x: 700,
            y: 300,
            image: assets.platform
        }),
        new Platform({
            x: 1000,
            y: 400,
            image: assets.platform
        }),
        // ... (rest of your platforms are fine)
        new Platform({
            x: 1300,
            y: 500,
            image: assets.platform
        }),
        new Platform({
            x: 1600,
            y: 350,
            image: assets.platform
        }),
        new Platform({
            x: 1900,
            y: 450,
            image: assets.platform
        }),
        new Platform({
            x: 2200,
            y: 550,
            image: assets.platform
        }),
        new Platform({
            x: 2500,
            y: 400,
            image: assets.platform
        })
    ];
}


// --- GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // FIX: CRITICAL! Clear the canvas on every frame.
    // Without this, you get the "smearing" effect where old drawings stay.
    c.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Background/Generic Objects FIRST
    // FIX: Use the 'genericObjects' variable
    genericObjects.forEach(object => {
        object.draw();
    });

    // 2. Draw Platforms (Foreground elements)
    platforms.forEach(platform => {
        platform.draw();
    });

    // 3. Update Player (this will also draw the player)
    player.update();


    // --- FIX: REBUILT Movement/Scrolling Logic ---
    // The old logic was flawed because you can't be in the 'if' (move player)
    // and the 'else' (scroll) at the same time. This new logic
    // separates player movement from world scrolling.

    // 1. Handle Horizontal Movement (apply velocity)
    if (keys.right.pressed && player.position.x < 400) {
        // Move player right, but stop at the 400px mark
        player.velocity.x = player.speed;
    } else if (
        (keys.left.pressed && player.position.x > 100) ||
        (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
    ) {
        // Move player left, but stop at the 100px mark (or 0 if at start)
        player.velocity.x = -player.speed;
    } else {
        // Player is at the screen edge, so stop them
        player.velocity.x = 0;

        // 2. Handle Scrolling (move the world)
        if (keys.right.pressed) {
            scrollOffset += player.speed;
            // Move platforms
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            });
            // Move background (slower for parallax effect)
            genericObjects.forEach(object => {
                object.position.x -= player.speed * 0.66;
            });
        } else if (keys.left.pressed && scrollOffset > 0) {
            scrollOffset -= player.speed;
            // Move platforms
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            });
            // Move background
            genericObjects.forEach(object => {
                object.position.x += player.speed * 0.66;
            });
        }
    }

    // --- Collision Detection ---
    // (This logic was correct)
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
        }
    });

    // --- Win/Lose Conditions (Example) ---
    // You'll want to add these later.
    
    // Example Lose Condition (falling off map)
    if (player.position.y > canvas.height) {
        console.log('You lose');
        // Here you would restart the game, e.g., call init()
        // init(); 
    }
    
    // Example Win Condition (reaching the end)
    // Adjust this value to the end of your level
    if (scrollOffset > 5000) { 
        console.log('You win!');
        // Stop the game or go to the next level
    }
}

// --- EVENT LISTENERS ---
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            // FIX: Only allow jumping if the player is on a surface (velocity.y is 0)
            // This prevents infinite "flappy bird" jumping.
            if (player.velocity.y === 0) {
                player.velocity.y = player.jumpStrength;
            }
            break;
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            keys.left.pressed = false;
            // FIX: We stop the player's movement inside the 'animate'
            // loop now, not on keyup. This makes stopping feel less abrupt.
            break;
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
    }
});