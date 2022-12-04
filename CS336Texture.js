class CS336Texture { // THREE materials
    images = null;
    textureHandler = null;
    texture_type = null;
    texture_loader = null;
    imagePaths = null;
    loaded_image = false;
    loaded_buffer = false;

    vertices = null;
    // solid vs not solid
    

    // type can be either "2D" or "cube"
    constructor(type, vertices){
        this.type = type;
        this.vertices = vertices;
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
        if (this.loaded_image === false){
            if (this.type === "2D"){
                console.log("***** tetxure");
                console.log(this.loaded_image);
                console.log(this.imagePaths);
                this.images = await loadImagePromise(this.imagePaths);
                this.loaded_image = true;
            }
            else {
                this.images = [];
                for (let i = 0; i < this.imagePaths.length; ++i)
                {
                this.images[i] = await loadImagePromise(this.imagePaths[i]);
                }
            }
        }
        this.loaded_image = true;
    }

    async createAndLoad(){
        if (!this.loaded_buffer){
            if (this.type === "2D"){
                this.textureHandler = createAndLoadTexture(this.images);
            }
            else {
                this.textureHandler = createAndLoadCubeTexture(this.images);
            }
        }
        this.loaded_buffer = true;
    }

    get textureHandle(){
        return this.textureHandler;
    }
    
}