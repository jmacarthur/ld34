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


// Shopkeeper
  sphere {
    <2.5, 1.5, 2>, 0.2
    texture {
      pigment { color Pink }
    }
  }

cylinder { <2.5,0,2>, <2.5,1.3,2>, 0.2 texture { pigment { color Yellow} } }

// Floor
box {
     <-3,0,-3>,<3,0.1,3>
         texture {
      DMFWood3   // Pre-defined from stones.inc
      scale 2       // Scale by the same amount in all
                    // directions
		    rotate 45
	     }
	     finish { reflection 0.1 }
}

// Walls
box {  <0,0,-3>,<-3.1,3,3> texture { DMFWood4  scale 1 } }
box {  <3,0,-3>,<3.1,3,3> texture { DMFWood4  scale 1 } }
box {  <0,0,3>,<3.1,3,3.1> texture { DMFWood4  scale 1 } }

// Ceiling
box {  <-3,3,-3>,<3,2.6,3> texture { T_Stone25 scale 2 } }

// Light bulb
light_source { <1.5, 2.4, 0> color <0.5,0.5,0.5>}

// Light bulb
light_source { <1.5, 2.4, -2> color <0.5,0.5,0.5>}

// Counter
box {  <1.5,1,1>,<3.1,1.1,1.75> texture { T_Stone25  scale 2 } }
difference {
	   box {  <1.5,0,1>,<3.1,1,1.75>  }
#for (along, 0, 4,0.5)
	   box { <1.55+along,0.2,-1>, <1.55+along+0.4, 0.9, 1.65> }
#end
	texture { DMFWood3  scale 0.5 }
}

// Glass doors
#for (along, 0, 0.5,0.5)
	   box { <1.55+along,0.2,1>, <1.55+along+0.4, 0.9, 1.05> texture { Glass }}
#end
	   box { <-0.4,0.2,0>, <0, 0.9, 0.05> texture { Glass } 
	   rotate <0,-45,0>
	   translate<2.95,0,1>}

// Fancy objects
// In the counter
sphere {  <1.55+0.2, 0.4, 1.2>, 0.15  texture { pigment { Jade } }}

// In the display case
sphere {  <0.3, 0.3, -0.9+0.5>, 0.15  texture { pigment { Tom_Wood } }}
sphere {  <0.3, 0.3+0.4, -0.9+0.5+1>, 0.15  texture { pigment { Pink_Granite } }}



// Display box

difference {
	   box { <0,0,-3>, <0.5, 1.7, 2.1>  }
#for (along, 0, 4)
	   box { <0.1,0.2,-2.9+along>, <0.6, 1.65, -2+along> }
#end
	   texture {DMFLightOak scale 1}
}

// Glass shelves
#for (along, 0, 4)
#for (goup, 0.3, 1.4,0.4)
box { <0.1,0.2+goup,-2.9+along>, <0.5, 0.22+goup, -2+along> 
    texture { Glass }
}
#end
light_source { <0.3,1.4,-2.9+along+0.5>, colour <1.0,1.0,1.0>
	      spotlight 
	     point_at <0.3,1.0,-2.9+along+0.5> 
	     radius 10
	     falloff 15}
#end


// Sign

box { <0.2,2,2.9>, <2.8,2.5,3.0>
    pigment {
    image_map{    png "shop-sign.png"} 
    scale <2.6,0.5,1>
    translate <0.2,0,0>
    }
}

  global_settings { ambient_light rgb<0.1, 0.1, 0.1> }