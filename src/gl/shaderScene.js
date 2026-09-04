const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;

// 单色奶白流体：域扭曲 FBM，对齐 shader.se 的黑底 + #fcf9f3 前景
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  float t = uTime * 0.045;
  float s = uScroll * 1.2;

  // 域扭曲：让流体有方向感而不是均匀噪点
  vec2 q = vec2(fbm(p * 1.6 + vec2(0.0, t)), fbm(p * 1.6 + vec2(4.7, -t)));
  vec2 r = vec2(
    fbm(p * 2.2 + 3.4 * q + vec2(1.7, 9.2) + 0.8 * t),
    fbm(p * 2.2 + 3.4 * q + vec2(8.3, 2.8) - 0.6 * t + s)
  );
  float f = fbm(p * 1.8 + 3.0 * r);

  // 中心亮、边缘暗的柔光带
  float glow = smoothstep(1.05, 0.08, length(p * vec2(0.68, 1.0)));
  float band = smoothstep(0.30, 0.80, f) * glow;

  // 注意 gl_FragCoord 原点在左下：uv.y 越大越靠上，让顶部更亮
  band *= mix(0.38, 1.06, uv.y);

  // 左侧是正文区，压暗保证可读性（CSS 遮罩还会再压一层）
  band *= mix(0.5, 1.0, smoothstep(0.2, 0.7, uv.x));

  vec3 cream = vec3(0.988, 0.976, 0.953);
  vec3 col = cream * band * 1.35;

  // 细颗粒，抵消 8bit 色带
  float grain = (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.02;
  col += grain;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

export function createShaderScene(canvas) {
  const gl =
    canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }) ||
    canvas.getContext('experimental-webgl')

  if (!gl) return null

  const compile = (type, src) => {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh)
      return null
    }
    return sh
  }

  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null

  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null

  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(prog, 'uRes')
  const uTime = gl.getUniformLocation(prog, 'uTime')
  const uScroll = gl.getUniformLocation(prog, 'uScroll')

  return {
    resize(w, h, dpr) {
      const W = Math.max(1, Math.floor(w * dpr))
      const H = Math.max(1, Math.floor(h * dpr))
      if (canvas.width === W && canvas.height === H) return
      canvas.width = W
      canvas.height = H
      gl.viewport(0, 0, W, H)
      gl.uniform2f(uRes, W, H)
    },
    draw(time, scroll) {
      gl.uniform1f(uTime, time)
      gl.uniform1f(uScroll, scroll)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      // 注意：不要在这里调用 WEBGL_lose_context.loseContext()。
      // React StrictMode 会 mount→cleanup→mount，而 canvas 的 context 是缓存的，
      // 强制丢失后第二次 mount 拿到的仍是已丢失的 context，shader 将无法再编译。
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
