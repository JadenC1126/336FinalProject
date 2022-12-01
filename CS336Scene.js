class CS336Scene {
    camera = null;
    objects = [];
    lights = [];

    constructor(){
        this.camera = new Camera();
    }

    get camera() {
        return this.camera;
    }

    addObject(object) {
        this.objects.push(object);
    }

    addLight(light) {
        this.lights.push(light);
    }

    renderScene(gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.objects.forEach(object => {
            object.render(gl, new THREE.matrix4(), this.lights, this.camera);
        })
    }
}