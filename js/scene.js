import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const COLORS={mint:0x61e9be,solar:0x71bfe3,night:0x07111b,day:0x163748};
const panelDark=new THREE.MeshStandardMaterial({color:0x132c40,metalness:.7,roughness:.28});
const metal=new THREE.MeshStandardMaterial({color:0x7d9ca0,metalness:.76,roughness:.32});
const white=new THREE.MeshStandardMaterial({color:0xc4d9d9,metalness:.30,roughness:.43});
const graphite=new THREE.MeshStandardMaterial({color:0x263640,metalness:.45,roughness:.45});
function box(w,h,d,mat,x=0,y=0,z=0){const v=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);v.position.set(x,y,z);v.castShadow=true;v.receiveShadow=true;return v;}
function cyl(r,h,material,x=0,y=0,z=0){const v=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14),material);v.position.set(x,y,z);v.castShadow=true;return v;}
function labelSprite(title,color='#a9f2d4'){
 const canvas=document.createElement('canvas');canvas.width=440;canvas.height=108;
 const g=canvas.getContext('2d');g.fillStyle='rgba(7,19,25,.84)';g.fillRect(0,0,canvas.width,canvas.height);g.fillStyle=color;g.fillRect(0,0,5,108);g.font='700 30px Arial';g.fillText(title,24,65);g.fillStyle='rgba(133,182,185,.6)';g.fillRect(24,81,365,1);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false,transparent:true}));s.scale.set(9.7,2.39,1);return s;
}
function panelTexture(){const c=document.createElement('canvas');c.width=160;c.height=256;const g=c.getContext('2d');g.fillStyle='#112c41';g.fillRect(0,0,160,256);
 for(let x=0;x<4;x++)for(let y=0;y<8;y++){
   const X=4+x*38,Y=4+y*31;const grd=g.createLinearGradient(X,Y,X+34,Y+28);grd.addColorStop(0,'#244d62');grd.addColorStop(.46,'#1b3b55');grd.addColorStop(1,'#14293e');g.fillStyle=grd;g.fillRect(X,Y,34,27);
   g.strokeStyle='rgba(109,171,187,.22)';g.strokeRect(X+.5,Y+.5,33,26);
 }
 g.strokeStyle='#86afc0';g.lineWidth=3;g.strokeRect(1,1,158,254);
 g.fillStyle='rgba(206,241,237,.15)';g.fillRect(0,22,158,3);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const assetProps={pv:{target:new THREE.Vector3(-17,0,-3),distance:39},bess:{target:new THREE.Vector3(29,1,-16),distance:18},genset:{target:new THREE.Vector3(29,1,12),distance:19},esp:{target:new THREE.Vector3(30,1,26),distance:16}};
export class MicrogridScene{
 constructor(mount,{onAssetClick}={}){
  this.mount=mount;this.onAssetClick=onAssetClick;this.mode='feasibility';this.hour=12;this.paused=false;this.disposed=false;this.elapsed=0;this.assetObjects=[];this.objectParents=new Map();this.pulses=[];this.fadeLabels=[];
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.mount.appendChild(this.renderer.domElement);
  this.scene=new THREE.Scene();this.scene.fog=new THREE.FogExp2(0x0b1c26,.0071);
  this.camera=new THREE.PerspectiveCamera(38,1,.1,300);this.camera.position.set(45,37,54);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(4,0,-1);this.controls.enableDamping=true;this.controls.dampingFactor=.056;this.controls.minDistance=13;this.controls.maxDistance=102;this.controls.maxPolarAngle=Math.PI/2.02;this.controls.minPolarAngle=.25;this.controls.enablePan=true;this.controls.autoRotate=true;this.controls.autoRotateSpeed=.28;
  this.ambient=new THREE.HemisphereLight(0xb9e4ff,0x182a2d,2.2);this.scene.add(this.ambient);
  this.sunLight=new THREE.DirectionalLight(0xffedcf,3.3);this.sunLight.position.set(-25,42,-30);this.sunLight.castShadow=true;this.sunLight.shadow.mapSize.set(2048,2048);this.sunLight.shadow.camera.left=-72;this.sunLight.shadow.camera.right=72;this.sunLight.shadow.camera.top=65;this.sunLight.shadow.camera.bottom=-65;this.sunLight.shadow.camera.near=1;this.sunLight.shadow.camera.far=145;this.sunLight.shadow.bias=-.0002;this.scene.add(this.sunLight);
  this.fill=new THREE.PointLight(COLORS.mint,17,51);this.fill.position.set(28,9,-12);this.scene.add(this.fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,150),new THREE.MeshStandardMaterial({color:0x29362c,roughness:1,metalness:0}));ground.rotation.x=-Math.PI/2;ground.position.y=-.20;ground.receiveShadow=true;this.scene.add(ground);
  const groundTop=new THREE.Mesh(new THREE.PlaneGeometry(112,83),new THREE.MeshStandardMaterial({color:0x38473d,roughness:.98}));groundTop.rotation.x=-Math.PI/2;groundTop.position.y=-.16;groundTop.receiveShadow=true;this.scene.add(groundTop);
  const grid=new THREE.GridHelper(116,58,0x47776c,0x304f4a);grid.position.y=-.145;grid.material.transparent=true;grid.material.opacity=.18;this.scene.add(grid);
  this.drawEarth();this.makeHardware();this.makeSolarArray('feasibility');this.makeFlow();this.makeSun();
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.mouseDown=null;
  this.onDown=e=>{this.mouseDown={x:e.clientX,y:e.clientY};this.controls.autoRotate=false;};
  this.onClick=e=>{if(!this.mouseDown||Math.hypot(this.mouseDown.x-e.clientX,this.mouseDown.y-e.clientY)>7)return;const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects(this.assetObjects,true);if(hits.length){let cur=hits[0].object;while(cur&&!cur.userData.asset)cur=cur.parent;if(cur&&cur.userData.asset)this.focusAsset(cur.userData.asset,true);}};
  this.renderer.domElement.addEventListener('pointerdown',this.onDown);this.renderer.domElement.addEventListener('pointerup',this.onClick);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(mount);this.resize();this.setTime(12);this.last=performance.now();this.animate=this.animate.bind(this);this.frame=requestAnimationFrame(this.animate);
 }
 drawEarth(){const scatter=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0x53614e,roughness:1});const geo=new THREE.IcosahedronGeometry(.35,0);for(let i=0;i<250;i++){const a=Math.sin(i*27.7)*.5+.5,b=Math.sin(i*13.1+1.25)*.5+.5;const x=(a-.5)*105,z=(b-.5)*73;if(x>-35&&x<39&&z>-28&&z<34)continue;const m=new THREE.Mesh(geo,mat);m.position.set(x,-.10,z);m.scale.set(.5+a*1.6,.22,.35+b*1.1);m.rotation.y=i;scatter.add(m)}this.scene.add(scatter);
  for(let i=-1;i<=1;i++){const trench=box(2,.09,69,new THREE.MeshStandardMaterial({color:0x43554c,roughness:1}),-38+i*2,-.11,0);trench.receiveShadow=true;this.scene.add(trench)}
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(84,.07,70)),new THREE.LineBasicMaterial({color:0x749887,transparent:true,opacity:.18}));edge.position.set(0,-.10,0);this.scene.add(edge);
 }
 register(group,id){group.userData.asset=id;this.assetObjects.push(group);return group;}
 makeHardware(){this.hardware=new THREE.Group();this.scene.add(this.hardware);
  // ESS battery storage units, elevated concrete slabs and cabinet ventilation.
  this.bessGroup=this.register(new THREE.Group(),'bess');this.hardware.add(this.bessGroup);
  const slab=box(13,.36,5.7,new THREE.MeshStandardMaterial({color:0x6d7771,roughness:.9}),29,.08,-16);this.bessGroup.add(slab);
  this.batteryIndicators=[];
  for(let i=0;i<3;i++){const x=24.7+i*4.3,z=-16;
    const b=box(3.35,4.7,3.2,white,x,2.6,z);this.bessGroup.add(b);
    this.bessGroup.add(box(2.9,3.8,.085,new THREE.MeshStandardMaterial({color:0xcbdede,metalness:.17,roughness:.48}),x,2.65,z+1.68));
    for(let k=0;k<11;k++){const slot=box(2.5,.065,.023,graphite,x,1.13+k*.27,z+1.76);this.bessGroup.add(slot)}
    this.bessGroup.add(box(3.2,.15,.10,metal,x,4.84,z+1.63));
    const led=box(1.2,.075,.082,new THREE.MeshBasicMaterial({color:0x57d4ae}),x,4.45,z+1.76);this.bessGroup.add(led);this.batteryIndicators.push(led);
  }
  const label=labelSprite('BATTERY STORAGE / BESS');label.position.set(29,8,-16);this.bessGroup.add(label);
  // Power conversion equipment
  this.inverterGroup=new THREE.Group();this.hardware.add(this.inverterGroup);
  for(let i=0;i<3;i++){const x=24.5+i*4.5;this.inverterGroup.add(box(3.1,3.25,1.3,white,x,2.1,-5));this.inverterGroup.add(box(1.7,.38,.052,graphite,x,2.9,-4.31));this.inverterGroup.add(box(.83,.06,.055,new THREE.MeshBasicMaterial({color:0x4bdcae}),x,3.32,-4.28));this.inverterGroup.add(box(3.4,.16,1.6,metal,x,.43,-5));}
  const labInv=labelSprite('SOLAR INVERTERS','#a6e2f6');labInv.position.set(29,6.6,-5);this.inverterGroup.add(labInv);
  // Generator skid and casing
  this.gensetGroup=this.register(new THREE.Group(),'genset');this.hardware.add(this.gensetGroup);
  this.gensetGroup.add(box(10,.6,5.2,graphite,29,.3,11));this.gensetShell=box(9,3.8,4.6,new THREE.MeshStandardMaterial({color:0xa7b7ae,metalness:.25,roughness:.55}),29,2.45,11);this.gensetGroup.add(this.gensetShell);
  const gensetHighlight=box(8.2,.18,.06,new THREE.MeshBasicMaterial({color:0xe7bb60}),29,4.18,13.34);this.gensetGroup.add(gensetHighlight);this.gensetHighlight=gensetHighlight;
  for(let i=0;i<10;i++){this.gensetGroup.add(box(3.7,.10,.052,graphite,26.8,1.15+i*.27,13.38));this.gensetGroup.add(box(2.7,.10,.052,graphite,31.7,1.15+i*.27,13.38));}
  this.gensetGroup.add(box(3.1,.13,.06,new THREE.MeshBasicMaterial({color:0xf3d883}),27.3,3.65,13.4));
  const exhaust=cyl(.6,2.5,metal,32.2,5.35,10.1);this.gensetGroup.add(exhaust);this.gensetGroup.add(cyl(.9,.25,graphite,32.2,6.65,10.1));
  const genLab=labelSprite('DIESEL GENERATOR','#f1ce87');genLab.position.set(29,9,11);this.gensetGroup.add(genLab);
  // ESP wellhead and VSD panel
  this.espGroup=this.register(new THREE.Group(),'esp');this.hardware.add(this.espGroup);
  const wellPad=box(10,.26,8,new THREE.MeshStandardMaterial({color:0x818c7e,roughness:.87}),29,.03,26);this.espGroup.add(wellPad);
  const casing=cyl(.55,4,metal,29,2.35,26);this.espGroup.add(casing);
  this.espGroup.add(cyl(.89,.3,new THREE.MeshStandardMaterial({color:0xbea36d,metalness:.6,roughness:.3}),29,4.42,26));
  const horizontal=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,5.8,10),new THREE.MeshStandardMaterial({color:0x8fc7b2,metalness:.35,roughness:.4}));horizontal.rotation.z=Math.PI/2;horizontal.position.set(31,3.55,26);this.espGroup.add(horizontal);
  const pipeDown=cyl(.13,1.4,metal,33.8,2.85,26);this.espGroup.add(pipeDown);
  this.espGroup.add(box(2.7,3.4,1.7,white,24,1.9,26));this.espGroup.add(box(2.1,.45,.08,graphite,24,2.45,26.9));this.espGroup.add(box(.7,.08,.06,new THREE.MeshBasicMaterial({color:0x5debc4}),24,2.91,26.95));
  const ell=labelSprite('ESP WELL / VSD','#b8e7fb');ell.position.set(29,7.5,26);this.espGroup.add(ell);
  // AC distribution / cable routing — conceptual connection only.
  const bus=box(2,.24,34,new THREE.MeshStandardMaterial({color:0x3e6c64,metalness:.4,roughness:.5}),29,.12,5);this.hardware.add(bus);
  for(const z of[-16,-5,11,26]){const link=box(.4,.1,4,metal,29,-.01,z);this.hardware.add(link)}
 }
 makeSolarArray(mode){if(this.pvGroup){this.scene.remove(this.pvGroup);this.pvGroup.traverse(o=>{if(o.geometry&&o.geometry !== this.sharedGeom)o.geometry.dispose()});this.assetObjects=this.assetObjects.filter(o=>o!==this.pvGroup)}
  this.pvGroup=this.register(new THREE.Group(),'pv');this.scene.add(this.pvGroup);
  const rows=mode==='supplier'?13:12;const cols=mode==='supplier'?54:39; // 702 or 468 illustrative modules.
  const count=rows*cols;const frameGeo=new THREE.BoxGeometry(.89,.04,1.42);const faceGeo=new THREE.PlaneGeometry(.83,1.35);
  const faceMat=new THREE.MeshStandardMaterial({map:panelTexture(),color:0xd5f2f6,metalness:.21,roughness:.3,side:THREE.DoubleSide});
  const frames=new THREE.InstancedMesh(frameGeo,panelDark,count);const faces=new THREE.InstancedMesh(faceGeo,faceMat,count);frames.castShadow=true;frames.receiveShadow=true;faces.receiveShadow=true;
  const d=new THREE.Object3D();let id=0;const pitch=mode==='supplier'?.91:1.15;const left= -28;const top=-26;
  const tilt=1.15;for(let r=0;r<rows;r++){const z=top+r*3.6;for(let c=0;c<cols;c++){const x=left+c*pitch;d.position.set(x,1.06,z);d.rotation.set(-tilt,0,0);d.updateMatrix();frames.setMatrixAt(id,d.matrix);d.position.y+=.036;d.updateMatrix();faces.setMatrixAt(id,d.matrix);id++;}}
  frames.instanceMatrix.needsUpdate=true;faces.instanceMatrix.needsUpdate=true;this.pvGroup.add(frames,faces);
  const footMat=metal;for(let r=0;r<rows;r++){const z=top+r*3.6;for(let c=0;c<cols;c+=4){const x=left+c*pitch;this.pvGroup.add(box(.12,.86,.14,footMat,x,.42,z+.39));}}
  const tag=labelSprite(mode==='supplier'?'PV ARRAY / 456 kWp':'PV ARRAY / 304 kWp','#9fdaf5');tag.position.set(-11,6,-29);this.pvGroup.add(tag);
  this.pvGroup.userData.mode=mode;this.mode=mode;
  // Vendor option has three inverters, feasibility model two. Hide unused inverter.
  this.inverterGroup.children.forEach((o)=>{if(o.type==='Sprite')return;o.visible=true});
  if(mode==='feasibility'){this.inverterGroup.children.slice(8,12).forEach(o=>o.visible=false)}
 }
 makeFlow(){const paths=[
  {id:'pv',from:[-9,2,-21],to:[24,.7,-5],color:0x86d8ee},
  {id:'battery',from:[29,2,-14],to:[29,.6,1],color:0x62e8b7},
  {id:'load',from:[29,.65,2],to:[29,2,24],color:0x9affd6},
  {id:'generator',from:[29,1,11],to:[29,.7,4],color:0xf0b86b}
 ];
  for(const p of paths){const a=new THREE.Vector3(...p.from),b=new THREE.Vector3(...p.to);const mid=a.clone().lerp(b,.5);mid.y+=2.1;const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
   const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.055,6,false),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.32}));this.scene.add(tube);
   const dots=[];for(let n=0;n<5;n++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.19,9,9),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.92}));dot.position.copy(curve.getPoint(n/5));this.scene.add(dot);dots.push(dot)}this.pulses.push({curve,dots,id:p.id});
  }
 }
 makeSun(){this.sunOrb=new THREE.Mesh(new THREE.SphereGeometry(3,18,18),new THREE.MeshBasicMaterial({color:0xf2d8a0,fog:false}));this.scene.add(this.sunOrb);this.sunHalo=new THREE.Sprite(new THREE.SpriteMaterial({color:0xf7d899,transparent:true,opacity:.33}));this.sunHalo.scale.set(12,12,1);this.scene.add(this.sunHalo);
  const dust=new THREE.BufferGeometry();const array=[];for(let i=0;i<280;i++){array.push((Math.sin(i*73)*.5+.5)*115-57,Math.sin(i*61)*.45+5+(i%8), (Math.sin(i*23+6)*.5+.5)*85-42)}dust.setAttribute('position',new THREE.Float32BufferAttribute(array,3));this.particles=new THREE.Points(dust,new THREE.PointsMaterial({color:0xb9e9ca,size:.09,transparent:true,opacity:.28}));this.scene.add(this.particles);
 }
 setTime(hour){this.hour=hour;const solarFactor=Math.max(0,Math.sin(Math.PI*(hour-6)/12));const bright=Math.max(0,Math.min(1,solarFactor*1.13));const nightColor=new THREE.Color(COLORS.night),dayColor=new THREE.Color(COLORS.day);const bg=nightColor.clone().lerp(dayColor,bright);this.scene.background=bg;this.scene.fog.color=bg;
  this.sunOrb.position.set(-45+hour/24*95,3+Math.max(0,solarFactor)*50,-43);this.sunHalo.position.copy(this.sunOrb.position);this.sunOrb.visible=bright>.05;this.sunHalo.visible=this.sunOrb.visible;this.sunLight.position.copy(this.sunOrb.position);this.sunLight.intensity=.25+bright*3.6;this.ambient.intensity=.55+bright*1.65;
  this.dieselOn=!(hour>=9.5 && hour<15);this.solarOn=bright>.08;
  this.gensetHighlight.material.color.setHex(this.dieselOn?0xf9c663:0x5c6e68);
  this.batteryIndicators.forEach((led)=>led.material.color.setHex((hour>=9.5&&hour<15)?0x56f2b3:0x4c7978));
  this.fill.intensity=11+bright*6;
  return {solarFactor,gensetOn:this.dieselOn,batteryState:!this.dieselOn?'SUPPORT':'STANDBY'};
 }
 setMode(mode){if(!['feasibility','supplier'].includes(mode))return;this.makeSolarArray(mode);}
 focusAsset(id,sendCallback=false){if(!assetProps[id])return;this.selectedAsset=id;this.controls.autoRotate=false;this.focusTarget=assetProps[id].target.clone();const dir=this.camera.position.clone().sub(this.controls.target).normalize();this.focusCamera=assetProps[id].target.clone().addScaledVector(dir,assetProps[id].distance);if(sendCallback&&this.onAssetClick)this.onAssetClick(id);}
 resetCamera(){this.focusTarget=new THREE.Vector3(4,0,-1);this.focusCamera=new THREE.Vector3(45,37,54);this.controls.autoRotate=true;}
 setPaused(pause){this.paused=Boolean(pause);}
 animate(now){if(this.disposed)return;this.frame=requestAnimationFrame(this.animate);const dt=Math.min(.05,(now-this.last)/1000||.016);this.last=now;if(!this.paused){this.elapsed+=dt;
   for(const p of this.pulses){const visible=(p.id==='pv'?this.solarOn:p.id==='generator'?this.dieselOn:p.id==='battery'?!this.dieselOn:true);
    p.dots.forEach((d,i)=>{d.visible=visible;if(!visible)return;const t=(this.elapsed*(p.id==='generator'?.22:.12)+i/p.dots.length)%1;d.position.copy(p.curve.getPoint(t));d.scale.setScalar(.73+Math.sin(this.elapsed*2+i)*.18)});
   }this.sunOrb.rotation.y+=dt*.06;
  }
  if(this.focusTarget){this.controls.target.lerp(this.focusTarget,Math.min(1,dt*3.8));this.camera.position.lerp(this.focusCamera,Math.min(1,dt*3.5));if(this.controls.target.distanceTo(this.focusTarget)<.1){this.focusTarget=null;this.focusCamera=null;}}
  this.controls.update();this.renderer.render(this.scene,this.camera);
 }
 resize(){const w=Math.max(20,this.mount.clientWidth),h=Math.max(20,this.mount.clientHeight);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);}
 dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.renderer.domElement.removeEventListener('pointerdown',this.onDown);this.renderer.domElement.removeEventListener('pointerup',this.onClick);this.controls.dispose();this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){if(m.map)m.map.dispose();m.dispose();}}});this.renderer.dispose();this.renderer.domElement.remove();}
}