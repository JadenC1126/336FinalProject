class CS336Scene {
    camera = null;
    objects = [];
    lights = [];
    withAxis = false;
    axisShader = null;
    axisVertices = new Float32Array([
        0.0, 0.0, 0.0,
        1.5, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 1.5, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 1.5,
    ]);
    axisColors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
    ]);
    vAxisBuffer = null;
    cAxisBuffer = null;

    constructor({ withAxis } = { withAxis: false }) {
        this.camera = new Camera(30, 1.5);
        this.camera.setPosition(5,2,5);
        this.camera.lookAt(0,0,0);
        this.withAxis = withAxis;
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
        gl.clearColor(0.0, 0.8, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if( this.withAxis ) this.drawAxis(gl);
        this.objects.forEach(object => {
            object.render(gl, new THREE.Matrix4(), this.lights, this.camera);
        })
    }

    drawAxis(gl) {
        if( this.axisShader === null ) {
            const vShader = `
                precision mediump float;
                uniform mat4 transform;
                attribute vec4 a_Position;
                attribute vec4 a_Color;
                varying vec4 v_Color;

                void main() {
                    v_Color = a_Color;
                    gl_Position = transform * a_Position;
                }
            `;
            const fShader = `
                precision mediump float;
                varying vec4 v_Color;

                void main() {
                    gl_FragColor = v_Color;
                }
            `;
            this.axisShader = createShaderProgram(gl, vShader, fShader);
        }
        if( this.vAxisBuffer === null ) {
            this.vAxisBuffer = createAndLoadBuffer(this.axisVertices);
        }
        if( this.cAxisBuffer === null ) {
            this.cAxisBuffer = createAndLoadBuffer(this.axisColors);
        }

        gl.useProgram(this.axisShader);

        const a_Position = gl.getAttribLocation(this.axisShader, 'a_Position');
        if( a_Position < 0 ) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vAxisBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        const a_Color = gl.getAttribLocation(this.axisShader, 'a_Color');
        if( a_Color < 0 ) {
            console.log('Failed to get the storage location of a_Color');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cAxisBuffer);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        const transform = gl.getUniformLocation(this.axisShader, 'transform');
        if( transform < 0 ) {
            console.log('Failed to get the storage location of transform');
            return;
        }
        const transformMatrix = new THREE.Matrix4().multiply(this.camera.getProjection()).multiply(this.camera.getView());
        gl.uniformMatrix4fv(transform, false, transformMatrix.elements);

        gl.drawArrays(gl.LINES, 0, 6);
        
        gl.disableVertexAttribArray(a_Position);
        gl.disableVertexAttribArray(a_Color);

        gl.useProgram(null);
    }
}