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
    titlectx.drawImage(titleImage, 0, 0);
    drawString(winctx, 'Your game should always have an ending',32,32);
}

function makeBitmaps()
{
    paintTitleBitmaps();
    makePriceBitmap();
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
    bitfont.onload = makeBitmaps;
}

function makePriceBitmap()
{
    priceBitmap = document.createElement('canvas');
    priceBitmap.width = 64;
    priceBitmap.height = 32;
    pricectx = priceBitmap.getContext('2d');
    pricectx.moveTo(0,16);
    pricectx.lineTo(16,30);
    pricectx.lineTo(64,30);
    pricectx.lineTo(64,2);
    pricectx.lineTo(16,2);
    pricectx.fillStyle="#ff8000";
    pricectx.strokeStyle="#804000";
    pricectx.lineWidth=4;
    pricectx.closePath();
    pricectx.fill();
    pricectx.stroke();   
    drawString(pricectx, "$200", 14,8);
    console.log("Created price bitmap");
}

function loadPolygon(line)
{
    poly = new Array();
    scale = 0.5;
    if(shape == "vase") scale = 1/2.5; // Nasty hack because the vase is too big
    pointArray = line.split(" ");
    for(var p=0;p < pointArray.length;p++) {
	point = pointArray[p];
	xy = point.split(",");
	// polygons are specified on a 1-1000 scale.
	poly.push([(xy[0]-500)*scale+320, xy[1]*scale]); 
    }
    return poly;
}

function loadFragments()
{
    fragments = new Array();
    outline = new Array();
    colours = new Array();
    borderColours = new Array();

    if(stage == 0) {
	shape = "teapot";
    } else if (stage == 1) {
	shape = "diamond";
    } else if (stage == 2) {
	shape = "vase";
    }

    totalFragments = 0;
    request = new XMLHttpRequest();
    request.open("GET", "resources/"+shape+".shattered.poly",false); // Blocking, todo
    request.send(null);

    lineArray = request.responseText.split("\n");
    for(var l = 0;l< lineArray.length; l++) {
	line = lineArray[l];
	poly = loadPolygon(line)
	fragments.push(new TaggedPoly("poly"+l, poly, null));
	totalFragments += 1;
	col = "#"
	bcol = "#"
	r = Math.floor(Math.random()*64);
	g = Math.floor(Math.random()*64);
	b = Math.floor(Math.random()*64);
	col += (r+191).toString(16)+(g+192).toString(16)+(b+191).toString(16);
	bcol += (r).toString(16)+(g).toString(16)+(b).toString(16);
	colours.push(col);
	borderColours.push(bcol);
    }

    request = new XMLHttpRequest();
    request.open("GET", "resources/"+shape+".poly",false); // Blocking, todo
    request.send(null);

    lineArray = request.responseText.split("\n");
    for(var l = 0;l< lineArray.length; l++) {
	line = lineArray[l];
	poly = loadPolygon(line);
	outline.push(new TaggedPoly("outline"+l, poly, null));
    }
}


function resetGame()
{
    frameCounter = 0;
    lives = 3;
    scrollOn = 480;
    shattered = false;
    loadFragments();
    resetLife();
    gameOverTimeout = 0;
    score = 0;
    tagOffset = 0;
    winTimeout = 0;
}

function nextLevel()
{
    // Subset of resetgame, could be combined.
    frameCounter = 0;
    scrollOn = 480;
    shattered = false;
    loadFragments();
    resetLife();
    gameOverTimeout = 0;
    winTimeout = 0
    tagOffset = 0;
}

function resetLife()
{
    batx = 128;
    baty = 450;
    x = batx;
    y = baty;
    dx = -8;
    dy = -8;
    ballRadius = 16;
    if(cheatMode) {
	dy = -32;
	ballRadius = 64;
	}
    launchTimeout = 80;
    launchDir = 1; // Right
    startSound.play();
    tagAngle = 0;


}

function init()
{
    mode = MODE_TITLE;
    playerImage = getImage("skateboard");
    bullImage = getImage("bull");
    backgroundImage = getImage("chinashop-640");
    titleImage = getImage("title");
    hitSound = new Audio("audio/blip.wav");
    startSound = new Audio("audio/start.wav");
    wallSound = new Audio("audio/wall.wav");
    winSound = new Audio("audio/win.wav");
    batSound = new Audio("audio/bat.wav");
    makeTitleBitmaps();
    makePriceBitmap();
    frameCounter = 0;
    tagOffset = 0;
    stage = 0;
    cheatMode = false;
    return true;
}

function TaggedPoint(coords, polygon, pointid)
{
    this.x1 = coords[0];
    this.y1 = coords[1];
    this.ident = polygon.ident+"-"+pointid;
    this.polygon = polygon
}


function TaggedLine(x1, y1, x2, y2, polygon, lineid){
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.polygon = polygon;
    this.ident = polygon.ident+"-l"+lineid;
}

function TaggedPoly(ident, pointarray, region) {
    this.poly = pointarray;
    this.region = region;
    this.ident = ident;
    this.alive = true;
}

function Collision(ix,iy,dist,outAngle,obj)
{
    this.ix = ix;
    this.iy = iy;
    this.dist = dist;
    this.outAngle = outAngle;
    this.obj = obj;
}
function getTaggedPolyLines(taggedPolygon)
{
    lines = new Array();
    poly = taggedPolygon.poly;
    for(p=0;p<poly.length-1;p++) {
        lines.push(new TaggedLine(poly[p][0],poly[p][1],poly[p+1][0],poly[p+1][1],taggedPolygon,p));
    }
    lines.push(new TaggedLine(poly[0][0],poly[0][1],poly[poly.length-1][0],poly[poly.length-1][1],taggedPolygon,p));
    return lines;
}

function degrees(r) {
    return r*(180/Math.PI);
}

function radians(r) {
    return r*(Math.PI/180);
}


function lineIntersection(ballx, bally, ballxv, ballyv,
			  lstartx, lstarty, lxv, lyv)
{
    j = (lstarty/ballyv - bally/ballyv + ballx/ballxv -lstartx/ballxv)/(lxv/ballxv -lyv/ballyv);
    i = (lstartx+j*lxv-ballx)/ballxv;
    return [i,j];
}

function lineLen(x,y)
{
    return Math.sqrt(x*x+y*y);
}


function intersectPoly(poly, collisions, ball, considerRadius, lastCollisionObjectID)
{
    if(!poly.alive) return;
    lines = getTaggedPolyLines(poly);
    hitline = null;
    lowi = 1.1;

    for(ln=0;ln<lines.length;ln++) {
	l = lines[ln]
        if(l.ident == lastCollisionObjectID) continue;
        lxv = l.x2-l.x1;
	lyv = l.y2-l.y1;
	lnormx = -lyv;
        lnormy = lxv;
        normScale = lineLen(lnormx,lnormy);
        lnormx = lnormx / normScale;
        lnormy = lnormy / normScale;
        dotproduct = lnormx*ball.dx+lnormy*ball.dy;
        if(dotproduct>0) {
            lnormx = -lnormx;
            lnormy = -lnormy;
	}
        if(considerRadius) {              
            // Make a parallel line
            lstartx = l.x1+lnormx*ball.radius;
            lstarty = l.y1+lnormy*ball.radius;
	}
        else {
            lstartx = l.x1;
            lstarty = l.y1;
	}
	
        res = lineIntersection(ball.x,ball.y,ball.dx,ball.dy,
                               lstartx,lstarty,lxv,lyv);
        i = res[0];
	j = res[1];
        if(i>=0 && i<=1 && j>=0 && j<=1) {
            if(i<lowi) {
                lowi = i;
                hitline = l;
	    }
	}
	
        }
    if(hitline != null) {
	// Ok, now we can figure out the angle wrt the surface normal...
        lxv = hitline.x2 - hitline.x1;
        lyv = hitline.y2 - hitline.y1;
	
        lnormx = -lyv;
        lnormy = lxv;
        normScale = Math.sqrt(lnormx*lnormx+lnormy*lnormy);
        lnormx = lnormx / normScale;
        lnormy = lnormy / normScale;
        dotproduct = lnormx*ball.dx+lnormy*ball.dy;
	// This time, we make the normal in the same direction as the ball vector
        if(dotproduct<0) {
	    lnormx = -lnormx;
	    lnormy = -lnormy;
	}
        lenNormal = 1.0;
        ballToIntersectX = lowi*ball.dx;
        ballToIntersectY = lowi*ball.dy;
        distToIntersect = Math.sqrt(ballToIntersectX*ballToIntersectX
                                    +ballToIntersectY*ballToIntersectY);
        ballToIntersectX /= distToIntersect;
        ballToIntersectY /= distToIntersect;
        angle = Math.acos(ballToIntersectX*lnormx+ballToIntersectY*lnormy);
        console.log("Collision is at "+degrees(angle)+" degrees to surface normal");
        normAngle = Math.atan2(lnormy,lnormx)+Math.PI;
        incident = Math.atan2(ball.dy,ball.dx)+Math.PI;
        angle =  incident - normAngle;
        
        outangle = normAngle - angle;
	
        //if(poly.region.collide == False) {
        //    outangle = incident - Math.PI;
	//}
        collisions.push(new Collision(ball.x + lowi*ball.dx, ball.y+lowi*ball.dy, lowi, outangle,poly));
	console.log("Intersection with polygon "+poly.ident+" line "+hitline.ident);
    }
}

function checkClosestApproach(point, startx, starty, dx, dy)
{
    normx = -dy;
    normy = dx;
    res = lineIntersection(startx,starty,dx,dy,
                             point.x1,point.y1,normx,normy);
    i = res[0]; j = res[1];
    dist = Math.abs(j*lineLen(normx,normy));
    return [dist,i];
}
function intersectVertices(points, collisions, ballx,bally,ballxv,ballyv, ballRadius,lastCollisionObjectID)
{
    for(pointindex=0;pointindex<points.length;pointindex++) {
	p = points[pointindex];
        if(p.ident == lastCollisionObjectID) continue;
        res = checkClosestApproach(p,ballx,bally,ballxv,ballyv);

	d = res[0]; i = res[1];
        if(d<ballRadius) {
            diff = ballRadius - d;
            dist = Math.sqrt(ballRadius*ballRadius-d*d);
            iPoint = (lineLen(ballxv,ballyv)*i-dist)/lineLen(ballxv,ballyv); // Distance to intersect
            if(iPoint >=0 && iPoint <=1) {
                ix = ballx+ballxv*iPoint;
                iy = bally+ballyv*iPoint;
                radiusAng = Math.atan2(iy-p.y1,ix-p.x1);
                incident = Math.atan2(ballyv,ballxv)+Math.PI;
                angle =  incident - radiusAng;
                console.log("Collides with ident "+p.ident+" Incident angle = "+degrees(incident));
                console.log("Surface normal angle = "+degrees(radiusAng));
                outangle = radiusAng - angle;
		// Horrible way to get the polygon of this point by parsing the ident...
		split = p.ident.indexOf("-");
		polyNum = p.ident.slice(4,split);
                collisions.push(new Collision(ix,iy, iPoint, outangle, fragments[polyNum]))
	    }
	}
    }
}

function animate()
{
    if(scrollOn >1) {
	scrollOn *= 0.8;
	}
    else {
	scrollOn = 0;
	}
    if(x > SCREENWIDTH || x<0) { dx = -dx; wallSound.play(); }
    if(y > SCREENHEIGHT || y<0) { dy = -dy; if(gameOverTimeout==0) wallSound.play(); }

    if(launchTimeout > 0) {
	launchTimeout -= 1;
	x = batx+playerImage.width/2;
	dx = launchDir*8;
	y = baty;
    }
    var ball = { 'x': x, 'y': y, 'dx': dx, 'dy': dy, 'radius': ballRadius };
    collisions = new Array();
    closest = null;
    lastCollisionObjectID = null;
    if(y > (baty - ball.radius) && dy > 0) {
	if(x > batx-8 && x < (batx+playerImage.width+8) ) {
	    dy = -Math.abs(dy);
	    batSound.play();
	}
	if(y>470) {
	    if(cheatMode || winTimeout > 0) {
		dy = -dy;
	    }
	    else {
		lives -= 1;
		if(lives <= 0) {
		    // Hacked game end mode
		    gameOverTimeout = 100;
		    y = 1000;
		    dy = 0;
		    return;
		}
		resetLife();
	    }
	}
    }
    else
    {
	for(f=0;f<fragments.length;f++) {
	    poly = fragments[f];
	    lastCollisionObjectID = "";
	    intersectPoly(poly, collisions, ball, 1, lastCollisionObjectID);
	}
	
	points = new Array();
	for(f=0;f<fragments.length;f++) {
	    poly = fragments[f];
	    if(poly.alive == false) continue;
	    for(p=0;p<poly.poly.length;p++) {
		points.push(new TaggedPoint(poly.poly[p], poly, p));
	    }	
	}
	
	intersectVertices(points, collisions, ball.x,ball.y,ball.dx,ball.dy, ball.radius,lastCollisionObjectID)
	closestDist = 1.1;
	
	for(c=0;c<collisions.length;c++) {
	    col = collisions[c];
	    console.log(col.ix, col.iy, col.dist, col.outAngle);
	    if(col.dist < closestDist) {
		closest = col;
		closestDist = col.dist;
	    }
	}
    }
    
    if(closest != null) {
        console.log("Identified collision as "+closest.obj.ident+" at dist "+closestDist);
	ctx.beginPath();
	ctx.moveTo(x,y);
	x = closest.ix;
        y = closest.iy;
        dist = lineLen(dx,dy);
        //distRemain = dist*(1.0-closest.dist);
        dx = dist*Math.cos(closest.outAngle);
        dy = dist*Math.sin(closest.outAngle);
	console.log("Moving to "+x+","+y+" with vel "+dx+","+dy);
	// TODO: At the moment we only do one collision per check - we could get into trouble this way...
	ctx.lineTo(x,y);
	ctx.stroke();
	if (shattered) {
	    closest.obj.alive = false;
	    score += 2;
	    totalFragments -= 1;
	    if(totalFragments <= 1) {
		// For some reason we always have 1 fragment left when the game's finished...
		winTimeout = 100;
		winSound.play();
	    }
	    console.log("Fragments remaining: "+totalFragments);
	} else {
	    shattered = true;
	    }
	hitSound.play()
    } else {
	x += dx;
	y += dy;
    }
    if(gameOverTimeout > 0) {
	gameOverTimeout -= 1;
	if(gameOverTimeout ==0) {
	    mode = MODE_TITLE;
	}
    }
    if(winTimeout > 0) {
	winTimeout -= 1;
	if(winTimeout ==0) {
	    stage = (stage+1) % 3;
	    nextLevel();
	}
    }
}

function drawFragments()
{

    for(f=0;f<fragments.length;f++) {
	if(fragments[f].alive == false) continue;
	poly = fragments[f].poly;
	ctx.fillStyle = colours[f];
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(poly[0][0], poly[0][1]);
	for(p=1;p<poly.length;p++) {
	    point = poly[p];
	    ctx.lineTo(point[0], point[1]);
	}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	}


}

function drawOutline()
{
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.strokeWidth=4;
    for(f=0;f<outline.length;f++) {
	poly = outline[f].poly;
	ctx.moveTo(poly[0][0], poly[0][1]-scrollOn);
	for(p=1;p<poly.length;p++) {
	    point = poly[p];
	    ctx.lineTo(point[0], point[1]-scrollOn);
	}
    }
    ctx.closePath();
    ctx.fill();
}

function draw() {
    ctx.drawImage(backgroundImage, 0,0);
    frameCounter += 1;
    if(mode == MODE_TITLE) {
	ctx.drawImage(titleBitmap, 0, 0);
	ctx.beginPath();
	a = 381;
	ctx.moveTo(a+stage*80, 400);
	ctx.lineTo(a+stage*80+80, 400);
	ctx.lineTo(a+stage*80+80, 475);
	ctx.lineTo(a+stage*80, 475);
	ctx.lineWidth = 5;
	ctx.strokeStyle = '#ffff00';
	ctx.closePath();
	ctx.stroke();
	return;
    }

    ctx.drawImage(playerImage, batx, baty);
    ctx.beginPath();
    ctx.arc(x, y, ballRadius*1.2, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,255,0,0.5)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,255,0,1.0)';
    ctx.fill();
    ctx.save();
    ctx.translate(x,y);
    if(launchTimeout > 0)
	angle = 0;
    else
	angle = Math.atan2(dy, dx);
    ctx.rotate(angle);
    ctx.drawImage(bullImage, -16, -16, 32,32);
    ctx.restore();

    if(launchTimeout > 0)
    {
	ctx.lineWidth = 5;
	ctx.beginPath();

	ctx.arc(x, y, launchTimeout+16, 0, 2 * Math.PI, false);
	ctx.strokeStyle = 'rgba(0,255,0,0.5)';
	ctx.stroke();	
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x+launchDir*16,y-32);
	ctx.lineTo(x+launchDir*32,y-32);
	ctx.lineTo(x+launchDir*32,y-16);
	ctx.fill();
    }

    ctx.fillStyle = 'red';

    if (shattered) {
	drawFragments(); 
    } else {
	drawOutline();
    }

    if(mode == MODE_WIN) {
	ctx.drawImage(winBitmap, 0, 0);
    }

    // Price tag
    if(!shattered) {
	tagAngle = radians(90)+Math.sin(frameCounter/8);
    } else {
	tagOffset += 4;
	tagOffset *= 1.2;
    }
    if(tagOffset < 600) {
	ctx.save()
	ctx.lineWidth=2;
	ctx.strokeStyle="#000000";
	ctx.translate(400,200+tagOffset);
	ctx.rotate(tagAngle);
	ctx.moveTo(0,0);
	ctx.lineTo(64,0);
	ctx.stroke();
	ctx.drawImage(priceBitmap, 64, -16);
	ctx.restore();
    }

    for(i=1;i<lives;i++) {
	ctx.beginPath();
	ctx.arc(SCREENWIDTH-60*i+24, 8+24, 24, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'rgba(255,255,0,0.5)';
	ctx.fill();
	ctx.drawImage(bullImage, SCREENWIDTH-60*i, 8, 48,48);
    }

    if(gameOverTimeout > 0) {
	drawString(ctx, "GAME OVER", 320-14*4.5, 400);
    }
    drawString(ctx, "$"+score, 8, 8);
    if(cheatMode) {
	drawString(ctx, "CHEAT MODE", 320-5*14, 420)
    }
}

function processKeys() {
    if(keysDown[37] || keysDown[65]) { batx -= 8; launchDir = -1; }
    if(keysDown[39] || keysDown[68]) { batx += 8; launchDir = 1; }
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
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, 0, SCREENWIDTH, SCREENHEIGHT);
    body.onkeydown = function (event) {
	var c = event.keyCode;
        keysDown[c] = 1;
	if(c == 81) {
	    stopRunloop=true;
	}
	if(c == 39 && mode == MODE_TITLE) {
	    stage = (stage+1)%3;
	}

	if(c == 32 || c==37) {
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
	if(c==221 && mode == MODE_TITLE) cheatMode = !cheatMode;
    };

    body.onkeyup = function (event) {
	var c = event.keyCode;
        keysDown[c] = 0;
    };

    if(init()) {      
      drawRepeat();
    }
}
