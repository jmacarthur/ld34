#!/usr/bin/python
import random
import bisect
import numpy as np
import scipy
from scipy.spatial import Voronoi, voronoi_plot_2d
import matplotlib.pyplot as plt
import pyclipper

# Generates random points inside a polygon then voronois them

def splitAfter(points, n):
    minX = points[n]
    r = points[n+1]-minX
    wobble = 0.2
    p = r/2.0 + ((random.random() * wobble) - (wobble/2.0))*r
    r1 = p
    r2 = r-p
    bisect.insort_left(points, minX+p)

def randomInRange(minX, maxX, noPoints):
    points = [minX, maxX]
    breakPoint = 0
    for p in range(0, noPoints):
        splitAfter(points, breakPoint)
        maxr = 0
        breakPoint = None
        # find the largest range
        for i in range(0,len(points)-1):
            r = points[i+1] - points[i]
            if r > maxr:
                maxr = r
                breakPoint = i
    return points

def generatePoints():
    points = []
    wobble = 2
    minx = 0
    miny = 0
    maxx = 1000
    maxy = 1000
    xcoords = randomInRange(minx,maxx,10)[1:-2]
    for x in xcoords:
        ycoords = randomInRange(miny,maxy,10)[1:-2]
        for y in ycoords: 
            points.append([x+random.random()*wobble-wobble/2,y])
    return np.array(points)

def voronoi(points):
    vor = Voronoi(points)
    print vor.vertices
    print vor.regions
    polygons = []
    for r in vor.regions:
        points = []
        for i in r:
            points.append(vor.vertices[i])
        polygons.append(points)
    return polygons

def scipyToClipper(polygon):
    intPoly = []
    for p in polygon:
        (x,y) = map(int,p)
        intPoly.append((x,y))
    return tuple(intPoly)

def loadPoly(filename):
    f = open(filename)
    positivePolygon = []
    negativePolygons = []
    minx = 1000
    miny = 1000
    maxx = 0
    maxy = 0
    negative = False
    while True:
        polygon = []
        l = f.readline().strip()
        if l == "": break
        points = l.split(" ")
        print repr(l)
        for p in points:
            try:
                (x,y) = map(float,p.split(","))
                minx = min(x, minx)
                maxx = max(x, maxx)
                miny = min(y, miny)
                maxy = max(y, maxy)
                polygon.append((x,y))
            except:
                print "Invalid point: "+p
        if negative:
            negativePolygons.append(polygon)
        else:
            positivePolygon = polygon
            negative = True
    return (positivePolygon, negativePolygons)

def clip(polygons):
    (clip, subtracts) = loadPoly("utah-teapot.poly")
    finalPolys = []
    for p in polygons:
        if len(p)==0: continue
        subj = (scipyToClipper(p),)
        pc = pyclipper.Pyclipper()
        pc.AddPath(clip, pyclipper.PT_CLIP, True)
        pc.AddPaths(subj, pyclipper.PT_SUBJECT, True)
        solution = pc.Execute(pyclipper.CT_INTERSECTION, pyclipper.PFT_EVENODD, pyclipper.PFT_EVENODD)
        if len(solution)<1: continue
        for s in subtracts:
            sp = scipyToClipper(s)
            print "subtracting: "+repr(sp)
            print "from: "+repr(solution)
            pc.Clear()
            pc.AddPaths(solution, pyclipper.PT_SUBJECT, True)
            pc.AddPath(sp, pyclipper.PT_CLIP, True)
            solution = pc.Execute(pyclipper.CT_DIFFERENCE, pyclipper.PFT_EVENODD, pyclipper.PFT_EVENODD)
        finalPolys.extend(solution)
    return finalPolys

def dumpSvg(polys):
    f = open("temp.svg","w")
    f.write("<svg>\n")
    for poly in polys:
        f.write('<path style="fill:none;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"')
        f.write("\nd=\"M ")
        for point in poly:
            f.write("%f,%f "%tuple(point))
        f.write("z\"")
        f.write(" />\n")
    f.write("</svg>\n")
    f.close()

def dumpPoly(polys):
    f = open("shattered.poly","w")
    for poly in polys:
        line = ""
        for point in poly:
            pointText = "%f,%f "%tuple(point)
            line += pointText
        f.write(line)
        f.write("\n")
    f.close()


if __name__=="__main__":
    points = generatePoints()
    polygons = voronoi(points)
    f = clip(polygons)
    dumpSvg(f)
    dumpPoly(f)
