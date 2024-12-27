document.getElementById('canvas').height = window.innerHeight - 175;
document.getElementById('canvas').width = window.innerWidth;
const kill_count_elem = document.getElementById("kill_counter");
const bullet_count_elem = document.getElementById("bullet_counter");
const canvas = document.getElementById("canvas");
const brush = canvas.getContext("2d");

let bg_audio;       //will hold the background audio
let bg_audio2;      //will hold the background audio
let bullet;         // will hold the bullet
let speed_level;    // will hold the speed level
let intObject;      // start and end time of game
let flying_birds;   //array of bird objects
let kill_count;     //counts the number of kills
let bg_image;       //holds the background image
let myMouse_click;  //tracks the mouse click
let myMouse_move;   //tracks the mouse movement

function Setup() {
    /**
    * this function is calls the setupGameWorld and setupGameMechanics functions
    * @param
    * none
    * @returns
    * none
    */
    setupGameWorld();
    setupGameMechanics();
}

function setupGameWorld() {
    /**
    * this function sets up the game world
    * will create 2 event listener for mouse click and mouse movement
    * will set up the audio background
    * @param
    * none
    * @returns
    * none
    */
    canvas.addEventListener("mousemove", crosshairListener);
    canvas.addEventListener("click", gunFireListener);
    bg_image = new Image();
    bg_image.src = "./Data/Images/background.jpg";
    bg_audio = new Audio("./Data/Audio/crow.wav");
    bg_audio2 = new Audio("./Data/Audio/music.mp3");
    bg_audio.play();
    bg_audio2.volume = 0.4;
    bg_audio2.play();
}

function setupGameMechanics() {
    /**
     * this function will set up the game mechanics and initial values
     * @param
     * none
     * @returns
     * none
     */
    speed_level = 2;
    bullet = 10;
    kill_count = 0;
    flying_birds = [];
    myMouse_click = {
        x: -1,
        y: -1,
        clicked: false
    };
    myMouse_move = {
        x: -1,
        y: -1,
    };
}

function crosshairListener(event) {
    /*
    * this function will call the event listener for mouse movement
    * @param
    * event
    * @returns
    * none
    */
    let rect = canvas.getBoundingClientRect();
    let x = event.x - rect.left;
    let y = event.y - rect.top;
    myMouse_move.x = parseInt(x);
    myMouse_move.y = parseInt(y);
}

function gunFireListener(event) {
    /*
    * this function will call the event listener for mouse click
    * if the mouse is clicked it plays the gun shot audio
    * then it checks whether the click point collides with the birds by calling check_hit function
    * @param
    * event
    * @returns
    * none
    */
    let rect = canvas.getBoundingClientRect();
    let x = event.x - rect.left;
    let y = event.y - rect.top;
    let gun_audio = new Audio("./Data/Audio/gunshot.wav");
    myMouse_click.x = parseInt(x);
    myMouse_click.y = parseInt(y);
    gun_audio.pause();
    gun_audio.currentTime = 0;
    gun_audio.volume = 0.3;
    gun_audio.play();
    Check_hit(myMouse_click.x, myMouse_click.y);
    myMouse_click.clicked = true;
}

function GetRandomInteger(a, b) {
    /*
    * returns a random integer x such that a <= x <= b
    *
    * @params
    * a: integer
    * b: integer
    * @returns
    * a random integer x such that a <= x <= b
    * switch the large and small if out of order
    */
    if (a > b) {
        small = b;
        large = a;
    }
    else {
        small = a;
        large = b;
    }

    let x = parseInt(Math.random() * (large - small + 1)) + small;
    return x;
}

function Draw_CrossHair(centerX, centerY, radius, color) {
    /*
     * this function draws the crosshair
     * it takes the center of a circle and draws a circle and 2 lines inside it
     * @param
     * centerX : integer
     * centerY : integer
     * radius : number
     * color : string
     * @returns
     * none
     */
    brush.beginPath();
    brush.lineWidth = 3;
    brush.arc(centerX, centerY, radius, ToRadians(0), ToRadians(360));
    brush.strokeStyle = color;
    brush.lineTo(centerX - radius - 15, centerY);
    brush.lineTo(centerX + radius + 15, centerY);
    brush.stroke();
    brush.closePath();
    brush.beginPath();
    brush.lineTo(centerX, centerY - 15 - radius);
    brush.lineTo(centerX, centerY + 15 + radius);
    brush.stroke();
    brush.closePath();
}

function ToRadians(angleInDegrees) {
    /**
     * this function calculates the angle in degrees
     * @param
     * angleInDegrees : integer
     * @returns
     * number
     */
    return Math.PI / 180 * angleInDegrees;
}

class Bird {
    constructor(y, dx, dy) {
        this.direction = GetRandomInteger(0, 1); // random direction for bird
        this.sprite_width = 691;
        this.sprite_height = 748;
        this.frameX = 0;
        this.scale = 5;
        if (this.direction == 0) {
            this.Xspeed = dx;
        } else {
            this.Xspeed = -dx;
        }
        this.Yspeed = dy;
        this.bird_image = new Image();
        if (this.direction == 0) { //0 if the bird starts from left and goes to right
            this.bird_image.src = "./Data/Images/Brid-L2R.png";
            this.bird_location_X = -this.sprite_width / this.scale;
            this.bird_location_Y = y;
        } else {
            this.bird_image.src = "./Data/Images/Brid-R2L.png"; //if the bird starts from right and goes to left
            this.bird_location_X = canvas.width;
            this.bird_location_Y = y;
        }
        this.sprite_center_X;
        this.sprite_center_Y;
    }
    Draw() {
          // this method draws the sprite
        brush.drawImage(this.bird_image,
            this.frameX * this.sprite_width,
            0,
            this.sprite_width,
            this.sprite_height,
            this.bird_location_X,
            this.bird_location_Y,
            this.sprite_width / this.scale,
            this.sprite_height / this.scale);
        this.frameX++;
        if (this.frameX > 11) {
            this.frameX = 0;
        }
    }
    MoveHorizontal() {
        // this method moves the sprite horizontally without any restrictions
        this.bird_location_X += this.Xspeed;
        this.sprite_center_X = this.bird_location_X + this.sprite_width / (this.scale*2);
    }
    MoveVertical() {
       // this method moves the sprite horizontally
       //if it hits the top of the canvas it goes down
       // if it hits the half height of canvas it goes up
        if (this.bird_location_Y + this.Yspeed > canvas.height / 2) {
            this.Yspeed = -this.Yspeed;
        }
        if (this.bird_location_Y + this.Yspeed < 0) {
            this.Yspeed = -this.Yspeed;
        }
        this.bird_location_Y += this.Yspeed;
        this.sprite_center_Y = this.bird_location_Y + this.sprite_height / (this.scale*2);
    }
}

function let_them_fly() {
    /**
     * this function will draw and move the birdds on canvas
     * @param
     * none
     * @returns
     * none
     */
    for (let i = 0; i < flying_birds.length; i++) {
        flying_birds[i].MoveHorizontal();
        flying_birds[i].MoveVertical();
        flying_birds[i].Draw();
    }
}

function Distance(x1, y1, x2, y2) {
    /**
     * returns straight-line distance between points at (x1,y1)
     * and (x2,y2).
     * @param
     * x1: number
     * y1: number
     * x2: number
     * y2: number
     * @returns
     * number
     */
    let dis = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return dis;
}

function Create_Birds() {
       /**
     * this function will create birds objects and push them into the flying_birds array
     * dx and dy will change based on the speed level to speed up the birds as game moves forward
     * @param
     * none
     * @returns
     * none
     */

    if ((kill_count + 1) %20 == 0) { //every 20 kill will increas the bird's speed by one
        speed_level++;
    }
    flying_birds.push(new Bird(GetRandomInteger(0, canvas.height / 3), speed_level * GetRandomInteger(2,6), speed_level *GetRandomInteger(2,6)));
}

function Hit_Radius(bird, mouse_x, mouse_y) {
       /**
     * this function will check wheter the click point is in the hit radius or not
     *
     * if it is less than 80 it returns true
     * if not it returns false
     * @param
     * bird : bird object
     * mouse_x : integer
     * mouse_y : integer
     * @returns
     * boolean
     */
    if (Distance(bird.sprite_center_X, bird.sprite_center_Y, mouse_x, mouse_y) <= 80) {
        return true;
    } else {
        return false;
    }
}

function Check_hit(mouse_x, mouse_y) {
       /**
     * this function will check wheter or not a bird is killed
     * it calls the Hit_Radius function
     * if a bird is hit, the bullets will not decrease and the count kill will increase
     * if a bird is not hit then a bullet will decrease
     * then it updates the html page with new values
     * @param
     * mouse_x : integer
     * mouse_y : integer
     * @returns
     * none
     */
    let kill_count_elem = document.getElementById("kill_counter");
    let bullet_count_elem = document.getElementById("bullet_counter");
    for (let i = flying_birds.length - 1; i >= 0; i--) {
        if (flying_birds[i]) {
            if (Hit_Radius(flying_birds[i], mouse_x, mouse_y)) {
                flying_birds.splice(i, 1);
                kill_count_elem.innerHTML = ++kill_count;
                return;
            }
        }
    }
    bullet--;
    let result = "";
    for(let i = 0; i < bullet; i++){
        result += " 🟢 ";
    }
    bullet_count_elem.innerHTML = result;
}

function ClearCanvas() {
       /**
     * this function will clear the canvas
     * @param
     * none
     * @returns
     * none
     */
    brush.clearRect(0, 0, canvas.width, canvas.height);
}

function check_game_end() {
       /**
     * this function will check wheter the game is finished or not
     * if the bullet become 0 it ends the game
     * if the birds move out of canvas, it ends the game
     * @param
     * none
     * @returns
     * none
     */
    if(bullet == 0){
        EndGame();
    }else{
        for (let i = 0; i < flying_birds.length; i++) {
            if (flying_birds[i]) {
                if (flying_birds[i].bird_location_X < (-flying_birds[i].sprite_width / flying_birds[i].scale) - 1 || flying_birds[i].bird_location_X >( canvas.width + 1)) {
                    EndGame();
                    return;
                }
            }
        }
    }
}

function drawgame() {
       /**
     * this function will draw the game screen
     * it first clears the canvas
     * the it will draw the background image
     * it always keeps at least 5 birds on the screen

     * @param
     * none
     * @returns
     * none
     */
    ClearCanvas();
    brush.drawImage(bg_image, 0, 0, canvas.width, canvas.height);
    if (flying_birds.length < 5) {
        Create_Birds();
    }
    let_them_fly();
    Draw_CrossHair(myMouse_move.x, myMouse_move.y, 15, "#ff0000");
    check_game_end();
}

function game_start() {
       /**
     * this function starts the game after clicking the button on html page
     * it removes the button from html page
     * then it calls setup function
     * and then it starts the animation
     * 
     * @param
     * none
     * @returns
     * none
     */
    Setup();
    let child = document.getElementById("start");
    let parent = document.getElementById("start_button");
    parent.removeChild(child);
    intObject = setInterval(drawgame, 70);
}


function EndGame() {
       /**
     * this function will end the game
     * it playes the end game audio
     * and show a message on the screen based on the reason that the game was finished
     * @param
     * none
     * @returns
     * none
     */
    clearInterval(intObject);
    canvas.removeEventListener("click", gunFireListener);
    let finish_sound = new Audio("./Data/Audio/Finish.wav");
    bg_audio.pause();
    bg_audio2.pause();
    setTimeout(function () {
        finish_sound.play();
    }, 1000);
    
    if (bullet == 0){
        brush.font = "30px Arial";
        brush.fillText("opps! you ran out of bullets", canvas.width / 2 - 150, canvas.height / 3 - 100);
        brush.font = "70px Arial"
        brush.fillText("GAME OVER", canvas.width / 2 - 200, canvas.height / 3);
    } else{
        brush.font = "30px Arial";
        brush.fillText("opps! you missed a bird!", canvas.width / 2 - 150, canvas.height / 3 - 100);
        brush.font = "70px Arial"
        brush.fillText("GAME OVER", canvas.width / 2 - 200, canvas.height / 3);
    }    
}
