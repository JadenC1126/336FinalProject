/*
 * This class extends CS336Object to include all of the movement 
 * functionality. 
 * @param draw: boolean for if you want the object to be drawn in the 
 * scene, or if you want it to be a dummy object.
 * @param modelProperties: add model properties to create any type of model 
 * @param materialPropeties: specify what type of lights, how they
 * should interact with the model 
*/ 
var CS336Model = function({
    draw,
    modelProperties,
    materialProperties,
} = {
    draw: false, // false for a dummy object
    modelProperties: null, // THREE.js model 
    materialProperties: null, // CS336Material object
}) {
    CS336Object.call(this);
    this.draw = draw;
    this.modelProperties = modelProperties;
    this.materialProperties = materialProperties;

    // by default the model has no lights 
    this.shaderAttributes = {
        lastLightCount: 0,
        shaderProgram: null,
    }
}

CS336Model.prototype = Object.create(CS336Object.prototype);

CS336Model.prototype.loadModelBuffers = function() {
    // if there is no model, dont continue trying to load 
    if( !this.modelProperties ) {
        console.log("ModelProperties is not defined. Define a THREE.js model and try again.")
        return;
    }

    // get the vertices and vertex normals from the THREE.js model
    const {
        numVertices,
        vertices,
        vertexNormals,
    } = this.modelProperties;

    let color = this.materialProperties.color;

    // create an rgba for each vertex
    let colors = [];
    for( let i = 0; i < numVertices; i++ ) {
        colors.push(color[0], color[1], color[2], color[3]);
    }
    // create the texture coordinates for the number of vertices in the model
    let texCoords1 = [];
    for (let i = 0; i < numVertices; i++){
        texCoords1.push(
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0);
    }

    // load the buffer with vertex information
    const vertexBuffer = createAndLoadBuffer(vertices);
    // load the normal buffer
    const vertexNormalBuffer = createAndLoadBuffer(vertexNormals);

    let texCoordBuffer = null;
    let colorBuffer = null;
    // load texture coordinates if the model has a texture
    if( this.materialProperties.texture2D || this.materialProperties.textureCube ) {
        texCoordBuffer = createAndLoadBuffer(new Float32Array(texCoords1));
    }
    // load the color buffer if the model has a solid color
    if (this.materialProperties.solid){
        colorBuffer = createAndLoadBuffer(new Float32Array(colors));
    }

    // store the loaded buffers for the render method
    this.modelProperties.buffers = {
        vertexBuffer,
        vertexNormalBuffer,
        texCoordBuffer,
        colorBuffer,
    }
}

CS336Model.prototype.render = async function(gl, worldMatrix, lights, camera) {
    const world = new THREE.Matrix4().copy(worldMatrix).multiply(this.getMatrix());

    // if the model is not a dummy object, it will call renderSelf
    if( this.draw ) await this.renderSelf(gl, world, lights, camera);
    
    for( let i = 0; i < this.children.length; i++ ) {
        this.children[i].render(gl, world, lights, camera);
    }
}

CS336Model.prototype.renderSelf = async function(gl, worldMatrix, lights, camera) {
    // Pull or load texture if applicable

    const { lastLightCount } = this.shaderAttributes;
    if( lastLightCount !== lights.length || this.shaderAttributes.shaderProgram == null ) {
        this.shaderAttributes = {
            lastLightCount: lights.length,
            shaderProgram: createShaderProgram(gl, this.createVertexShader(lights.length), this.createFragmentShader(lights.length)),
        }
    }
    const { shaderProgram } = this.shaderAttributes;

    gl.useProgram(shaderProgram);

    // grab the attribute location represnting the model's position
    const positionIndex = gl.getAttribLocation(shaderProgram, "a_Position");
    if( positionIndex < 0 ) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }
    // grab the attribute location represnting the model's normal 
    const normalIndex = gl.getAttribLocation(shaderProgram, "a_Normal");
    if( normalIndex < 0 ) {
        console.log("Failed to get the storage location of a_Normal");
        return;
    }

    let texCoordIndex = null;
    let colorIndex = null;
    // if the texture is 2D, grad the location of the attribute
    // representing the texture coordinate
    if( this.materialProperties.texture2D) {
        texCoordIndex = gl.getAttribLocation(shaderProgram, "a_TexCoord");
        if( texCoordIndex < 0 ) {
            console.log("Failed to get the storage location of a_TexCoord");
            return;
        }
    }
    // if this model has a solid texture, grab the color attribute location
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

    // grab the buffers that were created and filled with data 
    // in the loadModelBuffers() method
    const {
        vertexBuffer,
        vertexNormalBuffer,
        texCoordBuffer,
        colorBuffer,
    } = this.modelProperties.buffers;

    // bind and instantiate the atteibutes that are being declared in the shader
    if( texCoordIndex >= 0 ) {
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
    }
    if ( colorIndex >= 0 ){
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
    }

    // "bind" the buffer as the current array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    // "bind" the buffer as the current array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
    // unbind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    // get the projection from the camera object
    const projection = camera.getProjection();
    // get the view from the camera object 
    const view = camera.getView();

    // grab location of the uniform variables then
    // set the uniform variable through the bounded location
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

    // set the materialProperties if the model wants its surface adjusted 
    // depending on the light
    if( this.materialProperties.adjustSurface ) {
        const surfaceAttributes = this.materialProperties.surfaceAttributes;
        if( surfaceAttributes ) {
            // grab the uniform location of the materialProperties and set it
            loc = gl.getUniformLocation(shaderProgram, "materialProperties");
            gl.uniformMatrix3fv(loc, false, surfaceAttributes);
        }
    }

    // instantiate the 2D texture 
    if (this.materialProperties.texture2D){
        var textureUnit = 1;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        // bind the texture to the texture handle created by the models's texture 
        gl.bindTexture(gl.TEXTURE_2D, this.materialProperties.textureAttributes.textureHandler);
        // grab the uniform location from the shader and set it 
        let loc2 = gl.getUniformLocation(shaderProgram, "u_Sampler");
        gl.uniform1i(loc2, textureUnit);
    }
    // instantiate the texture cube
    else if (this.materialProperties.textureCube){
        var textureUnit = 1;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        // bind the texture to the texture handle created by the model's texture 
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.materialProperties.textureAttributes.textureHandler);
        // create the mipmap for the texture cube
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
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
        
        ${this.materialProperties.texture2D ? 'uniform sampler2D u_Sampler;' : ''}
        ${this.materialProperties.textureCube ? 'uniform samplerCube u_Sampler;' : ''}
        ${this.materialProperties.solid ? 'varying vec4 color;': ''}
        
        ${lightCount > 0 ? 'varying vec3 fL[MAX_LIGHTS];' : ''}
        varying vec3 fN;
        varying vec3 fV;
        // declares the varying variable for the type of texture you are trying to add to the model, if any 
        ${this.materialProperties.texture2D ? 'varying vec2 fTexCoord;': ''}
        ${this.materialProperties.textureCube ? 'varying vec3 fTexVector;': ''}

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
                this.materialProperties.texture2D ? 'texture2D(u_Sampler, fTexCoord);' :
                this.materialProperties.textureCube ?  'textureCube(u_Sampler, fTexVector);' :
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