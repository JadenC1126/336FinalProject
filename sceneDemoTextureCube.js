var gl;

var imagePath = "./textures/check64.png";
var imagePath2 = "./textures/steve.png";
var imagePathsCube = [
    "./textures/nx.jpg",
    "./textures/ny.jpg",
    "./textures/nz.jpg",
    "./textures/px.jpg",
    "./textures/py.jpg",
    "./textures/pz.jpg",
];

var modelObj;
var object;
var textureObject;

async function main() {
    gl = getGraphicsContext("theCanvas");
    window.onkeypress = handleKeyPress;
    const scene = new CS336Scene({ withAxis: true });

    // const geometry = new THREE.TorusKnotGeometry(1);
    const geometry = new THREE.SphereGeometry(1);
    const material1 = new CS336Materials("cube");
    // const material2 = new CS336Materials("2D");
    const sphere = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material1,
    });
    sphere.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
    sphere.loadModelBuffers();
    // const sphere2 = new CS336Model({
    //     draw: true,
    //     modelProperties: getModelData(geometry),
    //     materialProperties: material2,
    // });
    // sphere2.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
    // sphere2.loadModelBuffers();

    sphere.materialProperties.createTextureCube(imagePathsCube);
    // sphere2.materialProperties.create2DTexture(imagePath2);

    sphere.setPosition(1.5, 0, -1);
    // sphere2.setPosition(0, 0, 0);
    // sphere3.setPosition(-1., 0, 1.5);

    scene.addObject(sphere);
    // scene.addObject(sphere2);
    // scene.addObject(sphere3);

    console.log(sphere);

    const light = new CS336Light({
        x: 0,
        y: 5,
        z: 0,
        lightProperties: new Float32Array([
            0.2, 0.2, 0.2, // ambient
            0.2, 0.2, 0.2, // diffuse
            0.2, 0.2, 0.2 // specular
        ])
    });
    scene.addLight(light);

    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    const animate = async () => {
        await scene.renderScene(gl);
        requestAnimationFrame(animate);
    }

    animate();

}
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
    if (event.which == null) {
     return String.fromCharCode(event.keyCode) // IE
    } else if (event.which!=0 && event.charCode!=0) {
     return String.fromCharCode(event.which)   // the rest
    } else {
     return null // special key
    }
}
// handler for key press events adjusts object rotations
function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
	case 't':
	  torsoDummy.rotateY(15);
		break;
	case 'T':
	  torsoDummy.rotateY(-15);
		break;
	case 's':
	  shoulderDummy.rotateX(-15);
		break;
	case 'S':
	  shoulderDummy.rotateX(15);
		break;
	case 'a':
	  armDummy.rotateX(-15);
		break;
	case 'A':
	  armDummy.rotateX(15);
		break;
	case 'h':
	  hand.rotateY(15);
		break;
	case 'H':
	  hand.rotateY(-15);
		break;
	case 'l':
	  head.rotateY(15);
 		break;
	case 'L':
	  head.rotateY(-15);
 		break;

  case 'g':
    scale *= 1.25;
    torsoDummy.setScale(scale, scale, scale);
    break;
  case 'G':
    scale *= 0.8;
    torsoDummy.setScale(scale, scale, scale);
    break;
	default:
			return;
	}
}