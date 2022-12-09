var gl = getGraphicsContext("theCanvas");

let sunDummy = new CS336Model({
    draw: false,
    modelProperties: {},
    materialProperties: {},
});
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
});
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

function main() {
    window.onkeypress = handleKeyPress;

    scene.addObject(sunDummy);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const animate = () => {
        sunDummy.rotateY(toRadians(3));
        earth.rotateY(toRadians(9));
        earthDummy.rotateY(toRadians(9));
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