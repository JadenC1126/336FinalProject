var gl;

var imagePath = "./textures/check64.png";

var modelObj;
var CSobject;
var textureObject;

function main() {

    // get graphics context
    gl = getGraphicsContext("theCanvas");

    // key handlers
    // window.onkeypress = handleKeyPress;

    // creat texture for object
    textureObject = new CS336Texture("2D");
    textureObject.images = imagePath;

    // using basic cube vertices 
    modelObj = makeCube();

    // instantiate the object
    CSobject = new CS336Object(true, false, true, modelObj.vertices, textureObject);

    // load the data in the object to the buffers
    CSobject.loadModelBuffers();

    // render the object
    CSobject.render(gl, new THREE.Matrix4(modelObj.vertices), 1);

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
    CSobject.render(gl, new THREE.Matrix4(modelObj.vertices), 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
}