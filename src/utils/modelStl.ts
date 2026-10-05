import { BoxGeometry, ExtrudeGeometry, Group, LatheGeometry, Mesh, Path, Shape, Vector2 } from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontData from "../assets/helvetiker_regular.typeface.json";

type ModelType = "vaso" | "placa" | "suporte" | "chaveiro";
const font = new FontLoader().parse(fontData);

export function createModel(type: ModelType, text: string, scalePercent: number, wall: number): Group {
  const group = new Group();
  if (type === "vaso") {
    // Perfil fechado: fundo de 2 mm, parede de 2 mm e abertura no topo.
    const profile = [[0, 0], [25, 0], [35, 80], [35-wall, 80], [25-wall, wall], [0, wall], [0, 0]];
    const vase = new Mesh(new LatheGeometry(profile.map(([x,y]) => new Vector2(x,y)), 96));
    vase.rotation.x = Math.PI / 2;
    group.add(vase);
  } else if (type === "suporte") {
    // Seção lateral contínua de um suporte de mesa, com base e aba frontal.
    const section = new Shape();
    section.moveTo(0, 0);
    for (const [x,y] of [[65,0],[65,8],[35,70],[29,67],[57,6],[6,6],[6,15],[0,15],[0,0]]) section.lineTo(x,y);
    const stand = new Mesh(new ExtrudeGeometry(section, {depth:50, bevelEnabled:false}));
    stand.rotation.x = Math.PI / 2;
    group.add(stand);
  } else {
    const width = type === "placa" ? 100 : 70;
    const height = type === "placa" ? 50 : 25;
    const depth = type === "placa" ? 3 : 4;
    if (type === "chaveiro") {
      const shape = new Shape();
      shape.moveTo(-width/2,-height/2);
      shape.lineTo(width/2,-height/2); shape.lineTo(width/2,height/2);
      shape.lineTo(-width/2,height/2); shape.closePath();
      const hole = new Path();
      hole.absarc(-width/2+7,0,3,0,Math.PI*2,true);
      shape.holes.push(hole);
      group.add(new Mesh(new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:32})));
    } else {
      const base = new Mesh(new BoxGeometry(width,height,depth));
      base.position.z = depth/2;
      group.add(base);
    }
    const safeText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 .!?,_-]/g, "").trim().slice(0,24);
    if (safeText) {
      const geometry = new TextGeometry(safeText,{font,size:8,depth:1.2,curveSegments:6,bevelEnabled:false});
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox!;
      const textWidth = bounds.max.x - bounds.min.x;
      const available = width - (type === "chaveiro" ? 22 : 10);
      const factor = Math.min(1, available / Math.max(textWidth,1));
      const label = new Mesh(geometry);
      label.scale.set(factor,factor,1);
      label.position.set(-textWidth*factor/2+(type === "chaveiro" ? 6 : 0),-4*factor,depth-0.05);
      group.add(label);
    }
  }
  group.scale.setScalar(scalePercent/100);
  group.updateMatrixWorld(true);
  return group;
}

export function modelStl(type: ModelType, text: string, scalePercent: number, wall: number): string {
  const model = createModel(type,text,scalePercent,wall);
  try { return new STLExporter().parse(model); }
  finally { model.traverse(object => { if (object instanceof Mesh) object.geometry.dispose(); }); }
}

export function downloadModelStl(type: ModelType, text: string, scalePercent: number, wall: number) {
  const blob = new Blob([modelStl(type,text,scalePercent,wall)],{type:"model/stl"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `versatil-${type}-${scalePercent}pct.stl`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
