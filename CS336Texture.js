/*
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
    

    // type can be either "2D" or "cube"
    constructor(type, vertices){
        this.type = type;
        this.vertices = vertices;
        if (this.type === "2D"){
            this.textureType = "sampler2D";
            this.textureLoader = "texture2D";
            this.imagePaths = "";
        }
        else {
            this.textureType = "samplerCube";
            this.textureLoader = "textureCube";
            this.imagePaths = [];
        }
    }

    async loadImage(){
        // only load the image once
        if (!this.loadedImage){
            if (this.type === "2D"){
                this.images = await loadImagePromise(this.imagePaths);
                this.loadedImage = true;
            }
            else {
                this.images = [];
                for (let i = 0; i < this.imagePaths.length; ++i)
                {
                    this.images[i] = await loadImagePromise(this.imagePaths[i]);
                }
            }
        }
        this.loadedImage = true;
    }

    async createAndLoad(){
        // only load the buffer once 
        if (!this.loadedBuffer){
            if (this.type === "2D"){
                this.textureHandler = await createAndLoadTexture(this.images);
            }
            else {
                this.textureHandler = await createAndLoadCubeTexture(this.images);
            }
        }
        this.loadedBuffer = true;
    }

    getTextureHandle(){
        return this.textureHandler;
    }
    
}