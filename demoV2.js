var gl;

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

const scene = new CS336Scene({ withAxis: true });

async function main() {
    gl = getGraphicsContext("theCanvas");
    window.onkeypress = handleKeyPress;

    const sphereGeom = new THREE.CapsuleGeometry(0.75, 0.75, 10, 10);
    const sphereMat = new CS336Materials("solid");
    const sphere = new CS336Model({
        draw: true,
        modelProperties: getModelData(sphereGeom),
        materialProperties: sphereMat,
    });
    sphere.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
    sphere.loadModelBuffers();
    sphere.setPosition(0, 0, 0);

    scene.addObject(sphere);

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

async function handleKeyPress(event) {
    var ch = getChar(event);
    switch(ch) {
        case '1':
            scene.addLight(new CS336Light({
                x: 0,
                y: 2.5,
                z: 0,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.7, 0.0, 0.0, // diffuse
                    0.7, 0.0, 0.0 // specular
                ])
            }))
            break;
        case '2':
            scene.addLight(new CS336Light({
                x: -1.25,
                y: 2.5,
                z: 1.25,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.0, 0.7, 0.0, // diffuse
                    0.0, 0.7, 0.0 // specular
                ])
            }))
            scene.addLight(new CS336Light({
                x: 1.25,
                y: 2.5,
                z: -1.25,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.0, 0.0, 0.7, // diffuse
                    0.0, 0.0, 0.7 // specular
                    ])
            }))
            break;
        case '4':
            const textureMaterial = new CS336Materials("2D");
            textureMaterial.create2DTexture(imagePath3);
            await textureMaterial.textureAttributes.loadImage();
            textureMaterial.textureAttributes.createAndLoad();
            const newObject = new CS336Model({
                draw: true,
                modelProperties: getModelData(new THREE.TorusKnotGeometry(0.5, 0.2, 32, 8)),
                materialProperties: textureMaterial,
            });
            newObject.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
            newObject.loadModelBuffers();
            newObject.setPosition(1.25, 0, -1.25);

            scene.addObject(newObject);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture.textureAttributes.texture);
            gl.generateMipmap(gl.TEXTURE_2D);
            break;
        case '3':
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
            const cubeTexture = new CS336Materials("cube");
            const model = new CS336Model({
                draw: true,
                modelProperties: getModelData(new THREE.SphereGeometry(0.75, 32, 32)),
                materialProperties: cubeTexture,
            });
            model.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
            model.loadModelBuffers();
            model.materialProperties.createTextureCube(imagePathsCube);

            model.setPosition(-1.25, 0, 1.25);

            scene.addObject(model);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture.textureAttributes.textureHandler);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            break;
        case '5':
            scene.addLight(new CS336Light({
                x: 1.25,
                y: -2.5,
                z: -1.25,
                lightProperties: new Float32Array([
                    0.2, 0.2, 0.2, // ambient
                    0.0, 0.0, 0.7, // diffuse
                    0.0, 0.0, 0.7 // specular
                    ])
            }))
        default: scene.camera.keyControl(ch);
    }
}