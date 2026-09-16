'use client';

import { useEffect, useRef, useState } from 'react';

const vertSrc = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos,0.0,1.0); }`;

const fragSrc = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 u_res;
uniform float u_time;

float tanh1(float x){ float e = exp(2.0*x); return (e-1.0)/(e+1.0); }
vec4 tanh4(vec4 v){ return vec4(tanh1(v.x), tanh1(v.y), tanh1(v.z), tanh1(v.w)); }

void main(){
  vec3 FC = vec3(gl_FragCoord.xy, 0.0);
  vec3 r = vec3(u_res, max(u_res.x, u_res.y));
  float t = u_time;
  vec4 o = vec4(0.0);
  vec3 p = vec3(0.0);
  vec3 v = vec3(1.0, 2.0, 6.0);
  float i = 0.0, z = 1.0, d = 1.0, f = 1.0;

  for (; i++ < 5e1; o.rgb += (cos((p.x + z + v) * 0.1) + 1.0) / d / f / z) {
    p = z * normalize(FC * 2.0 - r.xyy);
    vec4 m = cos((p + sin(p)).y * 0.4 + vec4(0.0, 33.0, 11.0, 0.0));
    p.xz = mat2(m) * p.xz;
    p.x += t / 0.2;
    z += (d = length(cos(p / v) * v + v.zxx / 7.0) / (f = 2.0 + d / exp(p.y * 0.2)));
  }

  o = tanh4(0.45 * o);
  o.a = 1.0;
  fragColor = o;
}`;

interface ShaderDemoATCProps {
  className?: string;
}

export default function ShaderDemoATC({ className = '' }: ShaderDemoATCProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isSmallScreen || prefersReducedMotion) {
      console.warn(
        '[ShaderDemoATC] Skipping WebGL shader on small/reduced-motion screens, falling back to static gradient.'
      );
      window.setTimeout(() => setUnsupported(true), 0);
      return;
    }

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    if (!gl) {
      console.warn('[ShaderDemoATC] WebGL2 not available, falling back to static gradient.');
      setUnsupported(true);
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Could not create shader');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Shader compile error';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    };

    let program: WebGLProgram;
    let vertexBuffer: WebGLBuffer | null = null;
    try {
      const vertexShader = compile(gl.VERTEX_SHADER, vertSrc);
      const fragmentShader = compile(gl.FRAGMENT_SHADER, fragSrc);
      program = gl.createProgram() as WebGLProgram;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Shader link error');
      }
    } catch (error) {
      console.warn('[ShaderDemoATC] Shader compile/link failed, falling back to static gradient:', error);
      setUnsupported(true);
      return;
    }

    gl.useProgram(program);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, 'u_res');
    const time = gl.getUniformLocation(program, 'u_time');
    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const width = Math.floor(canvas.clientWidth * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
    };

    const start = performance.now();
    let frame = 0;
    const draw = () => {
      gl.uniform1f(time, (performance.now() - start) / 1000);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  if (unsupported) {
    return (
      <div
        className={`h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(36,87,255,0.35),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(109,206,154,0.2),transparent_60%)] bg-[#050609] ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full bg-[#050609]" />
    </div>
  );
}
