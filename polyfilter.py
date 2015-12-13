#!/usr/bin/python

# Polyfilter - filters polygon files for very small polygons

import sys

f = open(sys.argv[1])

def PolygonArea(corners):
    n = len(corners) # of corners
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += corners[i][0] * corners[j][1]
        area -= corners[j][0] * corners[i][1]
    area = abs(area) / 2.0
    return area

allAreas = []
maxArea = 0
while True:
    line = f.readline().strip()
    if line=="": break
    points = line.split(" ")
    corners = []
    for p in points:
        ip = map(float,p.split(","))
        corners.append(ip)
    area = PolygonArea(corners)
    if (area > 500):
        print " ".join(points)
        
    
