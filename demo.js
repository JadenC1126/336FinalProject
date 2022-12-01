var gl;

var imagePath = "./textures/check64.png";

function main() {

    // get graphics context
    gl = getGraphicsContext("theCanvas");

    // key handlers
    // window.onkeypress = handleKeyPress;

    // creat texture for object
    var textureObject = new CS336Texture("2D");
    textureObject.images = imagePath;

    // using basic cube vertices 
    var modelObj = makeCube();

    var CSobject = new CS336Object({
      drawObject: true,
      light: false,
      model: modelObj,
    });
    CSobject.loadModelBuffers();

    CSobject.render(gl, new THREE.matrix4(), [], new Camera());
    // create model data
    // var cube = makeCube();

    // load and compile the shader pair
    // lightingShader = createShaderProgram(gl, vLightingShaderSource, fLightingShaderSource);

    // // load the vertex data into GPU memory
    // vertexBuffer = createAndLoadBuffer(cube.vertices);

    // // buffer for vertex normals
    // vertexNormalBuffer = createAndLoadBuffer(cube.normals);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = function() {
	draw();
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();


}

function draw()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
}