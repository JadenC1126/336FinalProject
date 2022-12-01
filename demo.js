var gl;

var imagePath = "./textures/check64.png";

var modelObj;
var CSobject;
var textureObject;

async function main() {

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
    CSobject = new CS336Object({
      drawObject: true,
      light: false,
      texture: false,
      model: modelObj,
      textureObj: textureObject
    });
    // load the data in the object to the buffers
    CSobject.loadModelBuffers();

    const lights = [];
    lights.push(new CS336Light());

    // render the object
    await CSobject.render(gl, new THREE.Matrix4(), lights, new Camera());


  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = async function() {
	await draw(lights);
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();


}

async function draw(lights)
{
    await CSobject.render(gl, new THREE.Matrix4(), lights, new Camera());
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
}