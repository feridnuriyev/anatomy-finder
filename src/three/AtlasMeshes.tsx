import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import type { CatalogPose } from "../anatomy/catalogLayout";
import type { BufferGeometry, Object3D } from "three";

interface Materials { base:MeshStandardMaterial; selected:MeshStandardMaterial; hover:MeshStandardMaterial; }
const disabledRaycast = () => {};
const AtlasMesh = memo(function AtlasMesh({id,geometry,materials,selected,interactive,onSelect,pose,explosion}:{id:string;geometry:BufferGeometry;materials:Materials;selected:boolean;interactive:boolean;onSelect?:(id:string)=>void;pose?:CatalogPose;explosion:number}) {
  const [hovered,setHovered] = useState(false);
  const group=useRef<Group>(null);
  const target=useMemo(()=>new Vector3(...(pose?.position??[0,0,0])).multiplyScalar(explosion),[pose,explosion]);
  const targetScale=1+((pose?.scale??1)-1)*explosion;
  useFrame((state,delta)=>{
    if(!group.current)return;
    if(group.current.position.distanceToSquared(target)>.000001 || Math.abs(group.current.scale.x-targetScale)>.0001){
      const speed=1-Math.exp(-8*Math.min(delta,.1));
      group.current.position.lerp(target,speed);
      group.current.scale.setScalar(group.current.scale.x+(targetScale-group.current.scale.x)*speed);
      state.invalidate();
    }
  });
  const canvas = useThree(state => state.gl.domElement);
  useEffect(() => { if(!hovered || !interactive)return; canvas.style.cursor="pointer"; return () => {canvas.style.cursor="grab";}; }, [hovered,interactive,canvas]);
  function enter(event:ThreeEvent<PointerEvent>) { if(!interactive)return; event.stopPropagation();setHovered(true); }
  const material=selected?materials.selected:hovered&&interactive?materials.hover:materials.base;
  return <group ref={group}><mesh name={id} geometry={geometry} dispose={null} material={material} raycast={interactive?Mesh.prototype.raycast:disabledRaycast}
    onPointerOver={enter} onPointerOut={()=>setHovered(false)} onClick={event=>{if(interactive && event.delta<5){event.stopPropagation();onSelect?.(id);}}}/></group>;
});

/** Reuse cached GPU geometry; only renderer-owned materials are disposed. */
export function AtlasMeshes({nodes,names,opacity=1,selectedNames=[],onSelect,interactive=true,poses,explosion=0}:{nodes:Record<string,Object3D>;names:string[];opacity?:number;selectedNames?:string[];onSelect?:(id:string)=>void;interactive?:boolean;poses?:Record<string,CatalogPose>;explosion?:number}) {
  const invalidate = useThree(state=>state.invalidate);
  const resources = useMemo(() => {
    const palettes = new Map<string,Materials>();
    const meshes = names.map(id=>{
      const node = nodes[id];
      if(!(node instanceof Mesh) || !(node.material instanceof MeshStandardMaterial)) throw new Error(`Missing anatomy object: ${id}`);
      const key=node.material.uuid;
      if(!palettes.has(key)) {
        const base=node.material.clone(); base.transparent=true;
        const selected=base.clone();selected.color.set("#a4cfc3");selected.emissive.set("#386359");selected.emissiveIntensity=.2;
        const hover=base.clone();hover.emissive.set("#477c75");hover.emissiveIntensity=.25;
        palettes.set(key,{base,selected,hover});
      }
      return {id,geometry:node.geometry,materials:palettes.get(key)!};
    });
    return {meshes,palettes};
  },[nodes,names]);
  useLayoutEffect(()=>{
    for(const palette of resources.palettes.values()) for(const material of Object.values(palette)){material.opacity=opacity;material.depthWrite=opacity>.95;}
    invalidate();
  },[opacity,resources,invalidate]);
  useEffect(()=>()=>{for(const palette of resources.palettes.values())for(const material of Object.values(palette))material.dispose();},[resources]);
  return <group visible={opacity>.008} dispose={null}>{resources.meshes.map(mesh=><AtlasMesh key={mesh.id} {...mesh} selected={selectedNames.includes(mesh.id)} interactive={interactive&&opacity>.32} onSelect={onSelect} pose={poses?.[mesh.id]} explosion={explosion}/>)}</group>;
}
