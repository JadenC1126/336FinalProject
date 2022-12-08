var CS336Model = function({
    draw,
    modelProperties,
    materialProperties,
} = {
    draw: false,
    modelProperties: null,
    materialProperties: null,
}) {
    CS336Object.call(this);
    this.draw = draw;
    this.modelProperties = modelProperties;
    this.materialProperties = materialProperties;

    this.shaderAttributes = {
        lastLightCount: 0,
        shaderProgram: null,
    }
}

CS336Model.prototype = Object.create(CS336Object.prototype);

CS336Model.prototype.loadModelBuffers = function() {
    if( !this.modelProperties ) return;

    const {
        numVertices,
        vertices,
        normals,
        vertexNormals,
        texCoords,
    } = this.modelProperties;

    let color = this.materialProperties.color;
    console.log("here");
    console.log(this.materialProperties);
    let colors = [];
    for( let i = 0; i < numVertices; i++ ) {
        colors.push(color[0], color[1], color[2], color[3]);
    }
    let texCoords1 = [];
    for (let i = 0; i < 86402/10; i++){
        texCoords1.push(
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0);
    }

    const vertexBuffer = createAndLoadBuffer(vertices);
    const normalBuffer = createAndLoadBuffer(normals);
    const vertexNormalBuffer = createAndLoadBuffer(vertexNormals);
    let texCoordBuffer = null;
    let colorBuffer = null;

    if( this.materialProperties.texture2D || this.materialProperties.textureCube ) {
        texCoordBuffer = createAndLoadBuffer(new Float32Array(texCoords1));
    }
    if (this.materialProperties.solid){
        colorBuffer = createAndLoadBuffer(new Float32Array(colors));
    }
    console.log("there");
    this.modelProperties.buffers = {
        vertexBuffer,
        normalBuffer,
        vertexNormalBuffer,
        texCoordBuffer,
        colorBuffer,
    }
}

CS336Model.prototype.render = async function(gl, worldMatrix, lights, camera) {
    const world = new THREE.Matrix4().copy(worldMatrix).multiply(this.getMatrix());

    if( this.draw ) await this.renderSelf(gl, world, lights, camera);
    
    for( let i = 0; i < this.children.length; i++ ) {
        this.children[i].render(gl, world, lights, camera);
    }
}

CS336Model.prototype.renderSelf = async function(gl, worldMatrix, lights, camera) {
    // Pull or load texture if applicable

    if ((this.materialProperties.texture2D || this.materialProperties.textureCube) && !this.materialProperties.textureAttributes.loadedImage){
        await this.materialProperties.textureAttributes.loadImage();
    }

    const { lastLightCount } = this.shaderAttributes;
    if( lastLightCount !== lights.length || this.shaderAttributes.shaderProgram == null ) {
        this.shaderAttributes = {
            lastLightCount: lights.length,
            shaderProgram: createShaderProgram(gl, this.createVertexShader(lights.length), this.createFragmentShader(lights.length)),
        }
    }
    const { shaderProgram } = this.shaderAttributes;

    gl.useProgram(shaderProgram);

    const positionIndex = gl.getAttribLocation(shaderProgram, "a_Position");
    if( positionIndex < 0 ) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }
    const normalIndex = gl.getAttribLocation(shaderProgram, "a_Normal");
    if( normalIndex < 0 ) {
        console.log("Failed to get the storage location of a_Normal");
        return;
    }
    let texCoordIndex = null;
    let colorIndex = null;
    if( this.materialProperties.texture2D) {
        texCoordIndex = gl.getAttribLocation(shaderProgram, "a_TexCoord");
        if( texCoordIndex < 0 ) {
            console.log("Failed to get the storage location of a_TexCoord");
            return;
        }
    }
    if (this.materialProperties.solid){
        colorIndex = gl.getAttribLocation(shaderProgram, "a_Color");
        if( colorIndex < 0 ) {
            console.log("Failed to get the storage location of a_Color");
            return;
        }
    }

    // enable all vertex attributes that will be needed  
    gl.enableVertexAttribArray(positionIndex);
    gl.enableVertexAttribArray(normalIndex);
    if( texCoordIndex >= 0 ) gl.enableVertexAttribArray(texCoordIndex);
    if ( colorIndex >= 0 ) gl.enableVertexAttribArray(colorIndex);

    // grab the buffers that were created and filled with data in the loadModelBuffers() method
    const {
        vertexBuffer,
        normalBuffer,
        vertexNormalBuffer,
        texCoordBuffer,
        colorBuffer,
    } = this.modelProperties.buffers;

    let textureHandle = null;
    // bind and instantiate the atteibutes that are being declared in the shader
    if( texCoordIndex >= 0 ) {
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
    }
    if ( colorIndex >= 0 ){
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
    }

    // create and load the texture material if the materials object has a texture
    if ( this.materialProperties.texture2D || this.materialProperties.textureCube ){
        if( !this.materialProperties.textureAttributes.loadedBuffer )
            await this.materialProperties.textureAttributes.createAndLoad();
        // grab the texture handle from the material's texture once the texture has been created and loaded 
        textureHandle = this.materialProperties.textureAttributes.textureHandler;
    }

    // "bind" the buffer as the current array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    // get the projection from the camera object
    const projection = camera.getProjection();
    // get the view from the camera object 
    const view = camera.getView();

    let loc = gl.getUniformLocation(shaderProgram, "model");
    gl.uniformMatrix4fv(loc, false, worldMatrix.elements);
    loc = gl.getUniformLocation(shaderProgram, "view");
    gl.uniformMatrix4fv(loc, false, view.elements);
    loc = gl.getUniformLocation(shaderProgram, "projection");
    gl.uniformMatrix4fv(loc, false, projection.elements);
    loc = gl.getUniformLocation(shaderProgram, "normalMatrix");
    gl.uniformMatrix3fv(loc, false, makeNormalMatrixElements(worldMatrix, view));

    lights.forEach((light, i) => {
        loc = gl.getUniformLocation(shaderProgram, `lightPosition[${i}]`);
        gl.uniform4f(loc, light.position.x, light.position.y, light.position.z, 1.0);
    })
    lights.forEach((light, i) => {
        loc = gl.getUniformLocation(shaderProgram, `lightProperties[${i}]`);
        gl.uniformMatrix3fv(loc, false, light.getLightProperties());
    })

    if( this.materialProperties.adjustSurface ) {
        const surfaceAttributes = this.materialProperties.surfaceAttributes;
        if( surfaceAttributes ) {
            loc = gl.getUniformLocation(shaderProgram, "materialProperties");
            gl.uniformMatrix3fv(loc, false, surfaceAttributes);
        }
    }

    // instantiate the 2D texture 
    if (this.materialProperties.texture2D){
        var textureUnit = 1;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        // bind the texture to the texture handle created by the models's texture 
        gl.bindTexture(gl.TEXTURE_2D, textureHandle);
        // grab the uniform location from the shader and set it 
        let loc2 = gl.getUniformLocation(shaderProgram, "u_Sampler");
        gl.uniform1i(loc2, textureUnit);
    }
    // instantiate the texture cube
    else if (this.materialProperties.textureCube){
        var textureUnit = 1;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        // bind the texture to the texture handle created by the model's texture 
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureHandle);
        // grab the uniform location from the shader and set it
        var loc2 = gl.getUniformLocation(shaderProgram, "u_Sampler");
        gl.uniform1i(loc2, textureUnit);
    }

    // draw the current model
    gl.drawArrays(gl.TRIANGLES, 0, this.modelProperties.numVertices);

    // disable all vertex attributes that were enabled 
    gl.disableVertexAttribArray(positionIndex);
    gl.disableVertexAttribArray(normalIndex);
    if( texCoordIndex >= 0 ) gl.disableVertexAttribArray(texCoordIndex);
    if ( colorIndex >= 0 ) gl.disableVertexAttribArray(colorIndex);

    gl.useProgram(null);
}
/*
 * Method that creates the vertex shader on the fly.
 * It declares all attributes and varying variables
 * needed to create the texture or solid color. 
*/
CS336Model.prototype.createVertexShader = function(lightCount) {
    return `
        precision mediump float;
        // declare light count if there are any lights in the scene 
        ${lightCount > 0 ? `#define MAX_LIGHTS ${lightCount}` : ''}
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        uniform mat3 normalMatrix;
        // declare attribute and varying variable for solid color, if applicable 
        ${this.materialProperties.solid ? 'attribute vec4 a_Color;': ''}
        ${this.materialProperties.solid ? 'varying vec4 color;': ''}

        // declare light position with the number of lights, if applicable 
        ${lightCount > 0 ? 'uniform vec4 lightPosition[MAX_LIGHTS];' : ''}
        attribute vec4 a_Position;
        attribute vec3 a_Normal;
        ${lightCount > 0 ? 'varying vec3 fL[MAX_LIGHTS];' : ''}
        varying vec3 fN;
        varying vec3 fV;
        // declare attribute and varying variable for 2D texture 
        ${this.materialProperties.texture2D ? 'attribute vec2 a_TexCoord;':''}
        ${this.materialProperties.texture2D ? 'varying vec2 fTexCoord;':''}

        // declare varying variable for the texture cube 
        ${this.materialProperties.textureCube ? 'varying vec3 fTexVector;':''}

        void main() {
            vec4 posEye = view * model * a_Position;
            fN = normalMatrix * a_Normal;
            fV = normalize(-(posEye).xyz);

            // set the solid color to the color passed into the model (default is red)
            ${this.materialProperties.solid ? 'color = a_Color;': ''}

            // set the 2D texture coord to the declared attribute, if applicable 
            ${this.materialProperties.texture2D ? 'fTexCoord = a_TexCoord;':''}

            // set the texture vector to the current vertex position if creating a texture cube
            ${this.materialProperties.textureCube ? 'fTexVector = a_Position.xyz;':''}
            ${lightCount > 0 ?
                `
                    for( int i = 0; i < MAX_LIGHTS; i++ ) {
                        vec4 lightEye = view * lightPosition[i];
                        fL[i] = (lightEye - posEye).xyz;
                    }
                ` : '' 
            }
            gl_Position = projection * view * model * a_Position;
        }
    `;
}

/*
 * Method that creates the fragment shader on the fly.
 * It takes into account the number of lights in a scene 
 * and recalculates the light only when the number of 
 * lights changes in a scene, or the ambient, diffuse or 
 * specular changes.
*/
CS336Model.prototype.createFragmentShader = function(lightCount) {
    return `
        // define the number of lights as a constant
        ${lightCount > 0 ? `#define MAX_LIGHTS ${lightCount}` : ''}
        precision mediump float;
        // define the light properties with the light count if there are lights in the scene
        ${lightCount > 0 ? 'uniform mat3 lightProperties[MAX_LIGHTS];' : ''}
        // account for adjusting the surface of the model if set to true
        ${this.materialProperties.adjustSurface ? 'uniform mat3 materialProperties;' : ''}
        
        ${this.materialProperties.texture_2d ? 'uniform sampler2D u_Sampler;' : ''}
        ${this.materialProperties.texture_cube ? 'uniform samplerCube u_Sampler;' : ''}
        ${this.materialProperties.solid ? 'varying vec4 color;': ''}
        
        ${lightCount > 0 ? 'varying vec3 fL[MAX_LIGHTS];' : ''}
        varying vec3 fN;
        varying vec3 fV;
        // declares the varying variable for the type of texture you are trying to add to the model, if any 
        ${this.materialProperties.texture_2d ? 'varying vec2 fTexCoord;': ''}
        ${this.materialProperties.texture_cube ? 'varying vec3 fTexVector;': ''}

        // calculate the light contributions depending on the light properties 
        vec4 getLightContribution(vec3 fL, mat3 lightProps, vec3 N, vec3 V) {
            vec3 L = normalize(fL);
            vec3 R = reflect(-L, N);
            mat3 products = matrixCompMult(lightProps, materialProperties);
            vec4 ambient = vec4(products[0], 1.0);
            vec4 diffuse = vec4(products[1], 1.0);
            vec4 specular = vec4(products[2], 1.0);
            float diffuseFactor = max(dot(L, N), 0.0);
            float specularFactor = pow(max(dot(V, R), 0.0), 20.0);
            return ambient + diffuse * diffuseFactor + specular * specularFactor;
        }
        void main() {
            vec3 N = normalize(fN);
            vec3 V = normalize(fV);
            vec4 tmpColor = ${
                this.materialProperties.solid ? 'color;' :
                this.materialProperties.texture_2d ? 'texture2D(u_Sampler, fTexCoord);' :
                this.materialProperties.texture_cube ?  'textureCube(u_Sampler, fTexVector);' :
                'vec4(0.0, 0.0, 0.0, 1.0);'
            }
            ${lightCount > 0 ?
                `for( int i = 0; i < MAX_LIGHTS; i++ ) {
                    tmpColor += getLightContribution(fL[i], lightProperties[i], N, V);
                }` : ''
            }
            gl_FragColor = tmpColor ${lightCount > 0 ? '/ float(MAX_LIGHTS)' : ''};
            gl_FragColor.a = 1.0;
        }
    `;
}