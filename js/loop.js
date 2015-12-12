var canvas = document.getElementsByTagName('canvas')[0];
var ctx = null;
var body = document.getElementsByTagName('body')[0];
var keysDown = new Array();
var SCREENWIDTH  = 640;
var SCREENHEIGHT = 480;
var MODE_TITLE = 0;
var MODE_PLAY  = 1;
var MODE_WIN   = 2;

function getImage(name)
{
    image = new Image();
    image.src = 'graphics/'+name+'.png';
    return image;
}

function drawChar(context, c, x, y) 
{
    c = c.charCodeAt(0);
    if(c > 0) {
        context.drawImage(bitfont, c*6, 0, 6,8, x, y, 12, 16);
    }
}

function drawString(context, string, x, y) {
    string = string.toUpperCase();
    for(i = 0; i < string.length; i++) {
	drawChar(context, string[i], x, y);
	x += 12;
    }
}

function paintTitleBitmaps()
{
    drawString(titlectx, 'This is a demo of the JavaScript/HTML5 game loop',32,32);
    drawString(winctx, 'Your game should always have an ending',32,32);
}

function makeTitleBitmaps()
{
    titleBitmap = document.createElement('canvas');
    titleBitmap.width = SCREENWIDTH;
    titleBitmap.height = SCREENHEIGHT;
    titlectx = titleBitmap.getContext('2d');
    winBitmap = document.createElement('canvas');
    winBitmap.width = SCREENWIDTH;
    winBitmap.height = SCREENHEIGHT;
    winctx = winBitmap.getContext('2d');
    bitfont = new Image();
    bitfont.src = "graphics/bitfont.png";
    bitfont.onload = paintTitleBitmaps;
}

function resetGame()
{
    batx = 128;
    x = 320;
    y = 128;
    dx = 4;
    dy = 4;

    fragments = [
	[[316.000000,468.000000],[302.000000,514.000000],[235.000000,514.000000],[218.000000,488.000000],[243.000000,433.000000],[295.000000,433.000000]],
	[[243.000000,433.000000],[218.000000,488.000000],[164.000000,487.000000],[159.000000,456.000000],[176.000000,415.000000],[227.000000,414.000000]],
	[[204.000000,362.000000],[213.000000,384.000000],[205.000000,404.000000],[167.000000,403.000000],[201.000000,433.000000],[97.000000,368.000000],[145.000000,360.000000]]
    ];

}

function init()
{
    mode = MODE_TITLE;
    playerImage = getImage("player");
    springSound = new Audio("audio/boing.wav");
    makeTitleBitmaps();
    return true;
}

function animate()
{
    x += dx;
    y += dy;
    if(x > SCREENWIDTH || x<0)  dx = -dx;
    if(y > SCREENHEIGHT || y<0)  dy = -dy;
}

function draw() {
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, 0, SCREENWIDTH, SCREENHEIGHT);

    if(mode == MODE_TITLE) {
	ctx.drawImage(titleBitmap, 0, 0);
	return;
    }

    ctx.drawImage(playerImage, batx, 400);
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.fillStyle = 'red';

    for(f=0;f<fragments.length;f++) {
	poly = fragments[f];
	ctx.beginPath();
	ctx.moveTo(poly[0][0], poly[0][1]-100);
	for(p=1;p<poly.length;p++) {
	    point = poly[p];
	    ctx.lineTo(point[0], point[1]-100);
	    }
	ctx.fill()
	}

    if(mode == MODE_WIN) {
	ctx.drawImage(winBitmap, 0, 0);
    }
}

function processKeys() {
    if(keysDown[37] || keysDown[65]) batx -= 8;
    if(keysDown[39] || keysDown[68]) batx += 8;
    if(batx < 0) batx = 0;
    if(batx > SCREENWIDTH - playerImage.width)  batx = SCREENWIDTH - playerImage.width;
}

function drawRepeat() {
    if(mode != MODE_TITLE) {
	processKeys();
	animate();
    }
    draw();
    if(!stopRunloop) setTimeout('drawRepeat()',20);
}

if (canvas.getContext('2d')) {
    stopRunloop = false;
    ctx = canvas.getContext('2d');
    body.onkeydown = function (event) {
	var c = event.keyCode;
        keysDown[c] = 1;
	if(c == 81) {
	    stopRunloop=true;
	}
	if(c == 32) {
	    if(mode == MODE_TITLE) {
		resetGame();
		mode = MODE_PLAY;
	    }
	}
	if(c == 82) {
	    if(mode == MODE_WIN) {
		mode = MODE_TITLE;
	    }
	}
    };

    body.onkeyup = function (event) {
	var c = event.keyCode;
        keysDown[c] = 0;
    };

    if(init()) {      
      drawRepeat();
    }
}
