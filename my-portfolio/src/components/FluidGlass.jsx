import * as THREE from 'three';
import { useRef, useState, useEffect, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {} }) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <Canvas 
      camera={{ position: [0, 0, 20], fov: 15 }} 
      gl={{ alpha: false, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor(0x0a0a1a, 1)}
    >
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper modeProps={modeProps}>
          <Scroll>
            <Typography />
            <ProjectCards />
          </Scroll>
          <Scroll html />
          <Preload />
        </Wrapper>
      </ScrollControls>
    </Canvas>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}) {
  const ref = useRef();
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);
  const [isDark, setIsDark] = useState(true);
  
  const blob1Ref = useRef();
  const blob2Ref = useRef();
  const blob3Ref = useRef();

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
    
    // Detect theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [nodes, geometryKey]);

  // Set scene background color based on theme
  useEffect(() => {
    scene.background = new THREE.Color(isDark ? 0x0a0a1a : 0xfafafa);
  }, [isDark, scene]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if (modeProps.scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    // Animate blobs
    const t = state.clock.elapsedTime;
    if (blob1Ref.current) {
      blob1Ref.current.position.x = Math.sin(t * 0.3) * 3.5;
      blob1Ref.current.position.y = Math.cos(t * 0.2) * 2.8;
      blob1Ref.current.scale.setScalar(2.2 + Math.sin(t * 0.5) * 0.4);
    }
    if (blob2Ref.current) {
      blob2Ref.current.position.x = Math.cos(t * 0.25) * 4.2;
      blob2Ref.current.position.y = Math.sin(t * 0.35) * 3.1;
      blob2Ref.current.scale.setScalar(2.6 + Math.cos(t * 0.4) * 0.5);
    }
    if (blob3Ref.current) {
      blob3Ref.current.position.x = Math.sin(t * 0.2 + 1) * 3.8;
      blob3Ref.current.position.y = Math.cos(t * 0.3 + 2) * 2.5;
      blob3Ref.current.scale.setScalar(2.0 + Math.sin(t * 0.6 + 1) * 0.3);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;
  
  // Blob colors based on theme - mild tints for glass effect
  const blobColors = isDark 
    ? ['#6366f1', '#8b5cf6', '#a78bfa']  // Dark mode: soft indigo/purple
    : ['#c4b5fd', '#ddd6fe', '#e0e7ff']; // Light mode: very soft lavender

  return (
    <>
      {createPortal(
        <>
          {children}
          {/* Ambient lighting for glass effect */}
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-5, -5, 3]} intensity={0.4} color={isDark ? '#6366f1' : '#a78bfa'} />
          
          {/* Animated liquid glass blobs */}
          <mesh ref={blob1Ref} position={[0, 0, -5]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshPhysicalMaterial 
              color={blobColors[0]}
              transmission={0.9}
              roughness={0.1}
              thickness={0.5}
              ior={1.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh ref={blob2Ref} position={[2, -1, -6]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshPhysicalMaterial 
              color={blobColors[1]}
              transmission={0.85}
              roughness={0.15}
              thickness={0.4}
              ior={1.4}
              clearcoat={1}
              clearcoatRoughness={0.15}
              transparent
              opacity={0.65}
            />
          </mesh>
          <mesh ref={blob3Ref} position={[-2, 1, -7]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshPhysicalMaterial 
              color={blobColors[2]}
              transmission={0.8}
              roughness={0.2}
              thickness={0.3}
              ior={1.3}
              clearcoat={1}
              clearcoatRoughness={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>,
        scene
      )}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <mesh ref={ref} scale={scale ?? 0.15} rotation-x={Math.PI / 2} geometry={nodes[geometryKey]?.geometry} {...props}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItem({ label, link, isActive, isDark, fontSize, onNavigate }) {
  const textRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!textRef.current) return;
    const s = hovered ? 1.05 : 1;
    easing.damp3(textRef.current.scale, [s, s, 1], 0.15, delta);
  });

  const color = isActive
    ? (isDark ? '#c4b5fd' : '#7c3aed')
    : hovered
      ? (isDark ? '#e0d5ff' : '#6d28d9')
      : (isDark ? 'white' : 'black');

  return (
    <Text
      ref={textRef}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      depthWrite={false}
      outlineWidth={isActive || hovered ? 0.001 : 0}
      outlineBlur="20%"
      outlineColor="#7c3aed"
      outlineOpacity={isActive ? 0.6 : hovered ? 0.3 : 0}
      depthTest={false}
      renderOrder={10}
      onClick={e => {
        e.stopPropagation();
        onNavigate(link);
      }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {label}
    </Text>
  );
}

function NavItems({ items }) {
  const group = useRef();
  const { viewport, camera } = useThree();
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState('#hero');

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Active section tracking
    const sectionIds = items
      .filter(i => i.link?.startsWith('#'))
      .map(i => i.link.slice(1));
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection('#' + entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach(el => sectionObserver.observe(el));

    return () => {
      window.removeEventListener('resize', onResize);
      mediaQuery.removeEventListener('change', handleChange);
      sectionObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = link => {
    if (!link) return;
    if (link.startsWith('#')) {
      const el = document.querySelector(link);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <NavItem
          key={label}
          label={label}
          link={link}
          isActive={activeSection === link}
          isDark={isDark}
          fontSize={fontSize}
          onNavigate={handleNavigate}
        />
      ))}
    </group>
  );
}

const PROJECTS = [
  { title: 'NutriScan', desc: 'AI-powered nutrition scanning', github: '' },
  { title: 'iDo', desc: 'Secure task manager', github: '' },
  { title: 'Kiosk', desc: 'Open-source PDF reader', github: '' },
  { title: 'Soura', desc: 'Chrome download extension', github: '' },
  { title: 'Loading-tips', desc: 'Dev blog', github: '' },
];

function ProjectCard({ position, title, description, github, cardScale = 1, isDark = true }) {
  const group = useRef();
  const glowRef = useRef();
  const bgRef = useRef();
  const accentRef = useRef();
  const [hovered, setHovered] = useState(false);

  const W = 2.0 * cardScale;
  const H = 1.1 * cardScale;

  useFrame((_, delta) => {
    if (!group.current) return;
    const s = hovered ? 1.07 : 1;
    easing.damp3(group.current.scale, [s, s, s], 0.12, delta);
    if (glowRef.current) {
      easing.damp(glowRef.current.material, 'opacity', hovered ? 0.65 : 0.12, 0.12, delta);
    }
    if (bgRef.current) {
      easing.damp(bgRef.current.material, 'opacity', hovered ? 0.95 : 0.85, 0.12, delta);
    }
    if (accentRef.current) {
      easing.damp(accentRef.current.material, 'opacity', hovered ? 1.0 : 0.4, 0.12, delta);
    }
  });

  const colors = isDark
    ? {
        glow: '#7c3aed',
        bg: '#0c0c1d',
        accent: '#7c3aed',
        title: hovered ? '#c4b5fd' : '#ffffff',
        desc: '#8888aa',
        link: hovered ? '#a78bfa' : '#55556a',
      }
    : {
        glow: '#7c3aed',
        bg: '#f8f7ff',
        accent: '#7c3aed',
        title: hovered ? '#6d28d9' : '#1f1f1f',
        desc: '#666688',
        link: hovered ? '#7c3aed' : '#888899',
      };

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={e => { e.stopPropagation(); if (github) window.open(github, '_blank'); }}
    >
      {/* Glow border */}
      <mesh ref={glowRef} position={[0, 0, -0.008]}>
        <planeGeometry args={[W + 0.06, H + 0.06]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.12} />
      </mesh>

      {/* Card background */}
      <mesh ref={bgRef}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial color={colors.bg} transparent opacity={0.85} />
      </mesh>

      {/* Accent line at top */}
      <mesh ref={accentRef} position={[0, H / 2 - 0.012, 0.003]}>
        <planeGeometry args={[W, 0.022]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0.4} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, H * 0.18, 0.006]}
        fontSize={0.1 * cardScale}
        color={colors.title}
        anchorX="center"
        anchorY="middle"
        maxWidth={W * 0.85}
        letterSpacing={0.02}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        position={[0, -H * 0.06, 0.006]}
        fontSize={0.055 * cardScale}
        color={colors.desc}
        anchorX="center"
        anchorY="middle"
        maxWidth={W * 0.8}
      >
        {description}
      </Text>

      {/* GitHub link */}
      <Text
        position={[0, -H * 0.28, 0.006]}
        fontSize={0.04 * cardScale}
        color={colors.link}
        anchorX="center"
        anchorY="middle"
      >
        {github ? 'View on GitHub →' : 'GitHub →'}
      </Text>
    </group>
  );
}

function ProjectCards() {
  const { height } = useThree(s => s.viewport);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <group>
      <ProjectCard
        position={[-1.1, 0.15, 0]}
        title={PROJECTS[0].title}
        description={PROJECTS[0].desc}
        github={PROJECTS[0].github}
        isDark={isDark}
      />
      <ProjectCard
        position={[1.1, -0.1, 3]}
        title={PROJECTS[1].title}
        description={PROJECTS[1].desc}
        github={PROJECTS[1].github}
        cardScale={0.9}
        isDark={isDark}
      />
      <ProjectCard
        position={[-1.3, -height + 0.3, 5.5]}
        title={PROJECTS[2].title}
        description={PROJECTS[2].desc}
        github={PROJECTS[2].github}
        cardScale={0.8}
        isDark={isDark}
      />
      <ProjectCard
        position={[0.7, -height - 0.1, 7.5]}
        title={PROJECTS[3].title}
        description={PROJECTS[3].desc}
        github={PROJECTS[3].github}
        cardScale={0.7}
        isDark={isDark}
      />
      <ProjectCard
        position={[-0.2, -height * 2 + 0.2, 9.5]}
        title={PROJECTS[4].title}
        description={PROJECTS[4].desc}
        github={PROJECTS[4].github}
        cardScale={0.6}
        isDark={isDark}
      />
    </group>
  );
}

function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      window.removeEventListener('resize', onResize);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={0.1}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor={isDark ? "#000" : "#fff"}
      outlineOpacity={0.5}
      color={isDark ? "white" : "black"}
      anchorX="center"
      anchorY="middle"
    >
      What I've Built
    </Text>
  );
}
