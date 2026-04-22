/* Lava crack shader (vertex) */
varying vec2 v_uv;
varying vec3 v_worldNormal;
varying vec3 v_worldPos;
varying float v_displace;
varying float v_crack;
varying float v_cell;
varying vec3 v_objDir;

uniform float time;
uniform float energy;
uniform float bands;
uniform float isPlane;

float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash22(vec2 p) {
    float n = sin(dot(p, vec2(127.1, 311.7)));
    return fract(vec2(262144.0, 32768.0) * n);
}

float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise2(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

vec2 worleyInfo(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float best = 10.0;
    float second = 10.0;
    float cellRnd = 0.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 g = vec2(float(x), float(y));
            vec2 cell = i + g;
            vec2 rnd = hash22(cell);
            vec2 q = g + rnd;
            float d = length(f - q);
            if (d < best) {
                second = best;
                best = d;
                cellRnd = hash21(cell + 19.7);
            } else if (d < second) {
                second = d;
            }
        }
    }

    float edge = second - best;
    return vec2(edge, cellRnd);
}

vec2 triWorley(vec3 dir, float scale, float t) {
    vec3 w = pow(abs(dir), vec3(4.0));
    w /= (w.x + w.y + w.z + 1e-5);

    vec2 yz = worleyInfo(dir.yz * scale + vec2(0.18 * t, -0.07 * t));
    vec2 xz = worleyInfo(dir.xz * scale + vec2(-0.12 * t, 0.16 * t));
    vec2 xy = worleyInfo(dir.xy * scale + vec2(0.05 * t, 0.21 * t));

    float edge = yz.x * w.x + xz.x * w.y + xy.x * w.z;
    float cell = yz.y * w.x + xz.y * w.y + xy.y * w.z;
    return vec2(edge, cell);
}

void main() {
    v_uv = uv;

    vec3 p = position;
    vec3 n = normalize(normal);
    vec3 dir = normalize(position);
    v_objDir = dir;

    if (isPlane < 0.5) {
        float scale = mix(5.0, 13.0, clamp((bands - 4.0) / 20.0, 0.0, 1.0));
        vec2 wi = triWorley(dir, scale, time);
        float edge = wi.x;
        float cell = wi.y;

        float crack = 1.0 - smoothstep(0.07, 0.14, edge);
        float ridgeNoise = fbm(dir.xz * (scale * 0.8) + vec2(time * 0.05, -time * 0.03));
        float crustHeight = smoothstep(0.12, 0.28, edge);

        float disp = (0.06 * crustHeight + 0.025 * ridgeNoise - 0.03 * crack) * energy;
        p += n * disp;

        v_displace = disp;
        v_crack = crack;
        v_cell = cell;
    } else {
        vec2 domain = uv * 8.0;
        float n1 = fbm(domain * 1.15 + vec2(time * 0.30, -time * 0.18));
        float n2 = fbm(domain * 2.10 + vec2(-time * 0.14, time * 0.25));
        float wave = sin((domain.x * 3.5 + domain.y * 2.4 - time * 2.5) * (0.35 * bands));

        float amount = 0.12 * energy;
        float disp = amount * (0.55 * (n1 - 0.5) + 0.35 * (n2 - 0.5) + 0.25 * wave);

        p += n * disp;
        v_displace = disp;
        v_crack = 0.0;
        v_cell = 0.0;
    }

    vec4 worldPos4 = modelMatrix * vec4(p, 1.0);
    v_worldPos = worldPos4.xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * viewMatrix * worldPos4;
}
