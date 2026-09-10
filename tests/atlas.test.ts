import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { atlasManifest } from "../src/data/atlasManifest.ts";
import { structures } from "../src/data/structures.ts";
import { catalogCameraDistance, catalogLayout } from "../src/anatomy/catalogLayout.ts";

test("every atlas selection resolves to source metadata and existing meshes",()=>{
  assert.equal(new Set(structures.map(s=>s.id)).size,structures.length);
  const concrete=atlasManifest.structures.filter(s=>!s.isGroup);
  for(const structure of atlasManifest.structures){
    assert.ok(structure.meshNames.length>0);
    assert.ok(structure.elementIds.length>0);
    assert.ok(structure.fmaId.startsWith("FMA"));
    for(const name of structure.meshNames)assert.ok(concrete.some(s=>s.id===name&&s.layer===structure.layer));
    assert.ok(structures.find(s=>s.id===structure.id)?.source?.url.startsWith("https://"));
  }
  for(const bone of ["humerus","radius","ulna","femur","tibia","fibula"])
    for(const side of ["left","right"])assert.ok(concrete.some(s=>s.id===`${side}-${bone}`));
  assert.ok(concrete.find(s=>s.id==="left-femur")!.bounds![0][0]>0);
  assert.ok(concrete.find(s=>s.id==="right-femur")!.bounds![1][0]<0);
});

test("generated GLBs are intact, versioned, and cover every concrete structure",()=>{
  for(const [layer,asset] of Object.entries(atlasManifest.layers)){
    const data=readFileSync(new URL(`../public${asset.url.split("?")[0]}`,import.meta.url));
    assert.equal(data.readUInt32LE(0),0x46546c67);
    assert.equal(data.readUInt32LE(4),2);
    assert.equal(data.readUInt32LE(8),data.length);
    assert.equal(asset.bytes,data.length);
    assert.ok(asset.url.endsWith(createHash("sha256").update(data).digest("hex").slice(0,12)));
    const length=data.readUInt32LE(12);
    const gltf=JSON.parse(data.subarray(20,20+length).toString());
    const binary=data.subarray(28+length);
    const expected=atlasManifest.structures.filter(s=>s.layer===layer&&!s.isGroup);
    assert.equal(gltf.meshes.length,expected.length);
    for(const record of expected)assert.ok(gltf.nodes.some((node:{name:string})=>node.name===record.id));
    for(const mesh of gltf.meshes){
      const primitive=mesh.primitives[0];
      const positions=gltf.accessors[primitive.attributes.POSITION];
      const indices=gltf.accessors[primitive.indices];
      assert.ok(positions.count>0);
      assert.equal(indices.count%3,0);
      const view=gltf.bufferViews[indices.bufferView];
      for(let index=0;index<indices.count;index++)assert.ok(binary.readUInt32LE(view.byteOffset+index*4)<positions.count);
      assert.ok(positions.min.every(Number.isFinite)&&positions.max.every(Number.isFinite));
    }
    assert.ok(gltf.asset.copyright.includes("BodyParts3D"));
  }
});

test("catalog fits each piece into a separate finite cell on wide and narrow screens",()=>{
  const items=atlasManifest.structures.filter(s=>!s.isGroup);
  for(const aspect of [.4,1,2]){
    const layout=catalogLayout(items,aspect);
    assert.equal(Object.keys(layout.poses).length,items.length);
    const centers=new Set<string>();
    for(const item of items){
      const pose=layout.poses[item.id];
      assert.ok(pose.scale>0&&Number.isFinite(pose.scale));
      assert.ok(pose.position.every(Number.isFinite));
      const center=item.bounds![0].map((v,i)=>(v+item.bounds![1][i])/2*pose.scale+pose.position[i]);
      const key=center.map(v=>v.toFixed(3)).join(",");
      assert.ok(!centers.has(key));centers.add(key);
      const largest=Math.max(...item.bounds![1].map((v,i)=>v-item.bounds![0][i]));
      assert.ok(largest*pose.scale<=.620001);
    }
  }
});

test("catalog camera reserves an unobstructed UI-safe frame",()=>{
  const frame={width:12,height:7};
  const aspect=16/9;
  const distance=catalogCameraDistance(frame,aspect);
  const visibleHeight=2*distance*Math.tan(43*Math.PI/360)/1.2;
  assert.ok(visibleHeight*.76>=frame.height);
  assert.ok(visibleHeight*aspect*.76>=frame.width);
  assert.ok(distance>catalogCameraDistance(frame,aspect,43,1,1));
});

test("every selectable structure has concise sourced educational copy",()=>{
  for(const structure of structures){
    const sentenceCount=structure.description.split(/[.!?](?:\s|$)/).filter(Boolean).length;
    assert.ok(sentenceCount>=2&&sentenceCount<=4,`${structure.id} has ${sentenceCount} sentences`);
    assert.ok(structure.function.length>20,`${structure.id} is missing a useful function summary`);
    assert.ok(structure.contentSource?.url.startsWith("https://openstax.org/"));
    assert.equal(structure.contentSource?.license,"CC BY-NC-SA 4.0");
  }
});
