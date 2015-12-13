#include "colors.inc"    // The include files contain
#include "stones.inc"    // pre-defined scene elements
#include "textures.inc"    // pre-defined scene elements
#include "shapes.inc"
#include "glass.inc"
#include "metals.inc"
#include "woods.inc"

camera {
    location <1.5, 2, -3>
    look_at  <1.5, 1,  2>
  }

  sphere {
    <0, 1, 2>, 2
    texture {
      pigment { color Yellow }
    }
  }

// Floor
box {
     <-3,0,-3>,<3,0.1,3>
         texture {
      DMFWood3   // Pre-defined from stones.inc
      scale 2       // Scale by the same amount in all
                    // directions
		    rotate 45
	     }
}

// Walls
box {  <-3,0,-3>,<0.1,3,3> texture { DMFWood3  scale 2 } }
box {  <3,0,-3>,<3.1,3,3> texture { DMFWood3  scale 2 } }
box {  <-3,0,3>,<3.1,3,3.1> texture { DMFWood3  scale 2 } }

// Ceiling
box {  <-3,3,-3>,<3,2.6,3> texture { T_Stone25 scale 2 } }


light_source { <1.5, 2.4, 0> color White}
