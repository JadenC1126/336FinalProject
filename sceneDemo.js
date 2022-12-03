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
    sphere.materialProperties.setColor([0.75, 0.75, 0.75, 1.0]);
    sphere.materialProperties.setSurfaceAttributes(new Float32Array([
        0.1, 0.1, 0.1,
        0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
    ]));
    sphere.loadModelBuffers();
    const sphere2 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere2.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
    sphere2.materialProperties.setSurfaceAttributes(new Float32Array([
        0.1, 0.1, 0.1,
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25,
    ]));
    sphere2.loadModelBuffers();
    const sphere3 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere3.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
    sphere3.materialProperties.setSurfaceAttributes(new Float32Array([
        0.1, 0.1, 0.1,
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25,
    ]));
    sphere3.loadModelBuffers();

    sphere.setPosition(1.5, 0, -1);
    sphere2.setPosition(0, 0, 0);
    sphere3.setPosition(-1., 0, 1.5);

    scene.addObject(sphere);
    scene.addObject(sphere2);
    scene.addObject(sphere3);

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