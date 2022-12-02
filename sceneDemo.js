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
    scene.addObject(sphere);

    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    const animate = async () => {
        await scene.renderScene(gl);
        requestAnimationFrame(animate);
    }

    animate();
}