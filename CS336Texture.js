/**
 * This class holds all texture information inlcuding image path(s),
 * methods to create and load the texture information into buffers,
 * the texture coordinates or vertices, and the texture handler it creates. 
 */
class CS336Texture { // THREE materials
    images = null;
    textureHandler = null;
    textureType = null;
    textureLoader = null;
    imagePaths = null;
    loadedImage = false;
    loadedBuffer = false;

    vertices = null;
    // solid vs not solid
    

    /**
     * Creates and sets up a new CS336Texture based on type.
     * Can be solid, 2D, or cube.
     * @param {String} type 
     * @param {Float32Array} vertices 
     */
    constructor(type, vertices){
        this.type = type;
        this.vertices = vertices;
        if(this.type === "2D") {
            this.textureType = "sampler2D";
            this.textureLoader = "texture2D";
            this.imagePaths = "";
        } else {
            this.textureType = "samplerCube";
            this.textureLoader = "textureCube";
            this.imagePaths = [];
        }
    }

    /**
     * Loads image(s) to be passed to the texture.
     */
    async loadImage(){
        // only load the image once
        if(!this.loadedImage) {
            if(this.type === "2D") {
                this.images = await loadImagePromise(this.imagePaths);
                this.loadedImage = true;
            } else {
                this.images = [];
                for(let i = 0; i < this.imagePaths.length; ++i) {
                    this.images[i] = await loadImagePromise(this.imagePaths[i]);
                }
            }
        }
        this.loadedImage = true;
    }

    /**
     * Creates and loads the texture into a buffer.
     */
    async createAndLoad() {
        // only load the buffer once 
        if(!this.loadedBuffer) {
            if(this.type === "2D") {
                this.textureHandler = await createAndLoadTexture(this.images);
            } else {
                this.textureHandler = await createAndLoadCubeTexture(this.images);
            }
        }
        this.loadedBuffer = true;
    }

    /**
     * Get the texture handler.
     * @returns {WebGLTexture}
     */
    getTextureHandle() {
        return this.textureHandler;
    }
    
}