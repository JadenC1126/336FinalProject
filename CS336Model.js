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
    let colors = [];
    for( let i = 0; i < numVertices; i++ ) {
        colors.push(color[0], color[1], color[2], color[3]);
    }

    const vertexBuffer = createAndLoadBuffer(vertices);
    const normalBuffer = createAndLoadBuffer(normals);
    const vertexNormalBuffer = createAndLoadBuffer(vertexNormals);
    let texCoordBuffer = null;
    let colorBuffer = null;

    if( this.materialProperties.texture_2d || this.materialProperties.texture_cube ) {
        texCoordBuffer = createAndLoadBuffer(texCoords);
    }
    if (this.materialProperties.solid){
        colorBuffer = createAndLoadBuffer(new Float32Array(colors));
    }

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
        await this.children[i].render(gl, world, lights, camera);
    }
}

CS336Model.prototype.renderSelf = async function(gl, worldMatrix, lights, camera) {
    // Pull or load texture if applicable

    let { shaderProgram, lastLightCount } = this.shaderAttributes;
    if( shaderProgram === null || lastLightCount !== lights.length ) {
        this.shaderAttributes = {
            lastLightCount: lights.length,
            shaderProgram: createShaderProgram(gl, this.createVertexShader(lights.length), this.createFragmentShader(lights.length)),
        }
    }
    shaderProgram = this.shaderAttributes.shaderProgram;

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
    if( this.materialProperties.texture_2d || this.materialProperties.texture_cube ) {
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

    gl.enableVertexAttribArray(positionIndex);
    gl.enableVertexAttribArray(normalIndex);
    if( texCoordIndex >= 0 ) gl.enableVertexAttribArray(texCoordIndex);
    if ( colorIndex >= 0 ) gl.enableVertexAttribArray(colorIndex);

    const {
        vertexBuffer,
        normalBuffer,
        vertexNormalBuffer,
        texCoordBuffer,
        colorBuffer,
    } = this.modelProperties.buffers;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
    if( texCoordIndex >= 0 ) {
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
    }
    if ( colorIndex >= 0 ){
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
    }

    const projection = camera.getProjection();
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

    if( this.materialProperties.adjust_surface ) {
        const surfaceAttributes = this.materialProperties.surfaceAttributes;
        if( surfaceAttributes ) {
            loc = gl.getUniformLocation(shaderProgram, "materialProperties");
            gl.uniformMatrix3fv(loc, false, surfaceAttributes);
        }
    }

    gl.drawArrays(gl.TRIANGLES, 0, this.modelProperties.numVertices);

    gl.disableVertexAttribArray(positionIndex);
    gl.disableVertexAttribArray(normalIndex);
    if( texCoordIndex >= 0 ) gl.disableVertexAttribArray(texCoordIndex);
    if ( colorIndex >= 0 ) gl.disableVertexAttribArray(colorIndex);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.useProgram(null);
}

CS336Model.prototype.createVertexShader = function(lightCount) {
    return `
        precision mediump float;
        ${lightCount > 0 ? `#define MAX_LIGHTS ${lightCount}` : ''}
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        uniform mat3 normalMatrix;
        ${this.materialProperties.solid ? 'attribute vec4 a_Color;': ''}
        ${this.materialProperties.solid ? 'varying vec4 color;': ''}

        ${lightCount > 0 ? 'uniform vec4 lightPosition[MAX_LIGHTS];' : ''}
        attribute vec4 a_Position;
        attribute vec3 a_Normal;
        ${lightCount > 0 ? 'varying vec3 fL[MAX_LIGHTS];' : ''}
        varying vec3 fN;
        varying vec3 fV;
        // TODO: texture coordinates
        ${this.materialProperties.texture_2d || this.materialProperties.texture_cube ? 'attribute vec2 a_TexCoord;':''}
        ${this.materialProperties.texture_2d || this.materialProperties.texture_cube ? 'varying vec2 fTexCoord;':''}
        void main() {
            vec4 posEye = view * model * a_Position;
            fN = normalMatrix * a_Normal;
            fV = normalize(-(posEye).xyz);
            ${this.materialProperties.solid ? 'color = a_Color;': ''}
            ${this.materialProperties.texture_2d || this.materialProperties.texture_cube ? 'fTexCoord = a_TexCoord;':''}

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

CS336Model.prototype.createFragmentShader = function(lightCount) {
    return `
        ${lightCount > 0 ? `#define MAX_LIGHTS ${lightCount}` : ''}
        precision mediump float;
        ${lightCount > 0 ? 'uniform mat3 lightProperties[MAX_LIGHTS];' : ''}
        // Force this exist when lights are used?
        ${this.materialProperties && this.materialProperties.adjust_surface ? 'uniform mat3 materialProperties;' : ''}
        ${this.materialProperties && this.materialProperties.texture_2d ? 'uniform sampler2D u_Sampler;' : ''}
        ${this.materialProperties && this.materialProperties.texture_cube ? 'uniform samplerCube u_Sampler;' : ''}
        ${this.materialProperties.solid ? 'varying vec4 color;': ''}
        
        ${lightCount > 0 ? 'varying vec3 fL[MAX_LIGHTS];' : ''}

        varying vec3 fN;
        varying vec3 fV;
        // TODO: texture coordinates

        ${this.materialProperties.texture_2d || this.materialProperties.texture_cube ? 'varying vec2 fTexCoord;': ''}

        vec4 getLightContribution(vec3 fL, mat3 lightProps, vec3 N, vec3 V) {
            vec3 L = normalize(fL);
            vec3 R = reflect(-L, N);
            mat3 products = matrixCompMult(lightProps, materialProperties);
            vec4 ambient = vec4(products[0], 1.0);
            vec4 diffuse = vec4(products[1], 1.0);
            vec4 specular = vec4(products[2], 1.0);
            // TODO: account for textures
            float diffuseFactor = max(dot(L, N), 0.0);
            // replace matProps[2][2] with shininess?
            float specularFactor = pow(max(dot(R, V), 0.0), 5.0);
            return ambient + diffuse * diffuseFactor + specular * specularFactor;
        }
        void main() {
            vec3 N = normalize(fN);
            vec3 V = normalize(fV);
            vec4 tmpColor = ${this.materialProperties.solid ? 'color' : 'vec4(0.0, 0.0, 0.0, 1.0)'};
            ${lightCount > 0 ?
                `
                    for( int i = 0; i < MAX_LIGHTS; i++ ) {
                        tmpColor += getLightContribution(fL[i], lightProperties[i], N, V);
                    }
                ` : '// some color based on texture without light'
            }
            gl_FragColor = tmpColor ${lightCount > 0 ? '/ float(MAX_LIGHTS)' : ''};
            gl_FragColor.a = 1.0;
        }
    `;
}

 // helper function renders the cube based on the given model transformation
 CS336Model.prototype.drawCube = function(matrix)
{
	  // bind the shader
	  gl.useProgram(lightingShader);

	  // get the index for the a_Position attribute defined in the vertex shader
	  var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
	  if (positionIndex < 0) {
	    console.log('Failed to get the storage location of a_Position');
	    return;
	  }

	  var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
	  if (normalIndex < 0) {
		    console.log('Failed to get the storage location of a_Normal');
		    return;
		  }

	  // "enable" the a_position attribute
	  gl.enableVertexAttribArray(positionIndex);
	  gl.enableVertexAttribArray(normalIndex);

	  // bind data for points and normals
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);

	  var loc = gl.getUniformLocation(lightingShader, "view");
	  gl.uniformMatrix4fv(loc, false, view.elements);
	  loc = gl.getUniformLocation(lightingShader, "projection");
	  gl.uniformMatrix4fv(loc, false, projection.elements);
	  loc = gl.getUniformLocation(lightingShader, "u_Color");
	  gl.uniform4f(loc, 0.0, 1.0, 0.0, 1.0);
    var loc = gl.getUniformLocation(lightingShader, "lightPosition");
    gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

	  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
	  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

	  gl.uniformMatrix4fv(modelMatrixloc, false, matrix.elements);
	  gl.uniformMatrix3fv(normalMatrixLoc, false, makeNormalMatrixElements(matrix, view));

	  gl.drawArrays(gl.TRIANGLES, 0, 36);

	  gl.useProgram(null);
}