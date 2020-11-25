// Score value during the game

var scorecontainer = document.getElementById("score")

// Menu theme music

var menuTheme = new Audio();
menuTheme.src ="/music/menuTheme.mp3";

menuTheme.play();

var gameOverTheme = new Audio();
gameOverTheme.src ="/music/gameOverTheme.mp3";

// Game theme music

var gameTheme = new Audio();
gameTheme.src = "/music/gameTheme.mp3";


var oof = new Audio();
oof.src = "/music/hit.mp3";

var backgroundPosition = 0;

var phantom = document.getElementsByClassName("phantom");
var banshee = document.getElementsByClassName("banshee");
var elite = document.getElementsByClassName("elite");
var ennemies = document.getElementsByClassName("ennemies");
var game = document.getElementById("game");
var menu = document.getElementById("start-screen");
var MenuText = document.getElementById("history");
var score = 0;

var hornetPosition = 320;

// Menu buttons

function startGame() {
    score = 0;
    hornetPosition = 320;
    document.getElementById("hornet").style.top = hornetPosition + "px ";
    backgroundPosition = 0;

    scorecontainer.innerHTML = score;
    menuTheme.pause();
    
    menu.style.display = "none";
    game.style.display = "block";
    gameTheme.play();

    randomPhantomPlacement();
    randomBansheePlacement();
    randomElitePlacement();
}

function gameover() {
    gameTheme.pause();
    //gameOverTheme.play();
    oof.play();

    game.style.display = "none";
    menu.style.display = "block";

    MenuText.innerHTML = "<h1>MISSION FAILED :</h1>Oh no, the pilot was a retard and failed the mission by hitting an ennemy.<br>His high score was : " + score + ", still, no one will miss him."
}

// Temporairememt Skip du menu
//startGame();

// Will offer the possibility to go up!


function movingHornetUp() {
    if (hornetPosition >= 40) {
        hornetPosition -=20;
        document.getElementById("hornet").style.top = hornetPosition + "px ";
        //console.log("movingHornetUp");
    }
}


// Will offer the possibility to go down!

function movingHornetDown() {
    if (hornetPosition <= 600) {
        hornetPosition +=20;
        document.getElementById("hornet").style.top = hornetPosition + "px ";
        //console.log("movingHornetDown");
    }
}

// Will offer the possibility to move the Hornet!

document.body.onkeydown = function(e){
    if(e.keyCode === 40) {
        movingHornetDown();
    } else if (e.keyCode === 38) {
        movingHornetUp();
    }
};

// Will move the background at a decent rate

/*function scrollingBackground() {
    backgroundPosition -= 3;
    document.getElementById("game").style.backgroundPosition = backgroundPosition + "px 0px";
    setTimeout(function() {;
        scrollingBackground();
    }, 2);
}*/

var bgmove = setInterval(() => {
    backgroundPosition -= 3;
    document.getElementById("game").style.backgroundPosition = backgroundPosition + "px 0px";
}, 15);


//scrollingBackground();

// Making the Phantom attack the Hornet!


/*var phantomPosition = 600;

function movingPhantomLeft() {
    phantomPosition --;
    document.getElementById("phantom").style.left = phantomPosition + "px ";
    console.log("movingPhantomLeft");
}

movingPhantomLeft();

function randomHeightPhantom() {
    let phantom = document.getElementById("phantom");
    let height = Math.floor( Math.random() * 425 );
    phantom.style.bottom = height +"px"
}*/

// Making the Banshee attack the Hornet!


/*var bansheePosition = 600;

function movingBansheeLeft() {
    bansheePosition --;
    document.getElementById("banshee").style.left = bansheePosition + "px ";
    console.log("movingBansheeLeft");
}

movingBansheeLeft();*/

/*function randomHeightBanshee() {
    let banshee = document.getElementById("banshee");
    let height = Math.floor( Math.random() * 650 );
    if (height<=450){
        banshee.style.bottom = "450px"
    } else {
        banshee.style.bottom = height +"px";
    }
    let banshee2 = document.getElementById("banshee2");
    let height2 = Math.floor( Math.random() * 425 );
    if (height2<=350){
        banshee2.style.bottom = "350px"
    } else {
        banshee2.style.bottom = height2 +"px";
    }
    let banshee3 = document.getElementById("banshee3");
    let height3 = Math.floor( Math.random() * 325 );
        banshee3.style.bottom = height3 +"px";
}*/

// Covenants score count


// Banshes
for (var i = 0; i < banshee.length; i++) {
    // When Covies gets out of the screen
    banshee[i].addEventListener("animationiteration", function(){
        // The vehicle passes
        score++;
        scorecontainer.innerHTML = score;

        // Put banshee between top and bottom of screen (661), substract banshee height (37 px) to ensure banshee is not off-screen
        // Math abs makes negative numbers positive, so no off-screen to the top
        var random = Math.abs(Math.floor(Math.random()*661) - 37);
        this.style.top = random + "px";

        // We relaunch a new bansuee at a random interval
        this.style.animationPlayState = "paused";
        var self = this;
        setTimeout(function() {;
            self.style.animationPlayState = "running";
        }, Math.random()*2000);
    });
}

// Elites, see banshee, just adapted
for (var i = 0; i < elite.length; i++) {
    elite[i].addEventListener("animationiteration", function(){
        score += 5;
        scorecontainer.innerHTML = score;

        var random = Math.abs(Math.floor(Math.random()*661) - 40);
        this.style.top = random + "px";

        this.style.animationPlayState = "paused";
        var self = this;
        setTimeout(function() {;
            self.style.animationPlayState = "running";
        }, Math.random()*2000);
    });
}


// Phantom, see banshee, just adapted
for (var i = 0; i < phantom.length; i++) {
    phantom[i].addEventListener("animationiteration", function(){
        score += 10;
        scorecontainer.innerHTML = score;

        var random = Math.abs(Math.floor(Math.random()*661) - 119);
        this.style.top = random + "px";

        this.style.animationPlayState = "paused";
        var self = this;
        setTimeout(function() {;
            self.style.animationPlayState = "running";
        }, Math.random()*2000);
    });
}

function randomBansheePlacement() {
    for (var i = 0; i < banshee.length; i++) {
        var random = Math.abs(Math.floor(Math.random()*661) - 119);
        banshee[i].style.top = random + "px";
        var self = banshee[i];
        setTimeout(function() {;
            self.style.animationPlayState = "running";
        }, Math.random()*2000);
    };
}

function randomElitePlacement() {
    for (var i = 0; i < elite.length; i++) {
        var random = Math.abs(Math.floor(Math.random()*661) - 119);
        elite[i].style.top = random + "px";
        var self = elite[i];
        setTimeout(function() {;
            self.style.animationPlayState = "running";
        }, Math.random()*2000);
    };
}

function randomPhantomPlacement() {
    for (var i = 0; i < phantom.length; i++) {
        var random = Math.abs(Math.floor(Math.random()*661) - 119);
        phantom[i].style.top = random + "px";
        var self = phantom[i];
        setTimeout(function() {;
            self.style.animationPlayState = "running";
        }, Math.random()*2000);
    };
}


/* HERE WE MAKE COLLISIONS */

// Every 20 ms we check if there is a collision
setInterval(function() {
    var hornetBottom = hornetPosition + 40;
    var hornetTop = hornetPosition;

    for (let i = 0; i < ennemies.length; i++) {
        var ennemy = ennemies[i];
        // Here the Y pos is defined randomly by the JS but is constant so we know it
        var enPosY = parseInt(ennemy.style.top);
        var enHeight = parseInt(window.getComputedStyle(ennemy).getPropertyValue("height"));
        var enPosYbottom = enPosY + enHeight;
        // Here the X position changes because of the CSS animation so we compute the X position
        var enPosX = parseInt(window.getComputedStyle(ennemy).getPropertyValue("left"));
        
        // An ennemy is at the sampe X as the falcon
        if (enPosX <= 80) {
            if (
                (hornetTop > enPosY) && (hornetTop < enPosYbottom) // Le hornet touche par le bas
                ||
                (hornetBottom > enPosY) && (hornetBottom < enPosYbottom) // Le hornet touche par le bas*/
            ) {
                gameover();
            }
        }
    }
}, 20);


// Making the Elite attack the Hornet!


/*var elitePosition = 600;

function movingEliteLeft() {
    elitePosition --;
    document.getElementById("elite").style.left = elitePosition + "px ";
    console.log("movingEliteLeft");
}

movingEliteLeft();

function randomHeightElite() {
    let elite = document.getElementById("elite");
    let height = Math.floor( Math.random() * 625 );
    if (height<=350){
        elite.style.bottom = "350px"
    } else {
        elite.style.bottom = height +"px";
    }
    let elite2 = document.getElementById("elite2");
    let height2 = Math.floor( Math.random() * 310 );
    elite2.style.bottom = height2 +"px";
}*/


