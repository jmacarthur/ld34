#!/usr/bin/python
import sys

# Turns an SVG path data string into a sequence of absolute coordinates.
if len(sys.argv) < 2: 
    print "usage: poly-processor.py <filename>"
    exit(0)
f = open(sys.argv[1])

while True:
    coord = [0.0,0.0]
    coords = []
    moving = True
    closePath = True
    l = f.readline()
    if l == "":
        break
    elems = l.split(" ")
    for e in elems:
        e = e.strip()
        if e == "m":
            relative = True
            moving = True
        elif e == "l":
            moving = False
            relative = True
        elif e == "L":
            moving = False
            relative = False
        elif e == "M":
            moving = True
            relative = False
        elif e == "z":
            closePath = True
        elif e == "": 
            break
        else:
            (x,y) = map(float,e.split(","))
            if(relative):
                coord[0] += x
                coord[1] += y
            else:
                coord[0] += x
                coord[1] += y
            coords.append("%f,%f" % tuple(coord))

    print " ".join(coords)
        
f.close()
