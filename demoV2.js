var gl = getGraphicsContext("theCanvas");

var imagePath = "./textures/check64.png";
var imagePath2 = "./textures/steve.png";
var imagePath3 = "./textures/marble.png";
var imagePathsCube = [
    "./textures/px.jpg",
    "./textures/nx.jpg",
    "./textures/py.jpg",
    "./textures/ny.jpg",
    "./textures/pz.jpg",
    "./textures/nz.jpg",
];
var solarDemo = false;

let sunDummy = new CS336Model({
    draw: false,
    modelProperties: {},
    materialProperties: {},
})
sunDummy.setPosition(0, 0, 0);
const sun = new CS336Model({
    draw: true,
    modelProperties: getModelData(new THREE.SphereGeometry(0.5)),
    materialProperties: new CS336Materials("solid"),
});
sun.materialProperties.setColor([1.0, 1.0, 0.0, 1.0]);
sun.loadModelBuffers();
sun.setPosition(0, 0, 0);

const earthDummy = new CS336Model({
    draw: false,
    modelProperties: {},
    materialProperties: {},
})
earthDummy.setPosition(1, 0, 1);
const earth = new CS336Model({
    draw: true,
    modelProperties: getModelData(new THREE.SphereGeometry(0.5)),
    materialProperties: new CS336Materials("solid"),
});
earth.materialProperties.setColor([0.0, 0.0, 0.5, 1.0]);
earth.loadModelBuffers();
earth.setPosition(0, 0, 0);
earth.setScale(0.5, 0.5, 0.5);

const moon = new CS336Model({
    draw: true,
    modelProperties: getModelData(new THREE.SphereGeometry(0.5)),
    materialProperties: new CS336Materials("solid"),
});
moon.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
moon.loadModelBuffers();
moon.setPosition(0.5, 0, 0);
moon.setScale(0.25, 0.25, 0.25);

sunDummy.addChild(sun);
sunDummy.addChild(earthDummy);
earthDummy.addChild(earth);
earthDummy.addChild(moon);

const scene = new CS336Scene({ withAxis: true });

async function main() {
    window.onkeypress = handleKeyPress;

    const capsule = new CS336Model({
        draw: true,
        modelProperties: getModelData(new THREE.CapsuleGeometry(0.75, 0.75, 10, 10)),
        materialProperties: new CS336Materials("solid"),
    });
    capsule.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
    capsule.loadModelBuffers();
    capsule.setPosition(0, 0, 0);

    scene.addObject(capsule);

    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const animate = async () => {
        if( solarDemo ) {
            sunDummy.rotateY(toRadians(2));
            earth.rotateY(toRadians(8));
            earthDummy.rotateY(toRadians(8));
        }
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

async function handleKeyPress(event) {
    var ch = getChar(event);
    switch(ch) {
        case '1':
            solarDemo = false;
            scene.addLight(new CS336Light({
                x: 0,
                y: 2.5,
                z: 0,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.7, 0.0, 0.0, // diffuse
                    0.7, 0.0, 0.0 // specular
                ])
            }));
            console.log(scene)
            break;
        case '2':
            solarDemo = false;
            scene.addLight(new CS336Light({
                x: -1.25,
                y: 2.5,
                z: 1.25,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.0, 0.7, 0.0, // diffuse
                    0.0, 0.7, 0.0 // specular
                ])
            }));
            scene.addLight(new CS336Light({
                x: 1.25,
                y: 2.5,
                z: -1.25,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.0, 0.0, 0.7, // diffuse
                    0.0, 0.0, 0.7 // specular
                ])
            }));
            break;
        case '3':
            solarDemo = false;
            scene.lights = [
                new CS336Light({
                    x: 0,
                    y: 2.5,
                    z: 0,
                    lightProperties: new Float32Array([
                        0.2, 0.2, 0.2, // ambient
                        0.2, 0.2, 0.2, // diffuse
                        0.5, 0.5, 0.5 // specular
                    ])
                })
            ];
            const model = new CS336Model({
                draw: true,
                modelProperties: getModelData(new THREE.SphereGeometry(0.75, 32, 32)),
                materialProperties: new CS336Materials("cube"),
            });
            model.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
            model.loadModelBuffers();
            await model.materialProperties.createTextureCube(imagePathsCube);

            model.setPosition(-1.25, 0, 1.25);
            scene.addObject(model);

            break;
        case '4':
            solarDemo = false;
            const newObject = new CS336Model({
                draw: true,
                modelProperties: getModelData(new THREE.TorusKnotGeometry(0.5, 0.2, 32, 8)),
                materialProperties: new CS336Materials("2D"),
            });
            newObject.loadModelBuffers();
            await newObject.materialProperties.create2DTexture(imagePath3);
            newObject.setPosition(1.25, 0, -1.25);

            scene.addObject(newObject);
            break;
        case '5':
            solarDemo = false;
            scene.addLight(new CS336Light({
                x: 1.25,
                y: -2.5,
                z: -1.25,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.0, 0.0, 0.7, // diffuse
                    0.0, 0.0, 0.7 // specular
                ])
            }));
            break;
        case '6':
            solarDemo = true;
            scene.lights = [];
            scene.objects = [];
            scene.addObject(sunDummy);
            console.log(sunDummy.children)
            break;
        default: scene.camera.keyControl(ch);
    }
}