/**
 * Represents a material for a 3D object
 * Can be solid, 2D, or 3D.
 * Includes surface and texture attributes.
 */
class CS336Materials{
    type = null;

    // for just having one solid color
    solid = false;

    // default solid color is red
    color = [1.0, 0.0, 0.0, 1.0];

    // for textures 
    texture2D = false;
    textureCube = false;
    textureAttributes = null;

    // default surface attributes
    surfaceAttributes = new Float32Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
      ]);
    
    // boolean that represents if the material should be adjusted 
    adjustSurface = false;

    /**
     * Creates a new CS336Materials based on type, as well a respective
     * texture. Properties set here are used by models when rendering.
     * @param {String} type solid, 2D, or cube
     */
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

    /**
     * Sets the surface color of the material.
     * @param {Float[]} newColor color given as [r, g, b, a]
     */
    setColor(newColor){
        this.color = newColor;
    }

    /**
     * Sets the surface attributes of the material.
     * @param {Float32Array} newSurfaceAttributes given as 9 element array of floats
     * representing the ambient, diffuse, and specular surface attributes
     */
    setSurfaceAttributes(newSurfaceAttributes){
        this.surfaceAttributes = newSurfaceAttributes;
    }

    /**
     * Creates a 2D texture and loads it into a buffer.
     * @param {String} filePath path to the image file
     */
    async create2DTexture(filePath){
        this.textureAttributes = new CS336Texture("2D");
        this.textureAttributes.imagePaths = filePath;
        await this.textureAttributes.loadImage();
        await this.textureAttributes.createAndLoad();
    }

    /**
     * Creates a cube texture and loads it into a buffer.
     * @param {String[]} filePaths paths to the image files
     * in the order of +x, -x, +y, -y, +z, -z
     */
    async createTextureCube(filePaths){
        this.textureAttributes = new CS336Texture("cube");
        this.textureAttributes.imagePaths = filePaths;
        await this.textureAttributes.loadImage();
        await this.textureAttributes.createAndLoad();
    }

}