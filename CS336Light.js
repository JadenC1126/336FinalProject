class CS336Light {
    DEFAULT_LIGHT_PROPERTIES = new Float32Array([
        0.2, 0.2, 0.2,
        0.7, 0.7, 0.7,
        0.7, 0.7, 0.7,
    ])

    x = 0.0;
    y = 0.0;
    z = 0.0;
    w = 1.0;
    lightProperties = null;

    constructor({x, y, z, lightProperties} = {x: 0.0, y: 0.0, z: 2.0, lightProperties: this.DEFAULT_LIGHT_PROPERTIES}) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = 1.0;
        this.lightProperties = lightProperties;
    }

    get position() {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        }
    }

    // lightProperties() {
    //     return this.lightProperties;
    // }
}