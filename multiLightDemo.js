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
    sphere.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
    sphere.loadModelBuffers();
    const sphere2 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere2.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
    sphere2.loadModelBuffers();
    const sphere3 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere3.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
    sphere3.loadModelBuffers();

    sphere.setPosition(1.5, 0, -1);
    sphere2.setPosition(0, 0, 0);
    sphere3.setPosition(-1., 0, 1.5);

    scene.addObject(sphere);
    scene.addObject(sphere2);
    scene.addObject(sphere3);

    scene.addLight(new CS336Light({
        x: 0,
        y: 1.5,
        z: 0,
        lightProperties: new Float32Array([
            0.5, 0.0, 0.0, // ambient
            0.2, 0.0, 0.0, // diffuse
            0.7, 0.0, 0.0 // specular
        ])
    }));
    scene.addLight(new CS336Light({
        x: 1.5,
        y: 1.5,
        z: -1,
        lightProperties: new Float32Array([
            0.0, 0.5, 0.0, // ambient
            0.0, 0.2, 0.0, // diffuse
            0.0, 0.7, 0.0 // specular
        ])
    }));
    scene.addLight(new CS336Light({
        x: -1,
        y: 1.5,
        z: 1.5,
        lightProperties: new Float32Array([
            0.0, 0.0, 0.5, // ambient
            0.0, 0.0, 0.2, // diffuse
            0.0, 0.0, 0.7 // specular
        ])
    }));

    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    const animate = async () => {
        scene.renderScene(gl);
        requestAnimationFrame(animate);
    }

    animate();
}