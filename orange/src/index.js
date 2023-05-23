import PhongVS from '../shaders/PhongVS.glsl'
import PhongFS from '../shaders/PhongFS.glsl'
import {initMeshBuffers} from "./initMeshBuffers";
import {drawMesh} from "./drawMesh.js";
import {vec3} from "gl-matrix";
import orange_texture from "../textures/orange_color.png"
import orange_normal from "../textures/bump_orange.jpg"

const canvas = document.querySelector('canvas');
const textLight = document.getElementById('light-overlay');
const textShade = document.getElementById('shade-overlay');
const verticalCtrl = document.getElementById('vertical-controller-overlay');
let gl;

let controls = {
    current_rotator: "gold",
    current_controller: "ambient",
    rotation_angle_gold: -2.8,
    object_position: vec3.fromValues(0.0, 0.0, -0.6),
    headlight_direction: vec3.fromValues(0.0, 0.0, -1.0),
    object_direction: vec3.fromValues(0.0, 0.0, 16.0),
    movement_speed: 0.1,
    object_rotation: 0.0,
    rotation_angle_silver: 0.0,
    rotation_angle_bronze: 0.0,
    rotation_angle_pedestal_2itself: 0.0,
    rotation_angle_pedestal_2scene: 0.0,
    attenuation_linear: 0.0,
    attenuation_quadratic: 0.0,
    ambient_intensity: 5.0,
    current_vs: PhongVS,
    current_fs: PhongFS,
    fs_list: [PhongFS],
    fs_ind: 0,
    vs_list: [PhongVS],
    vs_ind: 0,
}

function initWebGL(canvas) {
    gl = null
    const names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (let ii = 0; ii < names.length; ++ii) {
        try {
            gl = canvas.getContext(names[ii]);
        } catch (e) {
        }
        if (gl) {
            break;
        }
    }

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

async function main() {
    gl = initWebGL(canvas);

    if (gl) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    const meshBuffers = initMeshBuffers(gl);

    const orangeTexture = loadTexture(gl, orange_texture);
    const orangeNormal= loadTexture(gl, orange_normal);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    window.addEventListener("keydown", checkKeyPressed);

    function render() {

        let shaderProgram = initShaderProgram(gl, controls.current_vs, controls.current_fs);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition:
                    gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                vertexNormal:
                    gl.getAttribLocation(shaderProgram, "aVertexNormal"),
                vertexColor:
                    gl.getAttribLocation(shaderProgram, "aVertexColor"),
                textureCoord:
                    gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix:
                    gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix:
                    gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                normalMatrix:
                    gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
                lightPosition:
                    gl.getUniformLocation(shaderProgram, "uLightPosition"),
                cameraPosition:
                    gl.getUniformLocation(shaderProgram, "uCameraPosition"),
                ambientLightColor:
                    gl.getUniformLocation(shaderProgram, "uAmbientLightColor"),
                diffuseLightColor:
                    gl.getUniformLocation(shaderProgram, "uDiffuseLightColor"),
                specularLightColor:
                    gl.getUniformLocation(shaderProgram, "uSpecularLightColor"),
                attenuationLinear:
                    gl.getUniformLocation(shaderProgram, "uAttenuationLinear"),
                attenuationQuadratic:
                    gl.getUniformLocation(shaderProgram, "uAttenuationQuadratic"),
                ambientIntensity:
                    gl.getUniformLocation(shaderProgram, "uAmbientIntensity"),
                uSampler1:
                    gl.getUniformLocation(shaderProgram, "uSampler1"),
                uSampler2:
                    gl.getUniformLocation(shaderProgram, "uSampler2"),
            },

        };

        if (shaderProgram) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearDepth(1.0);
            drawMesh(gl, programInfo, meshBuffers, orangeTexture, orangeNormal, "orange", controls);
        }
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture, so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 255, 0, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    const image = new Image();

    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    };

    image.src = url;
    return texture;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;

}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function shader2string(shader) {
    switch (shader) {
        case PhongVS:
            return "Phong"
    }
}

function checkKeyPressed(e) {

    if (e.key === "f") {
        controls.current_fs = controls.fs_list[++controls.fs_ind % controls.fs_list.length];
        textShade.innerText = "Shading Model: " + shader2string(controls.fs_list[controls.fs_ind % controls.fs_list.length]);
    }

    if (e.key === "v") {
        controls.current_vs = controls.vs_list[++controls.vs_ind % controls.vs_list.length];
        textLight.innerText = "Light Model: " + shader2string(controls.vs_list[controls.vs_ind % controls.vs_list.length]);
    }
    if (e.key === "1") {
        controls.current_controller = "lin";
        verticalCtrl.innerText = "Adjustment Controller: Linear attenuation"
    }

    if (e.key === "2") {
        controls.current_controller = "quad";
        verticalCtrl.innerText = "Adjustment Controller: Quadratic attenuation"
    }

    if (e.key === "3") {
        controls.current_controller = "ambient";
        verticalCtrl.innerText = "Adjustment Controller: Ambient light"
    }

    if (e.key === "w") {
        controls.headlight_z -= 1.0;
        const frontVector = vec3.fromValues(
            -Math.sin(controls.rotation_angle_gold),
            0.0,
            -Math.cos(controls.rotation_angle_gold)
        );
        vec3.scaleAndAdd(controls.object_position, controls.object_position, frontVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, frontVector, -controls.movement_speed);
    }

    if (e.key === "s") {
        controls.headlight_z += 1.;
        const backVector = vec3.fromValues(
            Math.sin(controls.rotation_angle_gold),
            0.0,
            Math.cos(controls.rotation_angle_gold)
        );
        vec3.scaleAndAdd(controls.object_position, controls.object_position, backVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, backVector, -controls.movement_speed);
    }

    if (e.key === "a") {
        controls.headlight_x -= 1.0;
        const leftVector = vec3.fromValues(
            -Math.cos(controls.rotation_angle_gold),
            0.0,
            Math.sin(controls.rotation_angle_gold)
        );
        vec3.scaleAndAdd(controls.object_position, controls.object_position, leftVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, leftVector, -controls.movement_speed);
    }

    if (e.key === "d") {
        controls.headlight_x += 1.0;
        const rightVector = vec3.fromValues(
            Math.cos(controls.rotation_angle_gold),
            0.0,
            -Math.sin(controls.rotation_angle_gold)
        );
        vec3.scaleAndAdd(controls.object_position, controls.object_position, rightVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, rightVector, -controls.movement_speed);
    }

    if (e.key === "ArrowLeft") {
        switch (controls.current_rotator) {
            case "gold":
                controls.rotation_angle_gold -= 0.1;
                console.log(controls.rotation_angle_gold);
                break;
            case "silver":
                controls.rotation_angle_silver -= 0.1;
                break;
            case "bronze":
                controls.rotation_angle_bronze -= 0.1;
                break;
            case "pedestal":
                controls.rotation_angle_pedestal_2itself -= 0.1;
                break;
            case "center":
                controls.rotation_angle_pedestal_2scene -= 0.1;
                break;
        }
    }

    if (e.key === "ArrowRight") {
        switch (controls.current_rotator) {
            case "gold":
                controls.rotation_angle_gold += 0.1;

                break;
            case "silver":
                controls.rotation_angle_silver += 0.1;
                break;
            case "bronze":
                controls.rotation_angle_bronze += 0.1;
                break;
            case "pedestal":
                controls.rotation_angle_pedestal_2itself += 0.1;
                break;
            case "center":
                controls.rotation_angle_pedestal_2scene += 0.1;
                break;
        }
    }

    if (e.key === "ArrowUp") {
        switch (controls.current_controller) {
            case "lin":
                controls.attenuation_linear -= 0.1;
                break;
            case "quad":
                controls.attenuation_quadratic -= 0.1;
                break;
            case "ambient":
                controls.ambient_intensity += 1;
                break;
        }
    }

    if (e.key === "ArrowDown") {
        switch (controls.current_controller) {
            case "lin":
                controls.attenuation_linear += 0.1;
                break;
            case "quad":
                controls.attenuation_quadratic += 0.1;
                break;
            case "ambient":
                controls.ambient_intensity -= 1;
                break;
        }
    }


}

main();

