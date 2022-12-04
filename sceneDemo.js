var gl;

async function main() {
    gl = getGraphicsContext("theCanvas");

    const scene = new CS336Scene({ withAxis: true });

    const geometry = new THREE.SphereGeometry(1, 10, 10);

    const material = new CS336Materials("2D");
    material.create2DTexture("./textures/check64.png");
    await material.textureAttributes.loadImage();
    material.textureAttributes.createAndLoad();

    const material2 = new CS336Materials("2D");
    material2.create2DTexture("./textures/marble.png");
    await material2.textureAttributes.loadImage();
    material2.textureAttributes.createAndLoad();

    const material3 = new CS336Materials("2D");
    material3.create2DTexture("./textures/steve.png");
    await material3.textureAttributes.loadImage();
    material3.textureAttributes.createAndLoad();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, material.textureAttributes.textureHandler);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.activeTexture(gl.TEXTURE0+1);
    gl.bindTexture(gl.TEXTURE_2D, material2.textureAttributes.textureHandler);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.activeTexture(gl.TEXTURE0+2);
    gl.bindTexture(gl.TEXTURE_2D, material3.textureAttributes.textureHandler);
    gl.generateMipmap(gl.TEXTURE_2D);

    const sphere = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material,
    });
    sphere.materialProperties.setColor([0.75, 0.75, 0.75, 1.0]);
    sphere.loadModelBuffers();
    const sphere2 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material3, //new CS336Materials("solid"),
    });
    sphere2.materialProperties.setColor([0.25, 0.25, 0.25, 1.0]);
    sphere2.loadModelBuffers();
    const sphere3 = new CS336Model({
        draw: true,
        modelProperties: getModelData(geometry),
        materialProperties: material2,
    });
    sphere3.materialProperties.setColor([0.5, 0.5, 0.5, 1.0]);
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
        scene.renderScene(gl);
        requestAnimationFrame(animate);
    }

    animate();
}