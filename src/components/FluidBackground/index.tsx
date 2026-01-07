import React, { useEffect, useRef, useState } from 'react'
import { fluidColors } from '@site/src/theme/tokens'

// Vertex shader
const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Fragment shader for fluid effect
const fragmentShader = `
  precision highp float;
  
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  uniform vec4 color1;
  uniform vec4 color2;
  uniform vec4 color3;
  uniform vec4 color4;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= resolution.x / resolution.y;
    
    // Mouse influence
    vec2 mousePos = mouse * 2.0 - 1.0;
    mousePos.x *= resolution.x / resolution.y;
    float mouseDist = length(p - mousePos);
    float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.3;
    
    // Animated noise layers
    float t = time * 0.15;
    float n1 = snoise(p * 1.5 + vec2(t, 0.0)) * 0.5 + 0.5;
    float n2 = snoise(p * 2.0 + vec2(0.0, t * 1.3)) * 0.5 + 0.5;
    float n3 = snoise(p * 1.0 + vec2(t * 0.7, t * 0.5)) * 0.5 + 0.5;
    float n4 = snoise(p * 3.0 + vec2(-t * 0.5, t * 0.8) + mouseInfluence) * 0.5 + 0.5;
    
    // Blend colors based on noise
    vec4 col = mix(color1, color2, n1);
    col = mix(col, color3, n2 * 0.6);
    col = mix(col, color4, n3 * 0.4);
    
    // Add subtle variation
    col.rgb += (n4 - 0.5) * 0.1;
    
    // Soft vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    col.rgb *= vignette;
    
    // Output with alpha for glass effect
    gl_FragColor = vec4(col.rgb, 0.6);
  }
`

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [0, 0, 0]
}

interface FluidBackgroundProps {
  className?: string
}

export function FluidBackground({ className }: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) {
      setWebglSupported(false)
      return
    }

    // Create shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vs, vertexShader)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, fragmentShader)
    gl.compileShader(fs)

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Create buffer
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const timeUniform = gl.getUniformLocation(program, 'time')
    const resolutionUniform = gl.getUniformLocation(program, 'resolution')
    const mouseUniform = gl.getUniformLocation(program, 'mouse')
    const color1Uniform = gl.getUniformLocation(program, 'color1')
    const color2Uniform = gl.getUniformLocation(program, 'color2')
    const color3Uniform = gl.getUniformLocation(program, 'color3')
    const color4Uniform = gl.getUniformLocation(program, 'color4')

    // Set colors
    const colors = fluidColors.map(hexToRgb)
    gl.uniform4f(color1Uniform, ...colors[0], 1)
    gl.uniform4f(color2Uniform, ...colors[1], 1)
    gl.uniform4f(color3Uniform, ...colors[2], 1)
    gl.uniform4f(color4Uniform, ...colors[3], 1)

    // Enable blending
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse handler
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height,
      }
    }
    canvas.addEventListener('mousemove', handleMouse)

    // Animation loop
    const startTime = Date.now()
    const render = () => {
      const time = (Date.now() - startTime) / 1000
      gl.uniform1f(timeUniform, time)
      gl.uniform2f(mouseUniform, mouseRef.current.x, mouseRef.current.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // CSS fallback for non-WebGL browsers
  if (!webglSupported) {
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(135deg, ${fluidColors[0]}40, ${fluidColors[1]}40, ${fluidColors[2]}40, ${fluidColors[3]}40)`,
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />
    )
  }

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />
}

export default FluidBackground
