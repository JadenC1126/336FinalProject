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