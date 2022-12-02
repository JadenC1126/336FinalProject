
class CS336Materials{
    type = null;

    // for just having one solid color
    solid = false;

    // default solid color is red
    color = new THREE.vec4(1.0, 0.0, 0.0, 1.0);

    // for textures 
    texture_2d = false;
    texture_cube = false;

    surfaceAttributes = null;
    textureAttributes = null;

    // type can be texture cube, texture 2D or solid 
    constructor(type){
        this.type = type;
        if (type === "2D"){
            this.texture_2d = true;
        }
        else if (type === "cube"){
            this.texture_cube = true;
        }
        else {
            this.solid = true;
        }
    }

    setColor(newColor){
        this.color = newColor;
    }


}