#version 300 es
#ifdef GL_ES
precision highp float;
#endif

in vec3 vLightDir;
in vec3 vNormal;
in vec4 vColor;
in vec3 vPosition;
in vec3 vCameraPosition;
in highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 uLightPosition;
uniform float uAttenuationLinear;
uniform float uAttenuationQuadratic;
uniform float uAmbientIntensity;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;
out vec4 fragColor;

uniform sampler2D uSampler1;
uniform sampler2D uSampler2;

const float shininess = 8.0;

void main() {
    highp vec4 tColor1 = texture(uSampler1, vTextureCoord);
    highp vec4 tColor2 = texture(uSampler2, vTextureCoord);

    // Calculate texture gradients
    vec4 rightPixel = texture(uSampler2, vec2(vTextureCoord.x + 1.0 / 1176.0, vTextureCoord.y));
    vec4 leftPixel = texture(uSampler2, vec2(vTextureCoord.x - 1.0 / 1176.0, vTextureCoord.y));
    vec4 topPixel = texture(uSampler2, vec2(vTextureCoord.x, vTextureCoord.y - 1.0 / 1176.0));
    vec4 bottomPixel = texture(uSampler2, vec2(vTextureCoord.x, vTextureCoord.y + 1.0 / 1176.0));

    vec3 xGradient =  rightPixel.rgb - leftPixel.rgb;
    vec3 yGradient =  bottomPixel.rgb - topPixel.rgb;

    // Recalculate normal vector
    vec3 newNormal = vec3(vNormal.x + xGradient.x, vNormal.y + yGradient.y, vNormal.z);

    vec3 lightDirection = normalize(uLightPosition - vPosition);

    float diffuseLightDot = max(dot(newNormal, lightDirection), 0.0);

    vec3 reflectionVector = normalize(reflect(-lightDirection, vNormal));

    vec3 viewVectorEye = -normalize(vPosition);

    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);

    float attenuation = 1.0 / (1.0 + uAttenuationLinear * length(lightDirection) +
    uAttenuationQuadratic * length(lightDirection) * length(lightDirection));

    vec3 vLightWeighting = uAmbientLightColor * uAmbientIntensity +
    (uDiffuseLightColor * diffuseLightDot +
    uSpecularLightColor * specularLightParam) * attenuation;

    fragColor = tColor1 * vec4(vLightWeighting, 1);
}
