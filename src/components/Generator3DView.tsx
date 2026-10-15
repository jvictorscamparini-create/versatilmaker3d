import React, { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box,
  Sliders,
  Download,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Paperclip,
  Check,
  X,
  Upload,
  RotateCw,
  Palette,
  Maximize2,
  Info,
  Camera,
  Image as ImageIcon,
  Trash2,
  SlidersHorizontal,
  Columns,
  Scissors,
  Cpu,
  Settings2,
} from "lucide-react";

interface Generator3DViewProps {
  onSendToQueue: (title: string, weight: number, time: number) => void;
}

interface GalleryPhoto {
  id: string;
  url: string;
  name: string;
  filter: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Filament color presets for 3D preview
// ---------------------------------------------------------------------------
const FILAMENT_COLORS = [
  { name: "Azul Cobalto Silk", hex: "#2563eb", metalness: 0.25, roughness: 0.3 },
  { name: "Preto Fosco (Matte)", hex: "#1e2229", metalness: 0.1, roughness: 0.75 },
  { name: "Prata Alumínio", hex: "#cbd5e1", metalness: 0.6, roughness: 0.2 },
  { name: "Ouro Nobre Silk", hex: "#eab308", metalness: 0.45, roughness: 0.25 },
  { name: "Roxo Neônio", hex: "#9333ea", metalness: 0.3, roughness: 0.35 },
  { name: "Esmeralda Vibrante", hex: "#10b981", metalness: 0.2, roughness: 0.4 },
  { name: "Branco Puro", hex: "#f8fafc", metalness: 0.05, roughness: 0.5 },
  { name: "Laranja Lava", hex: "#f97316", metalness: 0.2, roughness: 0.3 },
];

// ---------------------------------------------------------------------------
// Standard Binary STL Exporter (Watertight, slicer-ready)
// ---------------------------------------------------------------------------
function exportGroupToBinarySTL(object: THREE.Object3D, solidName = "versatil_model"): Blob {
  object.updateMatrixWorld(true);

  interface TriangleData {
    vA: THREE.Vector3;
    vB: THREE.Vector3;
    vC: THREE.Vector3;
    normal: THREE.Vector3;
  }

  const triangles: TriangleData[] = [];

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geom = mesh.geometry;
      if (!geom) return;

      const nonIndexed = geom.index ? geom.toNonIndexed() : geom.clone();
      const pos = nonIndexed.getAttribute("position");
      if (!pos) return;

      const matrixWorld = mesh.matrixWorld;

      const count = pos.count;
      for (let i = 0; i < count; i += 3) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(matrixWorld);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i + 1).applyMatrix4(matrixWorld);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i + 2).applyMatrix4(matrixWorld);

        const cb = new THREE.Vector3().subVectors(vC, vB);
        const ab = new THREE.Vector3().subVectors(vA, vB);
        cb.cross(ab).normalize();

        triangles.push({ vA, vB, vC, normal: cb });
      }
    }
  });

  const totalTriangles = triangles.length;
  const bufferSize = 84 + totalTriangles * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  const title = `Versatil Maker 3D Slicer Ready - ${solidName}`.slice(0, 80);
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < title.length ? title.charCodeAt(i) : 32);
  }

  view.setUint32(80, totalTriangles, true);

  let offset = 84;
  for (let i = 0; i < totalTriangles; i++) {
    const { vA, vB, vC, normal } = triangles[i];

    view.setFloat32(offset, isNaN(normal.x) ? 0 : normal.x, true);
    view.setFloat32(offset + 4, isNaN(normal.y) ? 0 : normal.y, true);
    view.setFloat32(offset + 8, isNaN(normal.z) ? 1 : normal.z, true);

    view.setFloat32(offset + 12, vA.x, true);
    view.setFloat32(offset + 16, vA.y, true);
    view.setFloat32(offset + 20, vA.z, true);

    view.setFloat32(offset + 24, vB.x, true);
    view.setFloat32(offset + 28, vB.y, true);
    view.setFloat32(offset + 32, vB.z, true);

    view.setFloat32(offset + 36, vC.x, true);
    view.setFloat32(offset + 40, vC.y, true);
    view.setFloat32(offset + 44, vC.z, true);

    view.setUint16(offset + 48, 0, true);

    offset += 50;
  }

  return new Blob([buffer], { type: "application/octet-stream" });
}

// ---------------------------------------------------------------------------
// Split STL Exporter (Cutting Plane / Multi-Part)
// ---------------------------------------------------------------------------
function exportSplitBinarySTLs(object: THREE.Object3D, cutHeightMm: number, solidName = "versatil_model"): { bottomBlob: Blob; topBlob: Blob } {
  object.updateMatrixWorld(true);

  interface TriangleData {
    vA: THREE.Vector3;
    vB: THREE.Vector3;
    vC: THREE.Vector3;
    normal: THREE.Vector3;
  }

  const bottomTriangles: TriangleData[] = [];
  const topTriangles: TriangleData[] = [];

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geom = mesh.geometry;
      if (!geom) return;

      const nonIndexed = geom.index ? geom.toNonIndexed() : geom.clone();
      const pos = nonIndexed.getAttribute("position");
      if (!pos) return;

      const matrixWorld = mesh.matrixWorld;

      const count = pos.count;
      for (let i = 0; i < count; i += 3) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(matrixWorld);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i + 1).applyMatrix4(matrixWorld);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i + 2).applyMatrix4(matrixWorld);

        const cb = new THREE.Vector3().subVectors(vC, vB);
        const ab = new THREE.Vector3().subVectors(vA, vB);
        cb.cross(ab).normalize();

        const avgZ = (vA.z + vB.z + vC.z) / 3;
        if (avgZ <= cutHeightMm) {
          bottomTriangles.push({ vA, vB, vC, normal: cb });
        } else {
          topTriangles.push({ vA, vB, vC, normal: cb });
        }
      }
    }
  });

  const makeBlob = (triangles: TriangleData[], partSuffix: string) => {
    const totalTriangles = triangles.length;
    const bufferSize = 84 + totalTriangles * 50;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    const title = `Versatil Maker Split - ${solidName} ${partSuffix}`.slice(0, 80);
    for (let i = 0; i < 80; i++) {
      view.setUint8(i, i < title.length ? title.charCodeAt(i) : 32);
    }

    view.setUint32(80, totalTriangles, true);

    let offset = 84;
    for (let i = 0; i < totalTriangles; i++) {
      const { vA, vB, vC, normal } = triangles[i];

      view.setFloat32(offset, isNaN(normal.x) ? 0 : normal.x, true);
      view.setFloat32(offset + 4, isNaN(normal.y) ? 0 : normal.y, true);
      view.setFloat32(offset + 8, isNaN(normal.z) ? 1 : normal.z, true);

      view.setFloat32(offset + 12, vA.x, true);
      view.setFloat32(offset + 16, vA.y, true);
      view.setFloat32(offset + 20, vA.z, true);

      view.setFloat32(offset + 24, vB.x, true);
      view.setFloat32(offset + 28, vB.y, true);
      view.setFloat32(offset + 32, vB.z, true);

      view.setFloat32(offset + 36, vC.x, true);
      view.setFloat32(offset + 40, vC.y, true);
      view.setFloat32(offset + 44, vC.z, true);

      view.setUint16(offset + 48, 0, true);

      offset += 50;
    }

    return new Blob([buffer], { type: "application/octet-stream" });
  };

  return {
    bottomBlob: makeBlob(bottomTriangles, "Parte_Inferior"),
    topBlob: makeBlob(topTriangles, "Parte_Superior"),
  };
}

// ---------------------------------------------------------------------------
// Compute Volume of Mesh Group in cm³
// ---------------------------------------------------------------------------
function computeGroupVolumeCm3(object: THREE.Object3D): number {
  object.updateMatrixWorld(true);
  let totalVolumeMm3 = 0;

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geom = mesh.geometry;
      if (!geom) return;

      const nonIndexed = geom.index ? geom.toNonIndexed() : geom;
      const pos = nonIndexed.getAttribute("position");
      if (!pos) return;

      const matrixWorld = mesh.matrixWorld;
      const vA = new THREE.Vector3();
      const vB = new THREE.Vector3();
      const vC = new THREE.Vector3();

      for (let i = 0; i < pos.count; i += 3) {
        vA.fromBufferAttribute(pos, i).applyMatrix4(matrixWorld);
        vB.fromBufferAttribute(pos, i + 1).applyMatrix4(matrixWorld);
        vC.fromBufferAttribute(pos, i + 2).applyMatrix4(matrixWorld);

        totalVolumeMm3 +=
          (-vC.x * vB.y * vA.z +
            vB.x * vC.y * vA.z +
            vC.x * vA.y * vB.z -
            vA.x * vC.y * vB.z -
            vB.x * vA.y * vC.z +
            vA.x * vB.y * vC.z) /
          6.0;
      }
    }
  });

  const volume = Math.abs(totalVolumeMm3) / 1000;
  return Math.max(volume, 5);
}

// ---------------------------------------------------------------------------
// Image Filter Processor Helper
// ---------------------------------------------------------------------------
function processImageWithFilter(srcUrl: string, filterType: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    if (srcUrl.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = 512;
      const h = 512;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(srcUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      if (filterType === "grayscale") {
        for (let i = 0; i < data.length; i += 4) {
          const luma = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = luma;
          data[i + 1] = luma;
          data[i + 2] = luma;
        }
      } else if (filterType === "contrast") {
        const factor = 1.5;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
      } else if (filterType === "edge") {
        const gray = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) {
          const idx = i * 4;
          gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        }

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const gx = -gray[idx - w - 1] - 2 * gray[idx - 1] - gray[idx + w - 1] +
                        gray[idx - w + 1] + 2 * gray[idx + 1] + gray[idx + w + 1];
            const gy = -gray[idx - w - 1] - 2 * gray[idx - w] - gray[idx - w + 1] +
                        gray[idx + w - 1] + 2 * gray[idx + w] + gray[idx + w + 1];
            const val = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.8);
            const pIdx = idx * 4;
            data[pIdx] = val;
            data[pIdx + 1] = val;
            data[pIdx + 2] = val;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => resolve(srcUrl);
    img.src = srcUrl;
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export const Generator3DView: React.FC<Generator3DViewProps> = ({ onSendToQueue }) => {
  // State
  const [modelType, setModelType] = useState<"vaso" | "placa" | "suporte" | "chaveiro" | "custom">("vaso");
  const [customText, setCustomText] = useState("VERSATIL 3D");
  const [scaleFactor, setScaleFactor] = useState(100);
  const [twistAngle, setTwistAngle] = useState(140);
  const [vaseRipples, setVaseRipples] = useState(6);
  const [wallThickness, setWallThickness] = useState(3);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // Gallery, Filters, Split-View, Cutting Plane & Slicer Tab State
  const [activeTab, setActiveTab] = useState<"geometry" | "slicer" | "gallery">("geometry");
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("normal");
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [enableCuttingPlane, setEnableCuttingPlane] = useState<boolean>(false);
  const [cutHeightMm, setCutHeightMm] = useState<number>(55);

  // Slicer Settings State
  const [slicerLayerHeight, setSlicerLayerHeight] = useState<string>("0.16mm (Optimal)");
  const [slicerInfillDensity, setSlicerInfillDensity] = useState<number>(15);
  const [slicerInfillPattern, setSlicerInfillPattern] = useState<string>("Gyroid");
  const [slicerSupports, setSlicerSupports] = useState<boolean>(true);

  // Feedback states
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [stats, setStats] = useState({ triangles: 0, weightGrams: 65, printHours: 3.8, fileSizeKb: 0 });

  // Camera states & refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [isSplitView]);

  // -------------------------------------------------------------------------
  // Procedural 3D Geometry Builders
  // -------------------------------------------------------------------------

  const buildVaseGeometry = useCallback(
    (scale: number, twist: number, petals: number): THREE.BufferGeometry => {
      const height = 110 * (scale / 100);
      const layers = 64;
      const radialSegments = Math.max(32, petals * 8);

      const positions: number[] = [];
      const indices: number[] = [];

      for (let l = 0; l <= layers; l++) {
        const t = l / layers;
        const y = t * height;
        const baseRadius = (22 + 16 * Math.sin(t * Math.PI) + 4 * Math.sin(t * Math.PI * 2)) * (scale / 100);
        const currentTwist = twist * (Math.PI / 180) * t;

        for (let s = 0; s <= radialSegments; s++) {
          const theta = (s / radialSegments) * Math.PI * 2;
          const ripple = 1.0 + 0.16 * Math.sin(theta * petals + currentTwist);
          const r = baseRadius * ripple;

          const x = r * Math.cos(theta);
          const z = r * Math.sin(theta);
          positions.push(x, y, z);
        }
      }

      for (let l = 0; l < layers; l++) {
        for (let s = 0; s < radialSegments; s++) {
          const a = l * (radialSegments + 1) + s;
          const b = a + 1;
          const c = (l + 1) * (radialSegments + 1) + s;
          const d = c + 1;

          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }

      const centerBottomIdx = positions.length / 3;
      positions.push(0, 0, 0);
      for (let s = 0; s < radialSegments; s++) {
        const next = s + 1;
        indices.push(centerBottomIdx, next, s);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    },
    []
  );

  const buildPlaqueGroup = useCallback((text: string, scale: number): THREE.Group => {
    const group = new THREE.Group();
    const factor = scale / 100;
    const width = 120 * factor;
    const height = 50 * factor;
    const depth = 5 * factor;

    const baseGeom = new THREE.BoxGeometry(width, height, depth);
    const baseMesh = new THREE.Mesh(baseGeom);
    baseMesh.position.set(0, depth / 2, 0);
    baseMesh.rotation.x = -Math.PI / 2;
    group.add(baseMesh);

    const rimGeom = new THREE.BoxGeometry(width - 6 * factor, height - 6 * factor, 2.5 * factor);
    const rimMesh = new THREE.Mesh(rimGeom);
    rimMesh.position.set(0, depth + 1.25 * factor, 0);
    rimMesh.rotation.x = -Math.PI / 2;
    group.add(rimMesh);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((text || "MAKER").toUpperCase().slice(0, 16), 256, 128);

      const imgData = ctx.getImageData(0, 0, 512, 256).data;
      const textPlaneGeom = new THREE.PlaneGeometry(width * 0.85, height * 0.65, 64, 32);
      const pos = textPlaneGeom.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const u = Math.floor(((pos.getX(i) / (width * 0.85) + 0.5) * 512));
        const v = Math.floor(((1 - (pos.getY(i) / (height * 0.65) + 0.5)) * 256));
        const pxIdx = (Math.min(255, Math.max(0, v)) * 512 + Math.min(511, Math.max(0, u))) * 4;
        const bright = imgData[pxIdx] / 255;
        pos.setZ(i, bright * 3.5 * factor);
      }
      textPlaneGeom.computeVertexNormals();
      const textMesh = new THREE.Mesh(textPlaneGeom);
      textMesh.position.set(0, depth + 2.5 * factor, 0);
      textMesh.rotation.x = -Math.PI / 2;
      group.add(textMesh);
    }

    return group;
  }, []);

  const buildPhoneStandGroup = useCallback((scale: number): THREE.Group => {
    const group = new THREE.Group();
    const f = scale / 100;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(85 * f, 0);
    shape.lineTo(85 * f, 12 * f);
    shape.lineTo(72 * f, 12 * f);
    shape.lineTo(72 * f, 8 * f);
    shape.lineTo(35 * f, 75 * f);
    shape.lineTo(25 * f, 72 * f);
    shape.lineTo(55 * f, 8 * f);
    shape.lineTo(0, 8 * f);
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 2,
      depth: 60 * f,
      bevelEnabled: true,
      bevelThickness: 2 * f,
      bevelSize: 2 * f,
      bevelSegments: 3,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    const mesh = new THREE.Mesh(geom);
    mesh.position.y = 38 * f;
    group.add(mesh);
    return group;
  }, []);

  const buildKeychainGroup = useCallback((text: string, scale: number): THREE.Group => {
    const group = new THREE.Group();
    const f = scale / 100;
    const length = 75 * f;
    const width = 28 * f;
    const thickness = 4 * f;

    const shape = new THREE.Shape();
    const r = width / 2;
    shape.moveTo(-length / 2 + r, -r);
    shape.lineTo(length / 2 - r, -r);
    shape.absarc(length / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(-length / 2 + r, r);
    shape.absarc(-length / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2, false);

    const hole = new THREE.Path();
    hole.absarc(-length / 2 + r, 0, 3.5 * f, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 1 * f,
      bevelSize: 1 * f,
      bevelSegments: 2,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    const baseMesh = new THREE.Mesh(geom);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = thickness / 2;
    group.add(baseMesh);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((text || "KEY").toUpperCase().slice(0, 10), 140, 64);

      const imgData = ctx.getImageData(0, 0, 256, 128).data;
      const textPlaneGeom = new THREE.PlaneGeometry(length * 0.55, width * 0.7, 32, 16);
      const pos = textPlaneGeom.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const u = Math.floor(((pos.getX(i) / (length * 0.55) + 0.5) * 256));
        const v = Math.floor(((1 - (pos.getY(i) / (width * 0.7) + 0.5)) * 128));
        const pxIdx = (Math.min(127, Math.max(0, v)) * 256 + Math.min(255, Math.max(0, u))) * 4;
        const bright = imgData[pxIdx] / 255;
        pos.setZ(i, bright * 2.5 * f);
      }
      textPlaneGeom.computeVertexNormals();
      const textMesh = new THREE.Mesh(textPlaneGeom);
      textMesh.position.set(10 * f, thickness + 1 * f, 0);
      textMesh.rotation.x = -Math.PI / 2;
      group.add(textMesh);
    }

    return group;
  }, []);

  const buildLithophaneGroup = useCallback(
    (imgSrc: string | null, scale: number): Promise<THREE.Group> => {
      return new Promise((resolve) => {
        const group = new THREE.Group();
        const f = scale / 100;
        const width = 80 * f;
        const height = 80 * f;

        const baseBox = new THREE.BoxGeometry(width + 4 * f, 3 * f, height + 4 * f);
        const baseMesh = new THREE.Mesh(baseBox);
        baseMesh.position.y = 1.5 * f;
        group.add(baseMesh);

        if (!imgSrc) {
          const reliefGeom = new THREE.PlaneGeometry(width, height, 48, 48);
          const pos = reliefGeom.getAttribute("position");
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            const z = (Math.sin(dist * 0.25) * 3 + Math.cos(x * 0.2) * 2) * f;
            pos.setZ(i, Math.max(0, z));
          }
          reliefGeom.computeVertexNormals();
          const reliefMesh = new THREE.Mesh(reliefGeom);
          reliefMesh.rotation.x = -Math.PI / 2;
          reliefMesh.position.y = 3 * f;
          group.add(reliefMesh);
          resolve(group);
          return;
        }

        const img = new Image();
        if (imgSrc.startsWith("http")) {
          img.crossOrigin = "anonymous";
        }
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 64;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, size, size);
            const imgData = ctx.getImageData(0, 0, size, size).data;
            const reliefGeom = new THREE.PlaneGeometry(width, height, size - 1, size - 1);
            const pos = reliefGeom.getAttribute("position");

            for (let i = 0; i < pos.count; i++) {
              const u = i % size;
              const v = size - 1 - Math.floor(i / size);
              const pxIdx = (v * size + u) * 4;
              const luma = (imgData[pxIdx] * 0.299 + imgData[pxIdx + 1] * 0.587 + imgData[pxIdx + 2] * 0.114) / 255;
              pos.setZ(i, (1.0 - luma) * 4.5 * f);
            }
            reliefGeom.computeVertexNormals();
            const reliefMesh = new THREE.Mesh(reliefGeom);
            reliefMesh.rotation.x = -Math.PI / 2;
            reliefMesh.position.y = 3 * f;
            group.add(reliefMesh);
          }
          resolve(group);
        };
        img.onerror = () => {
          resolve(group);
        };
        img.src = imgSrc;
      });
    },
    []
  );

  // Setup Three.js Scene and Renderer
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(130, 110, 160);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 450;
    controls.minDistance = 40;
    controls.target.set(0, 35, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(120, 200, 100);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.8);
    dirLight2.position.set(-100, 80, -100);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xa855f7, 0.7, 300);
    pointLight.position.set(0, 120, -50);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(220, 22, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    const bedGeometry = new THREE.PlaneGeometry(220, 220);
    const bedMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const bedMesh = new THREE.Mesh(bedGeometry, bedMaterial);
    bedMesh.rotation.x = -Math.PI / 2;
    bedMesh.position.y = -0.2;
    scene.add(bedMesh);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (autoRotate && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, []);

  const update3DModel = useCallback(async () => {
    const group = modelGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
    }

    const filament = FILAMENT_COLORS[selectedColorIdx];
    const material = new THREE.MeshStandardMaterial({
      color: filament.hex,
      metalness: filament.metalness,
      roughness: filament.roughness,
      wireframe: wireframe,
      side: THREE.DoubleSide,
    });

    let newGroup: THREE.Group = new THREE.Group();

    if (modelType === "vaso") {
      const geom = buildVaseGeometry(scaleFactor, twistAngle, vaseRipples);
      const mesh = new THREE.Mesh(geom, material);
      newGroup.add(mesh);
    } else if (modelType === "placa") {
      newGroup = buildPlaqueGroup(customText, scaleFactor);
    } else if (modelType === "suporte") {
      newGroup = buildPhoneStandGroup(scaleFactor);
    } else if (modelType === "chaveiro") {
      newGroup = buildKeychainGroup(customText, scaleFactor);
    } else if (modelType === "custom") {
      newGroup = await buildLithophaneGroup(referenceImage, scaleFactor);
    }

    newGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material;
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    group.add(newGroup);

    let triCount = 0;
    newGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const g = (child as THREE.Mesh).geometry;
        if (g) {
          triCount += g.index ? g.index.count / 3 : g.getAttribute("position")?.count / 3 || 0;
        }
      }
    });

    const volCm3 = computeGroupVolumeCm3(newGroup);
    const layerFactor = slicerLayerHeight.includes("0.12") ? 1.3 : slicerLayerHeight.includes("0.16") ? 1.1 : 1.0;
    const supportMultiplier = slicerSupports ? 1.2 : 1.0;

    const estimatedGrams = Math.max(15, Math.round(volCm3 * 1.24 * (0.2 + (slicerInfillDensity / 100) * 0.7) * (wallThickness / 3) * supportMultiplier));
    const estimatedHours = Number(((estimatedGrams / 22) * layerFactor * supportMultiplier).toFixed(1));
    const fileSize = Math.round((84 + triCount * 50) / 1024);

    setStats({
      triangles: Math.round(triCount),
      weightGrams: estimatedGrams,
      printHours: estimatedHours,
      fileSizeKb: fileSize,
    });
  }, [
    modelType,
    customText,
    scaleFactor,
    twistAngle,
    vaseRipples,
    wallThickness,
    wireframe,
    selectedColorIdx,
    referenceImage,
    slicerInfillDensity,
    slicerLayerHeight,
    slicerSupports,
    buildVaseGeometry,
    buildPlaqueGroup,
    buildPhoneStandGroup,
    buildKeychainGroup,
    buildLithophaneGroup,
  ]);

  useEffect(() => {
    update3DModel();
  }, [update3DModel]);

  // Handlers & Gallery Additions
  const addPhotoToGallery = (url: string, name: string) => {
    const newPhoto: GalleryPhoto = {
      id: "photo-" + Date.now(),
      url,
      name,
      filter: "normal",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setGalleryPhotos((prev) => [newPhoto, ...prev]);
    setReferenceImage(url);
    setReferenceImageName(name);
    setModelType("custom");
    setActiveFilter("normal");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      addPhotoToGallery(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImageName(null);
    setIsSplitView(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectGalleryPhoto = (photo: GalleryPhoto) => {
    setReferenceImage(photo.url);
    setReferenceImageName(photo.name);
    setActiveFilter(photo.filter);
    setModelType("custom");
  };

  const handleDeleteGalleryPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleApplyFilter = async (filterKey: string) => {
    setActiveFilter(filterKey);
    if (!referenceImage) return;

    const filteredUrl = await processImageWithFilter(referenceImage, filterKey);
    setReferenceImage(filteredUrl);

    setGalleryPhotos((prev) =>
      prev.map((p) => (p.url === referenceImage ? { ...p, url: filteredUrl, filter: filterKey } : p))
    );
    setDownloadSuccessToast(`Filtro "${filterKey.toUpperCase()}" aplicado com sucesso!`);
    setTimeout(() => setDownloadSuccessToast(null), 3000);
  };

  // Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível acessar a câmera do dispositivo. Verifique as permissões do navegador.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      addPhotoToGallery(dataUrl, `Câmera_${new Date().toLocaleTimeString("pt-BR").replace(/:/g, "-")}.jpg`);
    }
    stopCamera();
    setDownloadSuccessToast("Foto capturada e adicionada à galeria!");
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const handleGenerate3D = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (modelType === "vaso") {
        setTwistAngle((prev) => (prev + 45) % 360);
      }
      setIsGenerating(false);
      setDownloadSuccessToast("Novo modelo 3D fatiável gerado com sucesso!");
      setTimeout(() => setDownloadSuccessToast(null), 3500);
    }, 800);
  };

  const handleDownloadSTL = () => {
    if (!modelGroupRef.current) return;

    const safeName = (customText || modelType).toLowerCase().replace(/[^a-z0-9]/g, "_");

    if (enableCuttingPlane) {
      const { bottomBlob, topBlob } = exportSplitBinarySTLs(modelGroupRef.current, cutHeightMm, safeName);
      
      const bottomName = `${modelType}_${safeName}_parte_inferior_${scaleFactor}pct.stl`;
      const url1 = URL.createObjectURL(bottomBlob);
      const a1 = document.createElement("a");
      a1.href = url1;
      a1.download = bottomName;
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
      URL.revokeObjectURL(url1);

      setTimeout(() => {
        const topName = `${modelType}_${safeName}_parte_superior_${scaleFactor}pct.stl`;
        const url2 = URL.createObjectURL(topBlob);
        const a2 = document.createElement("a");
        a2.href = url2;
        a2.download = topName;
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
        URL.revokeObjectURL(url2);
      }, 600);

      setDownloadSuccessToast(`Plano de corte ativado! 2 arquivos STL gerados (${cutHeightMm}mm de altura).`);
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    } else {
      const filename = `${modelType}_${safeName}_${scaleFactor}pct.stl`;
      const blob = exportGroupToBinarySTL(modelGroupRef.current, filename);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccessToast(`Arquivo STL binário baixado: ${filename} (${stats.triangles.toLocaleString()} triângulos)`);
      setTimeout(() => setDownloadSuccessToast(null), 4500);
    }
  };

  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
    controlsRef.current.target.set(0, 35, 0);
  };

  const handleSend = () => {
    const title = `${
      modelType === "vaso"
        ? "Vaso Decorativo Paramétrico"
        : modelType === "placa"
        ? `Placa 3D "${customText}"`
        : modelType === "suporte"
        ? "Suporte Articulado de Mesa"
        : modelType === "chaveiro"
        ? `Chaveiro Personalizado "${customText}"`
        : `Relevo 3D IA / Foto`
    } (${scaleFactor}%)`;
    onSendToQueue(title, stats.weightGrams, stats.printHours);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Gerador 3D Paramétrico & Fatiador Integrado
            </h1>
            <p className="text-xs text-slate-400">
              Configure geometria, parâmetros de fatiamento (infill, suportes) e exporte modelos STL prontos para impressão.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccessToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-3 text-xs text-emerald-200 font-bold shadow-lg shadow-emerald-950/50">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Camera Live Modal Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-indigo-500/40 bg-[#0c1220] p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Camera className="h-4 w-4 text-indigo-400" />
                <span>Capturar Foto para Relevo 3D</span>
              </div>
              <button
                onClick={stopCamera}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-black border border-slate-800 h-72 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <span>Capturar Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Viewport / Split-View Comparison Container */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#070b14] shadow-2xl">
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold tracking-wider text-indigo-300 border border-indigo-500/30 pointer-events-auto">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>{isSplitView && referenceImage ? "Modo Split-View (Foto vs 3D)" : "Viewport 3D em Tempo Real"}</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {referenceImage && (
              <button
                onClick={() => setIsSplitView(!isSplitView)}
                title="Alternar Split-View (Comparar Foto com 3D)"
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border transition rounded-lg ${
                  isSplitView
                    ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30"
                    : "bg-black/70 border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
                }`}
              >
                <Columns className="h-3 w-3" />
                <span>{isSplitView ? "Sair Split" : "Split-View"}</span>
              </button>
            )}
            <button
              onClick={() => setWireframe(!wireframe)}
              title="Alternar Malha de Fatiamento (Wireframe)"
              className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                wireframe
                  ? "bg-indigo-600 border-indigo-400 text-white"
                  : "bg-black/60 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              {wireframe ? "Sólido" : "Malha"}
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title="Giro Automático"
              className={`rounded-lg p-1.5 border transition ${
                autoRotate
                  ? "bg-indigo-600/40 border-indigo-500 text-indigo-300"
                  : "bg-black/60 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetCamera}
              title="Resetar Câmera"
              className="rounded-lg bg-black/60 border border-slate-700 p-1.5 text-slate-300 hover:text-white transition"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {isSplitView && referenceImage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-800 h-80 pt-12">
            <div className="relative bg-black flex flex-col items-center justify-center p-2">
              <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-slate-700">
                1. Foto / Referência Selecionada
              </span>
              <img src={referenceImage} alt="Referência" className="h-full w-full object-contain rounded-lg" />
            </div>

            <div className="relative bg-[#070b14] flex flex-col items-center justify-center">
              <span className="absolute top-2 left-2 z-10 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-slate-700">
                2. Modelo 3D Relevo Gerado
              </span>
              <div ref={canvasContainerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
            </div>
          </div>
        ) : (
          <div
            ref={canvasContainerRef}
            className="h-80 w-full cursor-grab active:cursor-grabbing"
            title="Clique e arraste com o mouse para girar, scroll para zoom"
          />
        )}

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-300 font-medium">Filamento:</span>
            <div className="flex items-center gap-1 ml-1">
              {FILAMENT_COLORS.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColorIdx(idx)}
                  title={c.name}
                  className={`h-5 w-5 rounded-full border transition ${
                    selectedColorIdx === idx
                      ? "ring-2 ring-indigo-400 scale-110 border-white"
                      : "border-black/50 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
            {FILAMENT_COLORS[selectedColorIdx].name}
          </span>
        </div>
      </div>

      {/* Slicer / Mesh Diagnostics Bar */}
      <div className="grid grid-cols-4 gap-2 rounded-xl border border-slate-800 bg-[#0d1320] p-3 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Polígonos:</span>
          <p className="text-sm font-black text-cyan-400">{stats.triangles.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">tri</span></p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Tamanho STL:</span>
          <p className="text-sm font-black text-slate-200">{stats.fileSizeKb} <span className="text-[10px] font-normal text-slate-400">KB</span></p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Peso Estimado:</span>
          <p className="text-sm font-black text-indigo-400">{stats.weightGrams} <span className="text-[10px] font-normal text-slate-400">g</span></p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Tempo de Impressão:</span>
          <p className="text-sm font-black text-emerald-400">{stats.printHours} <span className="text-[10px] font-normal text-slate-400">h</span></p>
        </div>
      </div>

      {/* Controls & Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-[#101726] p-5 shadow-sm flex flex-col gap-4 text-xs">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#090d17] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("geometry")}
            className={`rounded-lg py-2 font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "geometry"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>Geometria</span>
          </button>
          <button
            onClick={() => setActiveTab("slicer")}
            className={`rounded-lg py-2 font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "slicer"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Parâmetros Slicer</span>
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`rounded-lg py-2 font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "gallery"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Galeria & Câmera</span>
          </button>
        </div>

        {/* TAB 1: GEOMETRY */}
        {activeTab === "geometry" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              PARÂMETROS GEOMÉTRICOS & MODELO
            </h3>

            {/* Model Type Selector */}
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  { id: "vaso", label: "Vaso" },
                  { id: "placa", label: "Placa" },
                  { id: "suporte", label: "Suporte" },
                  { id: "chaveiro", label: "Chaveiro" },
                  { id: "custom", label: "IA/Foto" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setModelType(t.id)}
                  className={`rounded-xl py-2 font-bold transition text-[11px] cursor-pointer ${
                    modelType === t.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-[#0b101b] border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {modelType === "vaso" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>Ângulo de Torção (Twist):</span>
                    <span className="text-indigo-400">{twistAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={10}
                    value={twistAngle}
                    onChange={(e) => setTwistAngle(Number(e.target.value))}
                    className="mt-1.5 w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>Pétalas / Ondulações:</span>
                    <span className="text-indigo-400">{vaseRipples} lados</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    value={vaseRipples}
                    onChange={(e) => setVaseRipples(Number(e.target.value))}
                    className="mt-1.5 w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {(modelType === "placa" || modelType === "chaveiro") && (
              <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80">
                <label className="text-[11px] font-semibold text-slate-300">
                  Texto em Relevo Tridimensional
                </label>
                <input
                  type="text"
                  value={customText}
                  maxLength={20}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex: MAKER, NOME, SLOGAN..."
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-[#0d1320] px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Cutting Plane / Multi-Part Export Section */}
            <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCuttingPlane}
                    onChange={(e) => setEnableCuttingPlane(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Scissors className="h-3.5 w-3.5" />
                    <span>Plano de Corte (Divisão em Múltiplos STLs)</span>
                  </span>
                </label>
                <span className="text-[10px] text-purple-400 font-medium">Impressão em Partes</span>
              </div>

              {enableCuttingPlane && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Altura de Corte (Z):</span>
                    <span className="font-bold text-indigo-300">{cutHeightMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={5}
                    value={cutHeightMm}
                    onChange={(e) => setCutHeightMm(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Global Scale Slider */}
            <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Escala Dimensional do Objeto</span>
                <span className="font-bold text-indigo-400">{scaleFactor}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={160}
                value={scaleFactor}
                onChange={(e) => setScaleFactor(Number(e.target.value))}
                className="mt-1.5 w-full accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SLICER PARAMETERS */}
        {activeTab === "slicer" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              CONFIGURAÇÕES DO SLICER (FATIAMENTO & CONSUMO)
            </h3>

            {/* Layer Height */}
            <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-300">Altura de Camada (Qualidade)</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["0.20mm (Draft)", "0.16mm (Optimal)", "0.12mm (Detail)"].map((lh) => (
                  <button
                    key={lh}
                    onClick={() => setSlicerLayerHeight(lh)}
                    className={`rounded-lg py-2 text-[11px] font-bold transition cursor-pointer ${
                      slicerLayerHeight === lh
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-[#0d1320] border border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {lh}
                  </button>
                ))}
              </div>
            </div>

            {/* Infill Density */}
            <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Densidade de Preenchimento (Infill):</span>
                <span className="font-bold text-indigo-400">{slicerInfillDensity}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={slicerInfillDensity}
                onChange={(e) => setSlicerInfillDensity(Number(e.target.value))}
                className="mt-2 w-full accent-indigo-500"
              />
            </div>

            {/* Infill Pattern */}
            <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-300">Padrão de Preenchimento</label>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {["Gyroid", "Grid", "Cubic", "Honeycomb"].map((pat) => (
                  <button
                    key={pat}
                    onClick={() => setSlicerInfillPattern(pat)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold transition cursor-pointer ${
                      slicerInfillPattern === pat
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-[#0d1320] border border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>

            {/* Supports Toggle */}
            <div className="rounded-xl bg-[#090d17] p-3.5 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-300">Gerar Suportes (Tree / Organic)</p>
                <p className="text-[10px] text-slate-500">Adiciona estruturas para overhangs</p>
              </div>
              <input
                type="checkbox"
                checked={slicerSupports}
                onChange={(e) => setSlicerSupports(e.target.checked)}
                className="h-4 w-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY & CAMERA */}
        {activeTab === "gallery" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              GALERIA DE FOTOS & CÂMERA (LITOFANIA 3D)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-[#090d17] p-3 text-center cursor-pointer hover:border-indigo-500 transition group"
              >
                <Upload className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition" />
                <span className="text-xs font-medium text-slate-300">Enviar Imagem</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <button
                type="button"
                onClick={startCamera}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-3 text-center cursor-pointer hover:bg-indigo-900/40 transition group"
              >
                <Camera className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-indigo-200">Tirar Foto com Câmera</span>
              </button>
            </div>

            {galleryPhotos.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Galeria de Capturas ({galleryPhotos.length}):
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => handleSelectGalleryPhoto(photo)}
                      className={`relative group cursor-pointer overflow-hidden rounded-xl border transition ${
                        referenceImage === photo.url
                          ? "border-indigo-500 ring-2 ring-indigo-500/50 scale-102"
                          : "border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <img src={photo.url} alt={photo.name} className="h-16 w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] text-slate-300 truncate text-center">
                        {photo.timestamp}
                      </div>
                      <button
                        onClick={(e) => handleDeleteGalleryPhoto(photo.id, e)}
                        title="Excluir foto"
                        className="absolute top-1 right-1 rounded-full bg-black/80 p-1 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {referenceImage && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Filtros de Pré-processamento:</span>
                  </span>
                  <button
                    onClick={removeReferenceImage}
                    className="text-[10px] text-slate-400 hover:text-red-400 transition"
                  >
                    Remover Foto
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "normal", label: "Normal" },
                    { id: "grayscale", label: "Preto & Branco" },
                    { id: "contrast", label: "Alto Contraste" },
                    { id: "edge", label: "Detecção Bordas" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleApplyFilter(f.id)}
                      className={`rounded-lg py-1.5 text-[10px] font-bold transition cursor-pointer ${
                        activeFilter === f.id
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-[#090d17] border border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate3D}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-indigo-200" />
            <span>{isGenerating ? "Processando..." : "Gerar com IA"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSTL}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 text-xs font-black shadow-lg shadow-blue-600/30 active:scale-98 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Baixar .STL Fatiável</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-98 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Enviar à Fila</span>
          </button>
        </div>
      </div>
    </div>
  );
};
