

/**
 * Encapsulation of scale, rotation, and position of a 3D object.
 * The object's transformation matrix is defined as the product of
 * three transformations based on position * rotation * scale. Each object
 * has a list of child objects and a hook, drawFunction, for rendering the
 * object and then recursively rendering all the child objects.
 */
var CS336Object = function({ drawObject, light, texture, model, textureObj} = { drawObject: false, light: false, texture: false, model: null , textureObj: new CS336Texture("2D")}) // default values
 {
   // children of this object
   this.children = [];
 
   // Signify if we need to draw this object or not
   this.drawObject = true;

   // signify if this is a light source 
   this.light = light || false;

   // Texture to draw with, default is texture 2D
   this.texture = texture;

   // texture object
   this.textureObject = textureObj;

   // Model texture
   this.modelTexture = null;
 
   // Position of this object.
   this.position = new THREE.Vector3();

   // function to draw itself 
  //  this.drawSelf = drawCube();
 
   // Rotation matrix.
   // The three columns of this matrix are the x, y, and z axes
   // of the object's current frame
   this.rotation = new THREE.Matrix4();
 
   // Scale for this object.
   this.scale = new THREE.Vector3(1, 1, 1);
 
   // The object's current transformation, to be calculated
   // as translate * rotate * scale.  Note that the matrix is saved
   // on call to getMatrix, to avoid recalculation at every frame unless needed.
   // Be sure to set the matrixNeedsUpdate flag whenever position, rotation, or
   // scale is changed.
   this.matrix = null;
   this.matrixNeedsUpdate = true;

   // Shader attributes
   this.shaderAttributes = {
      lastLightCount: null,
      shaderProgram: null,
   }

   /**
    return {
      numVertices: count,
      vertices: verticesArray,
      normals: normalsArray,
      vertexNormals: vertexNormalsArray,
      texCoords: texCoordArray
    }
    */
   this.modelAttributes = model ? { ...model } : null;
  //  this.modelBuffers = loadModelBuffers();
 };

 CS336Object.prototype.loadModelBuffers = function() {
    if (!this.modelAttributes) {
      return;
    }

    const {
      vertices,
      normals,
      vertexNormals,
      texCoords,
    } = this.modelAttributes;

    const vertexBuffer = createAndLoadBuffer(vertices);
    const faceNormalBuffer = createAndLoadBuffer(normals);
    const vertexNormalBuffer = createAndLoadBuffer(vertexNormals);
    const texCoordBuffer = createAndLoadBuffer(texCoords);

    this.modelBuffers = {
      vertexBuffer,
      faceNormalBuffer,
      vertexNormalBuffer,
      texCoordBuffer,
    }
 }
 
 /**
  * Adds the given CS336Object to this object's list of children.
  * @param child
  */
 CS336Object.prototype.addChild = function(child)
 {
   this.children.push(child);
 };

 // helper function renders the cube based on the given model transformation
 CS336Object.prototype.drawCube = function(matrix)
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
 
 /**
  * Renders this object using the drawObject callback function and recursing
  * through the children.
  * @param gl
  *   The WebGL context
  * @param worldMatrix
  *   frame transformation for this object's parent
  * @param lightCount
  *  number of lights in the scene
  */
 CS336Object.prototype.render = async function(gl, worldMatrix, lights, camera)
 {
   // clone and update the world matrix
  //  console.log("******");
   var current = new THREE.Matrix4().copy(worldMatrix).multiply(this.getMatrix());
 
   // render if we want to draw this object
  //  console.log(this.drawObject);
   if (this.drawObject) await this.renderSelf(gl, current, lights, camera);
 
   // recurse through children, who will use the current matrix
   // as their "world"
  //  for (var i = 0; i < this.children.length; ++i) {
  //    await this.children[i].render(gl, current, lights, camera);
  //  }
 };

 /**
  * Render the current object.
  * @param gl 
  *  The WebGL context
  * @param worldMatrix
  *  The world matrix 
  * @param lightCount
  *  The number of lights in the scene 
  */
 CS336Object.prototype.renderSelf = async function(gl, worldMatrix, lights, camera) {
  // if (this.texture && this.modelTexture === null) this.modelTexture = await loadImagePromise(this.texture);
  console.log("^^^^^");
  if (this.texture && this.modelTexture == null){
    this.textureObject.loadImage();
  }
  const { lastLightCount } = this.shaderAttributes;
  if (lastLightCount === null || lastLightCount !== lightCount) {
    this.shaderAttributes = {
      lastLightCount: lightCount,
      shaderProgram: createShaderProgram(gl, this.createVertexShader(lights.length), this.createFragmentShader(lights.length)),
    }
  }
  const { shaderProgram } = this.shaderAttributes;
  gl.useProgram(shaderProgram);

  const positionIndex = gl.getAttribLocation(shaderProgram, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }
  const normalIndex = gl.getAttribLocation(shaderProgram, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }
  const texCoordIndex = gl.getAttribLocation(shaderProgram, "a_TexCoord");
  if (texCoordIndex < 0) {
    console.log("Failed to get the storage location of a_TexCoord");
    return;
  }
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  gl.enableVertexAttribArray(texCoordIndex);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.modelBuffers.vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  //gl.bindBuffer(gl.ARRAY_BUFFER, this.modelBuffers.faceNormalBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.modelBuffers.vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.modelBuffers.texCoordBuffer);
  gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);

  if (this.texture && this.modelTexture == null){
    this.textureObject.createAndLoad();
    this.modelTexture = this.textureObject.textureHandle;
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
    gl.uniform4f(loc, light.x, light.y, light.z, 1.0);
  })

  lights.forEach((light, i) => {
    loc = gl.getUniformLocation(shaderProgram, `lightProperties[${i}]`);
    gl.uniformMatrix4fv(loc, false, light.lightProperties())
  })

  gl.drawArrays(gl.TRIANGLES, 0, this.modelAttributes.numVertices);

  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(normalIndex);
  gl.disableVertexAttribArray(texCoordIndex);

  // draw
  console.log("++++++++++++++++");
  console.log(this.getMatrix().length);
  gl.drawArrays(gl.TRIANGLES, 0, this.getMatrix().length);

  gl.useProgram(null);
 };
/**
 * Create a vertex shader based on the number of lights in the scene.
 * @param lightCount 
 *  The number of lights in the scene
 * @returns
 *  The vertex shader
 */
 CS336Object.prototype.createVertexShader = lightCount => {
  return `
    #define MAX_LIGHTS ${lightCount}

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;  
    uniform mat4 normalMatrix;

    uniform vec4 lightPosition[MAX_LIGHTS];

    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    ${this.texture ? "attribute vec2 a_TexCoord;" : ""}

    varying vec3 fL[MAX_LIGHTS];
    varying vec3 fN;
    varying vec3 fV;
    ${this.texture ? "varying vec2 fTexCoord;" : ""}

    void main() {
      vec4 posEye = view * model * a_Position;

      for (int i = 0; i < MAX_LIGHTS; i++) {
        vec4 lightEye = view * lightPosition[i];
        fL[i] = (lightEye - posEye).xyz;
      }

      fN = normalMatrix * a_Normal;
      fV = normalize(-(posEye).xyz);

      ${this.texture ? "fTexCoord = a_TexCoord;" : ""}
      gl_Position = projection * view * model * a_Position;
    }
  `;
 }

 /**
  * Creates a fragment shader based on the number of lights in the scene.
  * @param lightCount
  *   The number of lights in the scene 
  * @returns 
  *   The fragment shader
  */
 CS336Object.prototype.createFragmentShader = lightCount => {
  return `
    #define MAX_LIGHTS ${lightCount}

    precision mediump float;

    uniform mat3 materialProperties;
    uniform mat3 lightProperties[MAX_LIGHTS];
    uniform float shininess;
    //${this.texture ? this.textureObject.uniformTextureDeclaration() : ""}
    ${this.texture ? "uniform sampler2D sampler" : ""}

    varying vec3 fL[MAX_LIGHTS];
    varying vec3 fN;
    varying vec3 fV;
    ${this.texture ? "varying vec2 fTexCoord;" : ""}

    vec4 getColor(vec3 fL, mat3 lightProp, vec3 N, vec3 V) {
      vec3 L = normalize(fL);
      vec3 R = reflect(-L, N);

      mat3 products = matrixCompMult(lightProp, materialProperties);
      vec4 ambient = vec4(products[0], 1.0);
      vec4 diffuse = vec4(products[1], 1.0);
      vec4 specular = vec4(products[2], 1.0);

      ${this.texture ? `
        // Blend by texture alpha ${this.textureObject.texture_loader}
        vec4 texColor = texture2D(sampler, fTexCoord);
        float m = texColor.a;
        ambient = (1.0 - m) * ambient + m * texColor;
        diffuse = (1.0 - m) * diffuse + m * texColor;
        specular = (1.0 - m) * specular + m * texColor;
      ` : ""}

      float diffuseFactor = max(dot(L, N), 0.0);
      float specularFactor = pow(max(dot(R, V), 0.0), shininess);

      return specularFactor * specular + diffuseFactor * diffuse + ambient;
    }

    void main() {
      vec3 N = normalize(fN);
      vec3 V = normalize(fV);

      vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
      for (int i = 0; i < MAX_LIGHTS; i++) {
        color += getColor(fL[i], lightProperties[i], N, V);
      }

      gl_FragColor = color / float(MAX_LIGHTS);
      gl_FragColor.a = 1.0;
    }
  `;
 };
 
 /**
  * Sets the position.
  * @param x
  * @param y
  * @param z
  */
 CS336Object.prototype.setPosition = function(x, y, z)
 {
   this.position = new THREE.Vector3(x, y, z);
   this.matrixNeedsUpdate = true;
 };
 
 /**
  * Sets the scale.
  * @param x
  * @param y
  * @param z
  */
 CS336Object.prototype.setScale = function(x, y, z)
 {
   this.scale = new THREE.Vector3(x, y, z);
   this.matrixNeedsUpdate = true;
 };
 
 /**
  * Sets the current rotation matrix to the given one.
  */
 CS336Object.prototype.setRotation = function(rotationMatrix)
 {
   this.rotation = new THREE.Matrix4().copy(rotationMatrix);
   this.matrixNeedsUpdate = true;
 };
 
 /**
  * Returns the current transformation matrix, defined as
  * translate * rotate * scale.
  * @returns
  */
 CS336Object.prototype.getMatrix = function()
 {
   if (this.matrixNeedsUpdate)
   {
     // compose the scale, rotation, and translation components
     // and cache the resulting matrix
     var px, py, pz, sx, sy, sz;
     px = this.position.x;
     py = this.position.y;
     pz = this.position.z;
     sx = this.scale.x;
     sy = this.scale.y;
     sz = this.scale.z;
 
     this.matrixNeedsUpdate = false;
     this.matrix = new THREE.Matrix4().makeTranslation(px, py, pz)
         .multiply(this.rotation)
         .multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
   }
   return this.matrix;
 };
 
 /**
  * Moves the CS336Object along its negative z-axis by the given amount.
  */
 CS336Object.prototype.moveForward = function(distance)
 {
   var M = this.rotation.elements
   var sx = M[8] * -distance
   var sy = M[9] * -distance
   var sz = M[10] * -distance
   this.setPosition(this.position.x + sx, this.position.y + sy, this.position.z + sz)
 };
 
 /**
  * Moves the CS336Object along its positive z-axis by the given amount.
  */
 CS336Object.prototype.moveBack = function(distance)
 {
   this.moveForward(-distance);
 };
 
 /**
  * Moves the CS336Object along its positive x-axis by the given amount.
  */
 CS336Object.prototype.moveRight = function(distance)
 {
   var M = this.rotation.elements
   var sx = M[0] * distance
   var sy = M[1] * distance
   var sz = M[2] * distance
   this.setPosition(this.position.x + sx, this.position.y + sy, this.position.z + sz)
 
 };
 
 /**
  * Moves the CS336Object along its negative x-axis by the given amount.
  */
 CS336Object.prototype.moveLeft = function(distance)
 {
   this.moveRight(-distance);
 };
 
 /**
  * Moves the CS336Object along its own y-axis by the given amount.
  */
 CS336Object.prototype.moveUp = function(distance)
 {
   var M = this.rotation.elements
   var sx = M[4] * distance
   var sy = M[5] * distance
   var sz = M[6] * distance
   this.setPosition(this.position.x + sx, this.position.y + sy, this.position.z + sz)
 };
 
 /**
  * Moves the CS336Object along its own negative y-axis by the given amount.
  */
 CS336Object.prototype.moveDown = function(distance)
 {
   this.moveUp(-distance);
 };
 
 /**
  * Rotates the CS336Object ccw about its x-axis.
  */
 CS336Object.prototype.rotateX = function(degrees)
 {
   this.setRotation(this.rotation.multiply(new THREE.Matrix4().makeRotationX(toRadians(degrees))))
 };
 
 /**
  * Rotates the CS336Object ccw about its y-axis.
  */
 CS336Object.prototype.rotateY = function(degrees)
 {
   this.setRotation(this.rotation.multiply(new THREE.Matrix4().makeRotationY(toRadians(degrees))))
 };
 
 /**
  * Rotates the CS336Object ccw about its z-axis.
  */
 CS336Object.prototype.rotateZ = function(degrees)
 {
   this.setRotation(this.rotation.multiply(new THREE.Matrix4().makeRotationZ(toRadians(degrees))))
 };
 
 /**
  * Rotates the CS336Object ccw about the given axis, specified as a vector.
  */
 CS336Object.prototype.rotateOnAxis = function(degrees, x, y, z)
 {
   this.setRotation(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(x, y, z), toRadians(degrees)).multiply(this.rotation))
 };
 
 /**
  * Rotates the CS336Object ccw about the given axis, specified in terms of
  * pitch and head angles (as in spherical coordinates).
  */
 CS336Object.prototype.rotateOnAxisEuler = function(degrees, pitch, head)
 {
   var x = Math.cos(pitch)
   var r = Math.sin(pitch)
   var y = r * Math.sin(head)
   var z = Math.cos(head) * r
   this.rotateOnAxis(degrees, x, y, z)
 };
 
 /**
  * Rotates the CS336Object counterclockwise about an axis through its center that is
  * parallel to the vector (0, 1, 0).
  */
 CS336Object.prototype.turnLeft = function(degrees)
 {
   this.rotation = new THREE.Matrix4().makeRotationY(toRadians(degrees)).multiply(this.rotation);
   this.matrixNeedsUpdate = true;
   //this.rotateOnAxis(degrees, 0, 1, 0)
 };
 
 /**
  * Rotates the CS336Object clockwise about an axis through its center that is
  * parallel to the vector (0, 1, 0).
  */
 CS336Object.prototype.turnRight = function(degrees)
 {
   this.turnLeft(-degrees);
 };
 
 /**
  * Performs a counterclockwise rotation about this object's
  * x-axis.
  */
 CS336Object.prototype.lookUp = function(degrees)
 {
    this.rotateX(degrees);
 };
 
 /**
  * Performs a clockwise rotation about this object's
  * x-axis.
  */
 CS336Object.prototype.lookDown = function(degrees)
 {
   this.lookUp(-degrees);
 };
 
 
 /**
  * Moves the CS336Object the given number of degrees along a great circle. The axis
  * of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
  * negative z-axis the given distance in front of the CS336Object. (This operation is
  * equivalent to a moveForward, lookDown and then moveBack.
  */
 CS336Object.prototype.orbitUp = function(degrees, distance)
 {
   this.moveForward(distance)
   this.lookDown(degrees)
   this.moveBack(distance)
 };
 
 /**
  * Moves the CS336Object the given number of degrees along a great circle. The axis
  * of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
  * negative z-axis the given distance in front of the CS336Object. (This operation is
  * equivalent to a moveForward, lookUp and then moveBack.
  */
 CS336Object.prototype.orbitDown = function(degrees, distance)
 {
   this.orbitUp(-degrees, distance);
 };
 
 /**
  * Moves the CS336Object the given number of degrees around a circle of latitude. The
  * axis of rotation is parallel to the world up vector and intersects the
  * CS336Object's negative z-axis the given distance in front of the CS336Object. (This
  * operation is equivalent to a moveForward, turnLeft, and moveBack.)
  */
 CS336Object.prototype.orbitRight = function(degrees, distance)
 {
   this.moveForward(distance)
   this.turnLeft(degrees)
   this.moveBack(distance)
 };
 
 /**
  * Moves the CS336Object the given number of degrees around a circle of latitude. The
  * axis of rotation is parallel to the world up vector and intersects the
  * CS336Object's negative z-axis the given distance in front of the CS336Object. (This
  * operation is equivalent to a moveForward, turnRight, and moveBack.)
  */
 CS336Object.prototype.orbitLeft = function(degrees, distance)
 {
   this.orbitRight(-degrees, distance);
 };
 
 /**
  * Orients the CS336Object at its current location to face the given position
  * using (0, 1, 0) as the up-vector.  That is, the given position will lie along
  * the object's negative z-axis, and this object's x-axis will be
  * parallel to the world x-z plane
  */
 CS336Object.prototype.lookAt = function(x, y, z)
 {
     // The given x, y, z are the coordinates of the look-at point
     // We use the world up vector (0, 1, 0) for up
     //
     let at = new THREE.Vector3(x, y, z);
     let up = new THREE.Vector3(0, 1, 0);
     this.rotation = new THREE.Matrix4().lookAt(this.position, at, up);
     this.matrixNeedsUpdate = true;
 
 };