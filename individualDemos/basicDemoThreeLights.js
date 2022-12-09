var gl = getGraphicsContext("theCanvas");

const scene = new CS336Scene({ withAxis: true });

function main() {
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
    scene.addLight(new CS336Light({
        x: 0,
        y: 2.5,
        z: 0,
        lightProperties: new Float32Array([
            0.2, 0.2, 0.2, // ambient
            0.7, 0.0, 0.0, // diffuse
            0.7, 0.0, 0.0, // specular
        ])
    }));
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

    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const animate = () => {
        scene.renderScene(gl);
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

function handleKeyPress(event) {
    var ch = getChar(event);
    scene.camera.keyControl(ch);
}