
class CS336Materials{
    type = null;

    // for just having one solid color
    solid = false;

    // default solid color is red
    color = [1.0, 1.0, 0.0, 1.0];

    // for textures 
    texture_2d = false;
    texture_cube = false;

    surfaceAttributes = new Float32Array([
        0.2, 0.2, 0.2,
        0.7, 0.7, 0.7,
        0.7, 0.7, 0.7,
      ]);
    textureAttributes = null;

    adjust_surface = false;

    // type can be texture cube, texture 2D or solid 
    constructor(type){
        this.type = type;
        if (type === "2D"){
            this.texture_2d = true;
            this.adjust_surface = true;
        }
        else if (type === "cube"){
            this.texture_cube = true;
            this.adjust_surface = true;
        }
        else {
            this.solid = true;
            this.adjust_surface = true;
        }
    }

    setColor(newColor){
        this.color = newColor;
    }

    setSurfaceAttributes(newSurfaceAttributes){
        this.surfaceAttributes = newSurfaceAttributes;
    }


}