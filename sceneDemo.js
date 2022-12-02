var gl;

async function main() {
    gl = getGraphicsContext("theCanvas");

    const scene = new CS336Scene({ withAxis: true });

    const geometry = new THREE.SphereGeometry(1);
    const material = new CS336Materials("solid");
    const sphere = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere.loadModelBuffers();
    const sphere2 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere2.materialProperties.setColor([1.0, 0.0, 0.0, 1.0]);
    sphere2.loadModelBuffers();
    const sphere3 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere3.materialProperties.setColor([0.0, 1.0, 1.0, 1.0]);
    sphere3.loadModelBuffers();

    sphere.setPosition(2, 0, 0);
    sphere2.setPosition(0, 2, 0);
    sphere3.setPosition(0, 0, 2);

    scene.addObject(sphere);
    scene.addObject(sphere2);
    scene.addObject(sphere3);

    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    const animate = async () => {
        await scene.renderScene(gl);
        requestAnimationFrame(animate);
    }

    animate();
}