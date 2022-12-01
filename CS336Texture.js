import "./util/cs336util.js";


class CS336Texture {
    images = null;
    textureHandle = null;

    // type can be either "2D" or "cube"
    constructor(type){
        this.type = type;
        if (this.type === "2D"){
            this.texture_type = "sampler2D";
            this.texture_loader = texture2D;
            this.imagePaths = "";
        }
        else {
            this.texture_type = "samplerCube";
            this.texture_loader = textureCube;
            this.imagePaths = [];
        }
    }

    get uniformTextureDeclaration(){
        return "uniform " + this.texture_type + " sampler;";
    }

    async loadImage(){
        if (this.type === "2D"){
            this.images = await loadImagePromise(this.imagePaths);
        }
        else {
            this.images = [];
            for (let i = 0; i < this.imagePaths.length; ++i)
            {
              this.images[i] = await loadImagePromise(this.imagePaths[i]);
            }
        }
        
    }

    async createAndLoad(){
        if (this.type === "2D"){
            this.textureHandle = createAndLoadTexture(this.images);
        }
        else {
            this.textureHandle = createAndLoadCubeTexture(this.images);
        }
        
    }

    get textureHandle(){
        return this.textureHandle;
    }
    
}