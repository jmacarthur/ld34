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

function loadFragments()
{
    fragments = new Array();
    colours = new Array();
    
    request = new XMLHttpRequest();
    request.open("GET", "resources/utah-teapot.shattered.poly",false); // Blocking, todo
    request.send(null);

    lineArray = request.responseText.split("\n");
    for(var l = 0;l< lineArray.length; l++) {
	line = lineArray[l];
	pointArray = line.split(" ");
	poly = new Array();
	for(var p=0;p < pointArray.length;p++) {
	    point = pointArray[p];
	    xy = point.split(",");
	    poly.push([xy[0]/2+100, xy[1]/2-50]); // Hax
	}
	fragments.push(new TaggedPoly("poly"+l, poly, null));
	col = "#"
	for(var i=0;i<3;i++)
	    col += (Math.floor(Math.random()*127)+127).toString(16);
	colours.push(col);
	console.log("Colour "+l+": "+col);
    }
}


function resetGame()
{
    batx = 128;
    baty = 450;
    x = 320;
    y = baty;
    dx = -8;
    dy = -8;

    loadFragments();

}

function init()
{
    mode = MODE_TITLE;
    playerImage = getImage("skateboard");
    bullImage = getImage("bull");
    springSound = new Audio("audio/boing.wav");
    makeTitleBitmaps();
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
                //if(p.polygon.region.collide == False):
                //outangle = incident-Math.PI
                collisions.push(new Collision(ix,iy, iPoint, outangle, p))
	    }
	}
    }
}

function animate()
{
    if(x > SCREENWIDTH || x<0)  dx = -dx;
    if(y > SCREENHEIGHT || y<0)  dy = -dy;
    var ball = { 'x': x, 'y': y, 'dx': dx, 'dy': dy, 'radius': 16 };
    collisions = new Array();
    closest = null;
    lastCollisionObjectID = null;
    if(y > (baty - ball.radius) && dy > 0) {
	if(x > batx-8 && x < (batx+playerImage.width+8) ) {
	    dy = -Math.abs(dy);
	}
	if(y>470) {
	    resetGame();
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
	closest.obj.alive = false;
    } else {
	x += dx;
	y += dy;
    }
    
}

function draw() {
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, 0, SCREENWIDTH, SCREENHEIGHT);

    if(mode == MODE_TITLE) {
	ctx.drawImage(titleBitmap, 0, 0);
	return;
    }

    ctx.drawImage(playerImage, batx, baty);
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,0,255,0.5)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,0,255,1.0)';
    ctx.fill();
    ctx.save();
    ctx.translate(x,y);
    angle = Math.atan2(dy, dx);
    ctx.rotate(angle);
    ctx.drawImage(bullImage, -16, -16, 32,32);
    ctx.restore();

    ctx.fillStyle = 'red';

    for(f=0;f<fragments.length;f++) {
	if(fragments[f].alive == false) continue;
	poly = fragments[f].poly;
	ctx.fillStyle = colours[f];
	ctx.beginPath();
	ctx.moveTo(poly[0][0], poly[0][1]);
	for(p=1;p<poly.length;p++) {
	    point = poly[p];
	    ctx.lineTo(point[0], point[1]);
	}
	ctx.closePath();
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
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, 0, SCREENWIDTH, SCREENHEIGHT);
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
