'use client';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

interface ColorBendsProps {
  colors?: string[];
  speed?: number;
  rotation?: number;
}

export const Background = ({ 
  colors = ["#607585", "#7cb8c7", "#42504d"], 
  speed = 0.5,
  rotation = 0
}: ColorBendsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const color1 = new THREE.Color(colors[0]);
    const color2 = new THREE.Color(colors[1]);
    const color3 = new THREE.Color(colors[2]);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color1: { value: color1 },
        u_color2: { value: color2 },
        u_color3: { value: color3 },
        u_speed: { value: speed }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform float u_speed;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float t = u_time * u_speed;
          
          for(float i = 1.0; i < 4.0; i++){
            p.x += 0.3 / i * sin(i * 3.0 * p.y + t);
            p.y += 0.3 / i * cos(i * 3.0 * p.x + t);
          }
          
          vec3 color = mix(u_color1, u_color2, abs(p.x));
          color = mix(color, u_color3, abs(p.y));
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let isMounted = true;
    let animationId: number;

    const animate = (time: number) => {
      if (!isMounted) return;
      
      material.uniforms.u_time.value = time * 0.001;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!isMounted) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);
    animationId = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // ✅ Array vazio = roda APENAS UMA VEZ!

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full" 
      style={{ 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} 
    />
  );
};