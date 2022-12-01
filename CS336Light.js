var CS336Light = function({x, y, z, lightProperties} = {x: 0.0, y: 0.0, z: 2.0, lightProperties: CS336Light.DEFAULT_LIGHT_PROPERTIES}) {
    CS336Object.call(this);

    this.setPosition(x, y, z);

    this.lightProperties = lightProperties;
}

CS336Light.prototype = Object.create(CS336Object.prototype);

CS336Light.prototype.DEFAULT_LIGHT_PROPERTIES = new Float32Array([
    0.2, 0.2, 0.2,
    0.7, 0.7, 0.7,
    0.7, 0.7, 0.7,
]);

CS336Light.prototype.getLightProperties = function() {
    return this.lightProperties;
};

CS336Light.prototype.setLightProperties = function(lightProperties) {
    this.lightProperties = lightProperties;
};

CS336Light.prototype.keyControl = function(ch) {
    console.log(ch);

    switch(ch) {
        default: return false;
    }
}