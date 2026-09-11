import { useEffect, useMemo, useRef } from "react";
import type { ComponentRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Vec3 } from "../types/anatomy";
import type { QuaternionTuple } from "../components/OrientationGizmo";
const BODY_TARGET:Vec3=[0,.15,0];
export function CameraRig({resetKey,inspection=false,distance=9.2,catalog=false,target=BODY_TARGET,onOrientationChange}:{resetKey:number;inspection?:boolean;distance?:number;catalog?:boolean;target?:Vec3;onOrientationChange?:(quaternion:QuaternionTuple)=>void}) {
  const controls=useRef<ComponentRef<typeof OrbitControls>>(null);
  const {camera,invalidate}=useThree();
  const moving=useRef(false);
  const previousTarget=useRef(new Vector3(...BODY_TARGET));
  const targetVector=useMemo(()=>new Vector3(...target),[target]);
  const destination=useMemo(()=>targetVector.clone().add(new Vector3(0,.15,distance)),[distance,targetVector]);
  const emitOrientation=()=>onOrientationChange?.(camera.quaternion.toArray() as QuaternionTuple);
  useEffect(()=>{
    if(inspection)return;
    const offset=targetVector.clone().sub(previousTarget.current);
    camera.position.add(offset);
    controls.current?.target.copy(targetVector);
    controls.current?.update();
    emitOrientation();
    previousTarget.current.copy(targetVector);
    moving.current=true;
    invalidate();
  },[distance,resetKey,inspection,invalidate,targetVector,camera,onOrientationChange]);
  useFrame((state,delta)=>{
    if(inspection||!moving.current)return;
    const speed=1-Math.exp(-8*Math.min(delta,.1));
    camera.position.lerp(destination,speed);
    controls.current?.target.lerp(targetVector,speed);
    controls.current?.update();
    if(camera.position.distanceToSquared(destination)<.00001)moving.current=false;
    else state.invalidate();
  });
  return <OrbitControls key={resetKey} ref={controls} makeDefault enablePan={catalog} enableZoom minDistance={inspection?.05:catalog?3:6} maxDistance={inspection?20:Math.max(12,distance*2)} minPolarAngle={.25} maxPolarAngle={Math.PI-.25} target={target} enableDamping dampingFactor={.09} rotateSpeed={.65} onStart={()=>{moving.current=false;}} onChange={emitOrientation}/>;
}
