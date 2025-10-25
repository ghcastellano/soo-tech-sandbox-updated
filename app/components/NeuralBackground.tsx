"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas/WebGL com shader de ruído + deformação temporal.
 * Estilo N1 (neural orgânico), ritmo R2 (moderado), opacidade baixa para não competir com o conteúdo.
 */
export default function NeuralBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      // Fallback 2D se WebGL indisponível
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let t = 0;
      const draw = () => {
        const { width, height } = resizeCanvas(canvas);
        ctx.clearRect(0, 0, width, height);
        // partículas suaves
        for (let i = 0; i < 90; i++) {
          const x = (Math.sin(i * 12.9898 + t * 0.002) * 43758.5453) % 1;
          const y = (Math.cos(i * 78.233 + t * 0.002) * 12345.6789) % 1;
          const px = ((x + 1) % 1) * width;
          const py = ((y + 1) % 1) * height;
          const r = 1 + ((i % 6) * 0.6);
          ctx.fillStyle = "rgba(106,245,134,0.12)";
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
        t += 16;
        animRef.current = requestAnimationFrame(draw);
      };
      draw();
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }

    // WebGL shader
    const vertex = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragment = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;

      // ruído simples
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0));
        float d = hash(i + vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p = uv * 3.0;

        float t = u_time * 0.12;
        float n = noise(p + vec2(t, -t)) * 0.7 + noise(p * 0.5 + t) * 0.3;

        // “neurais” como veias: limiar + glow
        float veins = smoothstep(0.55, 0.65, n) - smoothstep(0.65, 0.75, n);

        // base escura + verdes sutis
        vec3 base = vec3(0.03, 0.035, 0.06);
        vec3 neon = vec3(0.16, 0.96, 0.52);
        vec3 col = base + neon * veins * 0.18;

        // vinheta sutil
        float vign = smoothstep(1.4, 0.2, length(uv - 0.5));
        col *= mix(0.88, 1.0, vign);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const program = createProgram(gl, vertex, fragment);
    if (!program) return;

    const pos = gl.getAttribLocation(program, "position");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // full screen triangle
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const render = (t: number) => {
      const { width, height } = resizeCanvas(canvas);
      gl.viewport(0, 0, width, height);
      gl.useProgram(program);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, t * 0.001);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animRef.current = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 opacity-90"
      aria-hidden
    />
  );
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.floor(canvas.clientWidth * dpr || window.innerWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr || window.innerHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height };
}

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createProgram(gl: WebGLRenderingContext, vSrc: string, fSrc: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}
