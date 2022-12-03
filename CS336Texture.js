class CS336Texture { // THREE materials
    images = null;
    textureHandler = null;
    texture_type = null;
    texture_loader = null;
    imagePaths = null;
    loaded = false;

    // solid vs not solid
    

    // type can be either "2D" or "cube"
    constructor(type){
        this.type = type;
        if (this.type === "2D"){
            this.texture_type = "sampler2D";
            this.texture_loader = "texture2D";
            this.imagePaths = "";
        }
        else {
            this.texture_type = "samplerCube";
            this.texture_loader = "textureCube";
            this.imagePaths = [];
        }
    }

    get uniformTextureDeclaration(){
        return "uniform " + this.texture_type + " sampler;";
    }

    async loadImage(){
        if (!this.loaded){
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
    }

    async createAndLoad(){
        if (!this.loaded){
            if (this.type === "2D"){
                this.textureHandler = await createAndLoadTexture(this.images);
            }
            else {
                this.textureHandler = await createAndLoadCubeTexture(this.images);
            }
        }
    }

    get textureHandle(){
        return this.textureHandler;
    }
    
}