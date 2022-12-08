
class CS336Materials{
    type = null;

    // for just having one solid color
    solid = false;

    // default solid color is red
    color = [1.0, 0.0, 0.0, 1.0];

    // for textures 
    texture2D = false;
    textureCube = false;

    surfaceAttributes = new Float32Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
      ]);
    textureAttributes = null;

    adjustSurface = false;

    // type can be texture cube, texture 2D or solid 
    constructor(type){
        this.type = type;
        if (type === "2D"){
            this.texture2D = true;
            this.adjustSurface = true;
        } else if (type === "cube"){
            this.textureCube = true;
            this.adjustSurface = true;
        } else {
            this.solid = true;
            this.adjustSurface = true;
        }
    }

    setColor(newColor){
        this.color = newColor;
    }

    setSurfaceAttributes(newSurfaceAttributes){
        this.surfaceAttributes = newSurfaceAttributes;
    }

    create2DTexture(filePath){
        this.textureAttributes = new CS336Texture("2D");
        this.textureAttributes.imagePaths = filePath;
    }

    createTextureCube(filePaths){
        this.textureAttributes = new CS336Texture("cube");
        this.textureAttributes.imagePaths = filePaths;
    }

}