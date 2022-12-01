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
    textureObject.imagePaths = imagePath;

    // using basic cube vertices 
    modelObj = new THREE.SphereGeometry(1, 32, 32);

    // instantiate the object
    CSobject = new CS336Object({
      drawObject: true,
      light: false,
      texture: false,
      model: getModelData(modelObj), // expand the model data
    });
    
    // load the data in the object to the buffers
    CSobject.loadModelBuffers();
    console.log(CSobject);

    const lights = [];
    lights.push(new CS336Light());

    // render the object
    const camera = new Camera(30, 1.5);
    camera.setPosition(0,2,5);
    camera.lookAt(0,0,0);
    await CSobject.render(gl, new THREE.Matrix4(), lights, camera);


  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = async function() {
	await draw(lights, camera);
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();


}

async function draw(lights, camera)
{
  await CSobject.render(gl, new THREE.Matrix4(), lights, camera);
}