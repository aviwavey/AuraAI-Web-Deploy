import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';

// The same authored model, palette and reversible materials used by Lucid.
const palette=['#e8ad9d','#82b6aa','#d77e68','#b397d0','#e6aa5b','#e9c55f','#b4bf7b','#8eaac4'];
const modelURL=new URL('../aura-dashboard/visuals/aura-orb-v001.glb',location.href).href;
const standalone=location.hostname==='127.0.0.1'||location.hostname==='localhost';
const notify=(type)=>parent.postMessage({type},location.origin);
let renderer,asset,visible=true,dark=new URLSearchParams(location.search).get('theme')==='dark',rings=[],days=new WeakMap(),core;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,40),root=new T.Group();
scene.add(root);camera.position.set(0,0,4.2);camera.lookAt(0,0,0);
let daylight,dayRings,nightRings;
const materials=o=>Array.isArray(o.material)?o.material:[o.material];
function studio(night){
 const s=new T.Scene();s.background=night?new T.Color().setRGB(.008,.007,.005):new T.Color().setRGB(1.2,1.2,1.2);
 const cards=[];
 for(const [w,h,x,y,z,strength] of [[3.6,6,-4,3,3,night?1.7:5],[.45,5,4,1,-2,night?2.2:10],[5,2,0,5,-2,night?1.1:3.6],[4,4,1,-3,4,night?.4:1.6]]){
  const m=new T.MeshBasicMaterial({color:new T.Color().setRGB(strength,strength*(night?.78:1),strength*(night?.42:1)),side:T.DoubleSide,toneMapped:false});
  const p=new T.Mesh(new T.PlaneGeometry(w,h),m);p.position.set(x,y,z);p.lookAt(0,0,0);cards.push(p);s.add(p);
 }
 const g=new T.PMREMGenerator(renderer),env=g.fromScene(s,.025);g.dispose();cards.forEach(p=>{p.geometry.dispose();p.material.dispose();});return env;
}
function applyTheme(){
 document.documentElement.style.colorScheme=dark?"dark":"light";
 if(!asset)return;
 asset.traverse(o=>{
  if(!(o instanceof T.Mesh))return;
  for(const m of materials(o)){
   if(o.name==='RadiantCore'){m.color.set(dark?0x030303:0xfff9ee);continue;}
   if(!(m instanceof T.MeshStandardMaterial))continue;
   if(/^OrbitRing_[12]$/.test(o.name)){
    m.envMap=(dark?nightRings:dayRings).texture;m.envMapIntensity=dark?.55:1.05;m.roughness=dark?.28:.14;
    m.color.copy(dark?new T.Color('#c4b48a'):new T.Color().setRGB(1,.66,.22));m.emissiveIntensity=0;
   }else if(o.name==='PearlescentShell'){
    if(!days.has(m))days.set(m,{color:m.color.clone(),roughness:m.roughness,metalness:m.metalness,opacity:m.opacity,envMapIntensity:m.envMapIntensity,transmission:m.transmission,specularIntensity:m.specularIntensity});
    const d=days.get(m);m.color.copy(dark?new T.Color('#0a0908'):d.color);m.roughness=dark?.6:d.roughness;m.metalness=dark?.4:d.metalness;m.opacity=dark?.035:d.opacity;m.envMapIntensity=dark?.08:d.envMapIntensity;
    if(m instanceof T.MeshPhysicalMaterial){m.transmission=dark?0:d.transmission;m.specularIntensity=dark?.12:d.specularIntensity;}
   }else if(/^LightNode_|^LuminousFilament_/.test(o.name)){
    const light=/^LightNode_/.test(o.name);m.envMap=dark?null:daylight.texture;m.envMapIntensity=.75;m.metalness=dark?.92:.68;m.emissiveIntensity=dark?(light?.12:.045):(light?.9:.55);
   }
   m.needsUpdate=true;
  }
 });render(0);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();}
function render(t){
 if(!asset)return;
 root.rotation.set(Math.sin(t*.19)*.24,t*.13,Math.sin(t*.14)*.18);
 rings.forEach(({object,rest},i)=>{const q=new T.Quaternion().setFromEuler(new T.Euler(Math.sin(t*(i?.17:.21))*.45,t*(i?-.19:.23),t*(i?-.16:.2)));object.quaternion.copy(rest).multiply(q);});
 renderer.render(scene,camera);
}
try{
 renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;document.body.append(renderer.domElement);
 scene.add(new T.HemisphereLight(0xffffff,0xbddfdd,1));const key=new T.DirectionalLight(0xfff6e7,2);key.position.set(4,7,6);const fill=new T.PointLight(0xf19bd2,3,12);fill.position.set(-4,2.5,3.5);const rim=new T.PointLight(0x5be0db,3,12);rim.position.set(4,1.5,-2.5);scene.add(key,fill,rim);
 const gen=new T.PMREMGenerator(renderer),room=new RoomEnvironment();daylight=gen.fromScene(room,.015);room.dispose();gen.dispose();dayRings=studio(false);nightRings=studio(true);
 const gltf=await new GLTFLoader().loadAsync(standalone?'https://aviwavey.com/AuraAI/aura-dashboard/visuals/aura-orb-v001.glb':modelURL);asset=gltf.scene;
 const gold=new T.Color('#efd08a');
 asset.traverse(o=>{
  if(!(o instanceof T.Mesh))return;
  const match=/^LuminousFilament_(\d+)$/.exec(o.name)||/^LightNode_(\d+)_\d+$/.exec(o.name);
  if(match){const tint=new T.Color(palette[Number(match[1])%palette.length]).lerp(gold,.18);for(const m of materials(o)){if(!(m instanceof T.MeshStandardMaterial))continue;m.color.copy(tint);m.emissive.copy(tint);m.emissiveIntensity=/^LightNode_/.test(o.name)?.65:.2;m.metalness=.82;m.roughness=.22;}}
  if(/^OrbitRing_[12]$/.test(o.name))rings.push({object:o,rest:o.quaternion.clone()});
  if(o.name==='RadiantCore'){
   core=o;const old=materials(o),m=new T.MeshBasicMaterial({color:0xfff9ee,transparent:true,depthTest:true,depthWrite:true,toneMapped:false});o.material=m;old.forEach(x=>x.dispose());o.renderOrder=-1;
   m.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 coreNormal; varying vec3 coreView;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncoreNormal=normalize(normalMatrix*normal);coreView=-(modelViewMatrix*vec4(position,1.)).xyz;');shader.fragmentShader='varying vec3 coreNormal; varying vec3 coreView;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a*=smoothstep(.02,.92,max(0.,dot(normalize(coreNormal),normalize(coreView))));if(diffuseColor.a<.001)discard;\n#include <opaque_fragment>');};m.customProgramCacheKey=()=> 'aura-contained-core-v1';
  }
 });
 const bounds=new T.Box3().setFromObject(asset),centre=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());asset.position.sub(centre);root.add(asset);root.scale.setScalar(2.25/Math.max(size.x,size.y,size.z));resize();applyTheme();notify('aura-orb-ready');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');let last=0;function tick(ms){requestAnimationFrame(tick);if(!visible||document.hidden||reduce.matches||ms-last<33)return;last=ms;render(ms/1000);}requestAnimationFrame(tick);
 addEventListener('resize',resize);addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='aura-orb-theme'){dark=e.data.dark===true;applyTheme();}if(e.data?.type==='aura-orb-visible')visible=e.data.visible===true;});reduce.addEventListener('change',()=>render(0));
}catch(error){console.error('Aura orb could not render',error);notify('aura-orb-error');}
