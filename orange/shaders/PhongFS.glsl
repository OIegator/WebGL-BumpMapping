#version 300 es
#ifdef GL_ES
precision highp float;
#endif

in vec3 vLightDir;
in vec3 vNormal;
in vec4 vColor;
in vec3 vPosition;
in vec3 vCameraPosition;
in vec3 vHVector;
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

const float shininess = 32.0;

void main() {
    highp vec4 tColor1 = texture(uSampler1, vTextureCoord);
    highp vec4 tColor2 = texture(uSampler2, vTextureCoord);

    // Normalize light direction and H vector in tangent space
    vec3 lightDirTangent = normalize(vLightDir);
    vec3 hVectorTangent = normalize(vHVector);

    // Read normal from normal texture and normalize
    vec3 normal = normalize(texture(uSampler2, vTextureCoord).rgb * 2.0 - 1.0);

    // Calculate the scalar product of the normal vector from the normal texture and
    // the light source vector in tangent space
    float diffuseLightDot = max(dot(normal, lightDirTangent), 0.0);

    // Calculate the scalar product of the normal texture vector and H vector in tangent space
    float specularLightDot = max(dot(normal, hVectorTangent), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);

    float attenuation = 1.0 / (1.0 + uAttenuationLinear * length(lightDirTangent) +
    uAttenuationQuadratic * length(lightDirTangent) * length(lightDirTangent));

    vec3 vLightWeighting = uAmbientLightColor * uAmbientIntensity +
    (uDiffuseLightColor * diffuseLightDot +
    uSpecularLightColor * specularLightParam) * attenuation;

    fragColor = (tColor1 + vColor * 0.5) * vec4(vLightWeighting, 1);
}
