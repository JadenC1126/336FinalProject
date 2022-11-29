import "./three";



class twoPointFiveLights {

    constructor(numLights){
        this.numLights = numLights;
    }

    get shader(){
        // set number of lights and return shader
        const fLightingShaderSource = `
            #define MAX_LIGHTS 3

            precision mediump float;

            uniform mat3 materialProperties;
            uniform mat3 lightProperties[MAX_LIGHTS];
            uniform float shininess;

            varying vec3 fL[MAX_LIGHTS];
            varying vec3 fN;
            varying vec3 fV;

            // helper method does lighting calculation for one light
            // and returns the resulting color
            vec4 getLightContribution(vec3 fL, mat3 lightProp, vec3 N, vec3 V)
            {
            vec3 L = normalize(fL);

            // reflected vector
            vec3 R = reflect(-L, N);

            mat3 products = matrixCompMult(lightProp, materialProperties);
            vec4 ambientColor = vec4(products[0], 1.0);
            vec4 diffuseColor = vec4(products[1], 1.0);
            vec4 specularColor = vec4(products[2], 1.0);

            // Lambert's law, clamp negative values to zero
            float diffuseFactor = max(0.0, dot(L, N));

            // specular factor from Phong reflection model
            float specularFactor = pow(max(0.0, dot(V, R)), shininess);

            // add the components together
            vec4 ret = specularColor * specularFactor + diffuseColor * diffuseFactor + ambientColor;

            return ret;
            }

            void main()
            {
            // normalize after interpolating
            vec3 N = normalize(fN);
            vec3 V = normalize(fV);

            // add in the contribution from each light
            vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
            for (int i = 0; i < MAX_LIGHTS; ++i)
            {
                sum += getLightContribution(fL[i], lightProperties[i], N, V);
            }

            // usually need to rescale somehow after adding
            gl_FragColor = sum / 2.0; //float(MAX_LIGHTS);
            gl_FragColor.a = 1.0;
            }
        `;
        return fLightingShaderSource;
    }


}

class twoPointFiveMatrix {
    // just give coordinates of object, this class handles the rest

    // use CS336Object to store coordinates 
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;

    }


    scale(x, y, z){}

    // rotateX(degrees){}
    // rotateY(degrees){}
    // rotateZ(degrees){}

    rotate(x, y, z){}

    normalize(){}

    // undo(){}

}



class twoPointFiveObject {

    // store dictionary of children, i.e. key is "armDummy" or "arm" & value is the object 

    constructor(){
        // create new CS336 object 
    }

    addChild(x_position, y_position, z_position, scaleX, scaleY, scaleZ){
        // add child to dummy parent to avoid extra scaling
        // automatically sets position
        // therefore turns 3-4 calls into 1
    }


    addOrbit(childObject){}


}

