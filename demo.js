var gl;

var imagePath = "./textures/check64.png";
var imagePath2 = "./textures/steve.png";

var modelObj;
var object;
var textureObject;

async function main() {
    gl = getGraphicsContext("theCanvas");

    const scene = new CS336Scene({ withAxis: true });

    const geometry = new THREE.SphereGeometry(1);
    const material1 = new CS336Materials("2D");
    const material2 = new CS336Materials("2D");
    const sphere = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material1,
    });
    sphere.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
    sphere.loadModelBuffers();
    const sphere2 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material2,
    });
    sphere2.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
    sphere2.loadModelBuffers();

    sphere.materialProperties.create2DTexture(imagePath);
    sphere2.materialProperties.create2DTexture(imagePath2);

    sphere.setPosition(1.5, 0, -1);
    sphere2.setPosition(0, 0, 0);
    // sphere3.setPosition(-1., 0, 1.5);

    scene.addObject(sphere);
    scene.addObject(sphere2);
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

    // get graphics context
//     gl = getGraphicsContext("theCanvas");

//     // key handlers
//     // window.onkeypress = handleKeyPress;

//     // creat texture for object
//     textureObject = new CS336Texture("2D");
//     // textureObject.imagePaths = imagePath;

//     // using basic cube vertices 
//     modelObj = new THREE.SphereGeometry(1);

    // var texture_vertices = new Float32Array([
    //     0.0, 0.0,
    //     1.0, 0.0,
    //     1.0, 1.0,
    //     0.0, 0.0,
    //     1.0, 1.0,
    //     0.0, 1.0,
    //     ]);

//     // 2D Textured object 
//     object = new CS336Model({
//         draw: true,
//         modelProperties: getModelData(modelObj),
//         materialProperties: new CS336Materials("2D"),
//         }
//       );
//     object.materialProperties.create2DTexture(imagePath);
//     // object.materialProperties.textureAttributes.vertices = new Float32Array(texCoords);


//     // load the data in the object to the buffers
//     object.loadModelBuffers();
//     console.log(object);

//     const lights = [];
//     lights.push(new CS336Light());  

//     // render the object
//     const camera = new Camera(30, 1.5);
//     camera.setPosition(0,2,5);
//     camera.lookAt(0,0,0);
//     await object.render(gl, new THREE.Matrix4(), lights, camera);


//   // specify a fill color for clearing the framebuffer
//   gl.clearColor(0.9, 0.9, 0.9, 1.0);

//   gl.enable(gl.DEPTH_TEST);

//   // define an animation loop
//   var animate = async function() {
// 	await draw(lights, camera);
//     requestAnimationFrame(animate);
//   };

//   // start drawing!
//   animate();


}

// async function draw(lights, camera)
// {
//   await object.render(gl, new THREE.Matrix4(), lights, camera);
// }