// Default white light
const DEFAULT_LIGHT_PROPERTIES = new Float32Array([
    0.2, 0.2, 0.2, // ambient
    0.7, 0.7, 0.7, // diffuse
    0.7, 0.7, 0.7 // specular
])

/**
 * Creates a new CS336Light.
 * All or none of the options are required.
 * Light will be placed 2 units above the origin by default.
 * Default light properties are white.
 * Is an extension of CS336Object.
 * @param {Object} options optional
 * @param {Number} options.x
 * @param {Number} options.y
 * @param {Number} options.z
 * @param {Float32Array} options.lightProperties 9 element array of ambient, diffuse, and specular light properties
 */
var CS336Light = function({x, y, z, lightProperties} = {x: 0.0, y: 2.0, z: 0.0, lightProperties: DEFAULT_LIGHT_PROPERTIES}) {
    CS336Object.call(this);

    this.setPosition(x, y, z);

    this.lightProperties = lightProperties;
}

CS336Light.prototype = Object.create(CS336Object.prototype);

/**
 * Get the light properties.
 * @returns {Float32Array} 9 element array of ambient, diffuse, and specular light properties
 */
CS336Light.prototype.getLightProperties = function() {
    return this.lightProperties;
};

/**
 * Set the light properties.
 * @param {Float32Array} lightProperties 
 */
CS336Light.prototype.setLightProperties = function(lightProperties) {
    this.lightProperties = lightProperties;
};

/**
 * Handles key controls, unimplemented.
 * @param {Character} ch 
 * @returns {Boolean} true if key was handled, false otherwise
 */
CS336Light.prototype.keyControl = function(ch) {
    console.log(ch);

    switch(ch) {
        default: return false;
    }
}