import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { createModel, modelStl } from "../src/utils/modelStl";

for (const type of ["vaso", "placa", "suporte", "chaveiro"] as const) {
  const model = createModel(type, "Versátil 3D", 100, 2);
  const bounds = new Box3().setFromObject(model);
  const dimensions = bounds.getSize(new Vector3());
  assert.ok(dimensions.x > 0 && dimensions.y > 0 && dimensions.z > 0, `${type}: volume vazio`);
  assert.ok(bounds.min.z >= -0.001, `${type}: base fora do plano de impressão`);
  const stl = modelStl(type, "Versátil 3D", 100, 2);
  assert.match(stl, /^solid exported/);
  assert.match(stl, /endsolid exported/);
  assert.doesNotMatch(stl, /NaN|Infinity/);
  const vertices = [...stl.matchAll(/vertex\s+([-\deE.+]+)\s+([-\deE.+]+)\s+([-\deE.+]+)/g)].map(match => match.slice(1).map(Number));
  assert.ok(vertices.length >= 36, `${type}: malha incompleta`);
  assert.equal(vertices.length % 3, 0);
  let volume = 0;
  for (let index = 0; index < vertices.length; index += 3) {
    const [a,b,c] = vertices.slice(index,index+3).map(vertex => new Vector3(...vertex as [number,number,number]));
    volume += a.dot(b.cross(c)) / 6;
  }
  assert.ok(volume > 0, `${type}: normais invertidas ou volume inválido (${volume})`);
  const smaller = new Box3().setFromObject(createModel(type,"Versátil 3D",50,2)).getSize(new Vector3());
  assert.ok(Math.abs(smaller.x / dimensions.x - 0.5) < 0.001, `${type}: escala incorreta`);
  console.log(`STL passed: ${type}, ${vertices.length/3} triangles, dimensions ${dimensions.toArray().map(value => value.toFixed(1)).join(" × ")} mm`);
}
