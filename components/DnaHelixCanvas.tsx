"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { getComplementaryBase } from "@/lib/bioinformatics";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Crosshair,
} from "lucide-react";

interface DnaHelixCanvasProps {
  dnaSequence: string;
  mutationIndices: number[];
  isCured: boolean;
  onHoverBase?: (info: HoverInfo | null) => void;
  activeCleavageIndex?: number;
}

export interface HoverInfo {
  index: number;
  base: string;
  complementaryBase: string;
  codonIndex: number;
  triplet: string;
  isMutated: boolean;
  isCured: boolean;
}

// Canonical Base Colors
const BASE_COLORS: Record<string, number> = {
  A: 0x00f5d4, // Cyan
  T: 0xff2a85, // Magenta
  C: 0xfee440, // Yellow
  G: 0x9b5de5, // Purple
};

const MUTANT_COLOR = 0xff0033; // Pulsing Red
const CURED_COLOR = 0x00ff66; // Glowing Emerald Green
const VIRTUAL_WINDOW_SIZE = 36; // 30-50 bp virtualized window

export default function DnaHelixCanvas({
  dnaSequence,
  mutationIndices,
  isCured,
  onHoverBase,
  activeCleavageIndex,
}: DnaHelixCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const helixGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Mesh tracking for in-place mutation / pulse
  const strand1Meshes = useRef<THREE.Mesh[]>([]);
  const strand2Meshes = useRef<THREE.Mesh[]>([]);
  const rungMeshes = useRef<THREE.Mesh[]>([]);
  const pulseUniforms = useRef<{ time: number }>({ time: 0 });

  // Interactive controls state
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredData, setHoveredData] = useState<HoverInfo | null>(null);
  const [zoomLevel, setZoomLevel] = useState(32);
  const [isCrystallographic, setIsCrystallographic] = useState(true);

  // Virtualized Sliding Window state
  const totalLength = dnaSequence.length;
  const isVirtualized = totalLength > VIRTUAL_WINDOW_SIZE + 6;
  const initialCutSite = activeCleavageIndex ?? (mutationIndices[0] ?? Math.floor(totalLength / 2));
  const [windowOffset, setWindowOffset] = useState(() =>
    isVirtualized
      ? Math.max(0, Math.min(totalLength - VIRTUAL_WINDOW_SIZE, initialCutSite - Math.floor(VIRTUAL_WINDOW_SIZE / 2)))
      : 0
  );

  // Mouse orbit state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  // Update window when cleavage index changes
  useEffect(() => {
    if (isVirtualized && activeCleavageIndex !== undefined) {
      const optimalStart = Math.max(
        0,
        Math.min(totalLength - VIRTUAL_WINDOW_SIZE, activeCleavageIndex - Math.floor(VIRTUAL_WINDOW_SIZE / 2))
      );
      setWindowOffset(optimalStart);
    }
  }, [activeCleavageIndex, isVirtualized, totalLength]);

  // Active slice of sequence
  const activeWindowSequence = isVirtualized
    ? dnaSequence.slice(windowOffset, windowOffset + VIRTUAL_WINDOW_SIZE)
    : dnaSequence;

  // Build Procedural Double Helix Geometry
  const buildHelix = useCallback(() => {
    if (!helixGroupRef.current || !sceneRef.current) return;

    const group = helixGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    }

    strand1Meshes.current = [];
    strand2Meshes.current = [];
    rungMeshes.current = [];

    const seq = activeWindowSequence.toUpperCase();
    const count = seq.length;
    if (count === 0) return;

    const radius = isCrystallographic ? 3.5 : 3.6;
    const pitch = isCrystallographic ? 0.94 : 0.82;
    const thetaStep = isCrystallographic ? (2 * Math.PI) / 10.5 : 0.45;
    const strand2Offset = isCrystallographic ? (140 * Math.PI) / 180 : Math.PI;

    const sphereGeom = new THREE.SphereGeometry(0.44, 24, 24);
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const globalIndex = windowOffset + i;
      const theta = i * thetaStep;
      const y = (i - count / 2) * pitch;

      // Strand 1: x1 = r*cos(i*theta), z1 = r*sin(i*theta), y = i*h
      const x1 = radius * Math.cos(theta);
      const z1 = radius * Math.sin(theta);
      const p1 = new THREE.Vector3(x1, y, z1);
      strand1Points.push(p1);

      // Strand 2: in B-DNA offset by ~140 deg creating Major & Minor Grooves
      const x2 = radius * Math.cos(theta + strand2Offset);
      const z2 = radius * Math.sin(theta + strand2Offset);
      const p2 = new THREE.Vector3(x2, y, z2);
      strand2Points.push(p2);

      const base1 = seq[i] || "A";
      const base2 = getComplementaryBase(base1);

      const isMutated = mutationIndices.includes(globalIndex);
      let s1Color = BASE_COLORS[base1] || 0x00f5d4;
      let s1Emissive = 0x000000;
      let s1EmissiveIntensity = 0.2;

      if (isMutated) {
        if (isCured) {
          s1Color = CURED_COLOR;
          s1Emissive = CURED_COLOR;
          s1EmissiveIntensity = 0.9;
        } else {
          s1Color = MUTANT_COLOR;
          s1Emissive = MUTANT_COLOR;
          s1EmissiveIntensity = 0.9;
        }
      }

      // Strand 1 Nucleotide Sphere
      const mat1 = new THREE.MeshStandardMaterial({
        color: s1Color,
        emissive: s1Emissive,
        emissiveIntensity: s1EmissiveIntensity,
        roughness: 0.25,
        metalness: 0.2,
      });

      const sphere1 = new THREE.Mesh(sphereGeom, mat1);
      sphere1.position.copy(p1);
      sphere1.userData = {
        globalIndex,
        windowIndex: i,
        base: base1,
        complementaryBase: base2,
        isStrand1: true,
        isMutated,
      };
      group.add(sphere1);
      strand1Meshes.current.push(sphere1);

      // Strand 2 Nucleotide Sphere
      const s2Color = BASE_COLORS[base2] || 0xff2a85;
      const mat2 = new THREE.MeshStandardMaterial({
        color: s2Color,
        emissive: 0x000000,
        emissiveIntensity: 0.15,
        roughness: 0.25,
        metalness: 0.2,
      });

      const sphere2 = new THREE.Mesh(sphereGeom, mat2);
      sphere2.position.copy(p2);
      sphere2.userData = {
        globalIndex,
        windowIndex: i,
        base: base2,
        complementaryBase: base1,
        isStrand1: false,
        isMutated: false,
      };
      group.add(sphere2);
      strand2Meshes.current.push(sphere2);

      // Hydrogen Bond Connecting Cylinder
      const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const rungGeom = new THREE.CylinderGeometry(0.12, 0.12, distance, 12);

      let rungColor = 0x334155;
      let rungEmissive = 0x000000;
      if (isMutated) {
        rungColor = isCured ? CURED_COLOR : MUTANT_COLOR;
        rungEmissive = isCured ? CURED_COLOR : MUTANT_COLOR;
      }

      const rungMat = new THREE.MeshStandardMaterial({
        color: rungColor,
        emissive: rungEmissive,
        emissiveIntensity: isMutated ? 0.6 : 0.1,
        roughness: 0.3,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85,
      });

      const rung = new THREE.Mesh(rungGeom, rungMat);
      rung.position.copy(midpoint);
      const orientation = new THREE.Matrix4();
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
      rung.quaternion.setFromRotationMatrix(orientation);
      rung.rotateX(Math.PI / 2);
      rung.userData = { globalIndex, isMutated };
      group.add(rung);
      rungMeshes.current.push(rung);
    }

    // Smooth Phosphodiester Backbones
    if (strand1Points.length > 2) {
      const curve1 = new THREE.CatmullRomCurve3(strand1Points);
      const tubeGeom1 = new THREE.TubeGeometry(curve1, count * 6, 0.16, 12, false);
      const tubeMat1 = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      group.add(new THREE.Mesh(tubeGeom1, tubeMat1));

      const curve2 = new THREE.CatmullRomCurve3(strand2Points);
      const tubeGeom2 = new THREE.TubeGeometry(curve2, count * 6, 0.16, 12, false);
      const tubeMat2 = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      group.add(new THREE.Mesh(tubeGeom2, tubeMat2));
    }
  }, [activeWindowSequence, windowOffset, mutationIndices, isCured, isCrystallographic]);

  // Initial Scene Setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x05070e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, zoomLevel);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5d4, 1.8);
    dirLight1.position.set(15, 20, 25);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff2a85, 1.8);
    dirLight2.position.set(-15, -15, -20);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const helixGroup = new THREE.Group();
    helixGroupRef.current = helixGroup;
    scene.add(helixGroup);

    buildHelix();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 520;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    const startTime = performance.now();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const time = (performance.now() - startTime) * 0.001;
      pulseUniforms.current.time = time;

      if (autoRotate && !isDragging.current && helixGroupRef.current) {
        helixGroupRef.current.rotation.y += 0.007;
      }

      if (!isDragging.current && helixGroupRef.current) {
        helixGroupRef.current.rotation.y += rotationVelocity.current.x;
        helixGroupRef.current.rotation.x += rotationVelocity.current.y;
        rotationVelocity.current.x *= 0.94;
        rotationVelocity.current.y *= 0.94;
      }

      // Pulse mutant sites in view
      mutationIndices.forEach((globalIdx) => {
        const localIdx = globalIdx - windowOffset;
        if (localIdx >= 0 && localIdx < strand1Meshes.current.length) {
          const mesh = strand1Meshes.current[localIdx];
          const rung = rungMeshes.current[localIdx];
          if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
            if (!isCured) {
              const pulse = (Math.sin(time * 6.5) + 1) * 0.5;
              mesh.material.emissiveIntensity = 0.5 + pulse * 1.5;
              const scale = 1.0 + pulse * 0.22;
              mesh.scale.set(scale, scale, scale);
              if (rung && rung.material instanceof THREE.MeshStandardMaterial) {
                rung.material.emissiveIntensity = 0.4 + pulse * 0.8;
              }
            } else {
              const glow = (Math.sin(time * 3) + 1) * 0.5;
              mesh.material.emissiveIntensity = 0.7 + glow * 0.6;
              mesh.scale.set(1.1, 1.1, 1.1);
            }
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    buildHelix();
  }, [buildHelix]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoomLevel;
    }
  }, [zoomLevel]);

  // Pointer drag orbit handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current && helixGroupRef.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      helixGroupRef.current.rotation.y += deltaX * 0.007;
      helixGroupRef.current.rotation.x += deltaY * 0.007;

      rotationVelocity.current = {
        x: deltaX * 0.003,
        y: deltaY * 0.003,
      };

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }

    if (
      canvasRef.current &&
      cameraRef.current &&
      sceneRef.current &&
      !isDragging.current
    ) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const intersects = raycaster.intersectObjects(strand1Meshes.current);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData;
        const gIdx = data.globalIndex;
        const tripletStart = Math.floor(gIdx / 3) * 3;
        const triplet = dnaSequence.slice(tripletStart, tripletStart + 3);

        const info: HoverInfo = {
          index: gIdx,
          base: data.base,
          complementaryBase: data.complementaryBase,
          codonIndex: Math.floor(gIdx / 3) + 1,
          triplet,
          isMutated: mutationIndices.includes(gIdx),
          isCured,
        };
        setHoveredData(info);
        if (onHoverBase) onHoverBase(info);
      } else {
        setHoveredData(null);
        if (onHoverBase) onHoverBase(null);
      }
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel((prev) => Math.min(52, Math.max(16, prev + e.deltaY * 0.03)));
  };

  const resetCamera = () => {
    if (cameraRef.current && helixGroupRef.current) {
      cameraRef.current.position.set(0, 2, 32);
      helixGroupRef.current.rotation.set(0, 0, 0);
      rotationVelocity.current = { x: 0, y: 0 };
      setZoomLevel(32);
    }
  };

  const centerOnCutSite = () => {
    const target = initialCutSite;
    setWindowOffset(
      Math.max(0, Math.min(totalLength - VIRTUAL_WINDOW_SIZE, target - Math.floor(VIRTUAL_WINDOW_SIZE / 2)))
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] rounded-2xl border border-slate-800/80 bg-[#05070E] overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(0,245,212,0.06)]"
      onWheel={handleWheel}
    >
      {/* Top Overlay Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <button
            onClick={() => setIsCrystallographic(!isCrystallographic)}
            title="Toggle Crystallographic B-DNA (10.5 bp/turn with Major/Minor Grooves)"
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-200 hover:text-cyan-300 transition-colors"
          >
            <span>{isCrystallographic ? "B-DNA Crystallographic" : "Idealized 180°"}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                isCrystallographic
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {isCrystallographic ? "10.5 bp/turn" : "14 bp/turn"}
            </span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            {isVirtualized ? (
              <span className="text-cyan-400">
                Window: bp {windowOffset + 1}-{windowOffset + activeWindowSequence.length} of {totalLength}
              </span>
            ) : (
              `(${totalLength} bp)`
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 pointer-events-auto">
          {isVirtualized && (
            <button
              onClick={centerOnCutSite}
              title="Center 3D Window on Active CRISPR Cut Site"
              className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[10px] font-mono px-2"
            >
              <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Target Cut</span>
            </button>
          )}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
            className={`p-1.5 rounded-lg transition-colors ${
              autoRotate
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(16, z - 4))}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(52, z + 4))}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetCamera}
            title="Reset View"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Holographic Nucleotide HUD Tooltip */}
      {hoveredData && (
        <div className="absolute top-14 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3.5 py-2.5 shadow-[0_0_20px_rgba(0,245,212,0.2)] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-cyan-300">
              Genomic Nucleotide #{hoveredData.index + 1}
            </span>
            {hoveredData.isMutated && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  hoveredData.isCured
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                }`}
              >
                {hoveredData.isCured ? "REPAIRED (CURED)" : "CLINVAR MUTATION"}
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>
              Strand 1: <strong className="text-white">{hoveredData.base}</strong> |
              Strand 2: <strong className="text-white">{hoveredData.complementaryBase}</strong>
            </div>
            <div>
              Codon #{hoveredData.codonIndex}:{" "}
              <span className="text-amber-300 font-bold">{hoveredData.triplet}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Virtualized Sliding Window Navigator Bar (Only when gene > window size) */}
      {isVirtualized && (
        <div className="absolute bottom-12 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 flex items-center justify-between gap-3 text-xs font-mono">
          <button
            onClick={() => setWindowOffset((prev) => Math.max(0, prev - 6))}
            disabled={windowOffset === 0}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Locus 1</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, totalLength - VIRTUAL_WINDOW_SIZE)}
              value={windowOffset}
              onChange={(e) => setWindowOffset(Number(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] text-slate-400">Locus {totalLength}</span>
          </div>

          <button
            onClick={() =>
              setWindowOffset((prev) =>
                Math.min(totalLength - VIRTUAL_WINDOW_SIZE, prev + 6)
              )
            }
            disabled={windowOffset >= totalLength - VIRTUAL_WINDOW_SIZE}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Base-Pair Color Legend Bar at Bottom */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between flex-wrap gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f5d4] shadow-[0_0_8px_#00f5d4]" />
            <span className="text-slate-300 font-medium">A (Adenine)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a85] shadow-[0_0_8px_#ff2a85]" />
            <span className="text-slate-300 font-medium">T (Thymine)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fee440] shadow-[0_0_8px_#fee440]" />
            <span className="text-slate-300 font-medium">C (Cytosine)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9b5de5] shadow-[0_0_8px_#9b5de5]" />
            <span className="text-slate-300 font-medium">G (Guanine)</span>
          </div>
        </div>

        {isCrystallographic && (
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-cyan-300/80 border-l border-slate-700/60 pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Major (~220°) & Minor (~140°) Grooves</span>
          </div>
        )}

        <div className="flex items-center gap-3 border-l border-slate-700/60 pl-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff0033] shadow-[0_0_8px_#ff0033] animate-pulse" />
            <span className="text-rose-300">Target Mutation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]" />
            <span className="text-emerald-300">Cured Site</span>
          </div>
        </div>
      </div>
    </div>
  );
}
