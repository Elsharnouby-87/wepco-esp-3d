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
  this.mount=mount;this.onAssetClick=onAssetClick;this.mode='feasibility';this.hour=12;this.paused=false;this.disposed=false;this.elapsed=0;this.assetObjects=[];this.objectParents=new Map();this.pulses=[];this.fadeLabels=[];this.flowVisible=true;this.cableRoutes=[];this.flowStates={};
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.35:1.8));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.mount.appendChild(this.renderer.domElement);
  this.scene=new THREE.Scene();this.scene.fog=new THREE.FogExp2(0x0b1c26,.0071);
  this.camera=new THREE.PerspectiveCamera(38,1,.1,300);this.camera.position.set(45,37,54);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(4,0,-1);this.controls.enableDamping=true;this.controls.dampingFactor=.056;this.controls.minDistance=13;this.controls.maxDistance=102;this.controls.maxPolarAngle=Math.PI/2.02;this.controls.minPolarAngle=.25;this.controls.enablePan=true;this.controls.autoRotate=true;this.controls.autoRotateSpeed=.28;
  this.ambient=new THREE.HemisphereLight(0xb9e4ff,0x182a2d,2.2);this.scene.add(this.ambient);
  this.sunLight=new THREE.DirectionalLight(0xffedcf,3.3);this.sunLight.position.set(-25,42,-30);this.sunLight.castShadow=true;this.sunLight.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);this.sunLight.shadow.camera.left=-72;this.sunLight.shadow.camera.right=72;this.sunLight.shadow.camera.top=65;this.sunLight.shadow.camera.bottom=-65;this.sunLight.shadow.camera.near=1;this.sunLight.shadow.camera.far=145;this.sunLight.shadow.bias=-.0002;this.scene.add(this.sunLight);
  this.fill=new THREE.PointLight(COLORS.mint,17,51);this.fill.position.set(28,9,-12);this.scene.add(this.fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,150),new THREE.MeshStandardMaterial({color:0x29362c,roughness:1,metalness:0}));ground.rotation.x=-Math.PI/2;ground.position.y=-.20;ground.receiveShadow=true;this.scene.add(ground);
  const groundTop=new THREE.Mesh(new THREE.PlaneGeometry(112,83),new THREE.MeshStandardMaterial({color:0x38473d,roughness:.98}));groundTop.rotation.x=-Math.PI/2;groundTop.position.y=-.16;groundTop.receiveShadow=true;this.scene.add(groundTop);
  const grid=new THREE.GridHelper(116,58,0x47776c,0x304f4a);grid.position.y=-.145;grid.material.transparent=true;grid.material.opacity=.18;this.scene.add(grid);
  this.drawEarth();this.makeHardware();this.upgradeHardware();this.makePrecisionDetails();this.makeSolarArray('feasibility');this.makeFlow();this.makeSun();
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
 /** Detail package: architectural enclosure geometry + genuine 3-phase cable paths.
  * Conceptual geometry with no claim of scaled mechanical design or exact cable route. */
 upgradeHardware(){
  const paint=(color,metalness=.2,roughness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const dark=paint(0x152c33,.58,.34),gasket=paint(0x344a4e,.6,.52),blue=paint(0x3c9bba,.25,.35);
  const copper=paint(0xdca954,.55,.28),signal=paint(0x5cdeab,.27,.3),screen=paint(0x0e4357,.1,.24);
  const warning=paint(0xecb74b,.12,.38),concrete=paint(0x89938d,.06,.87),rail=paint(0x7c8e8b,.66,.38);
  const cylinderBetween=(a,b,r,mat)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);const delta=to.clone().sub(from);const item=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),10),mat);item.position.copy(from).add(to).multiplyScalar(.5);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());item.castShadow=true;return item;};
  // Battery enclosures: pitched roof lip, double panel seams, recessed touch HMI,
  // grounding, safety labels, vent grille, foundation anchor bolts, external ducts.
  for(let i=0;i<3;i++){
   const x=24.7+i*4.3,z=-16;
   this.bessGroup.add(box(3.56,.17,3.45,gasket,x,5.015,z));
   this.bessGroup.add(box(.035,3.8,.06,dark,x,2.66,z+1.742));
   this.bessGroup.add(box(.18,1.08,.12,rail,x+1.45,2.8,z+1.73));
   this.bessGroup.add(box(.68,.4,.1,dark,x-.92,4.03,z+1.75));
   this.bessGroup.add(box(.46,.21,.11,screen,x-.92,4.03,z+1.82));
   this.bessGroup.add(box(.52,.10,.12,warning,x+.75,3.96,z+1.78));
   this.bessGroup.add(box(.72,.12,.09,dark,x+.7,3.69,z+1.76));
   for(let k=0;k<7;k++)this.bessGroup.add(box(.7,.055,.065,dark,x-1.08,1.15+k*.21,z-1.725));
   for(const dx of[-1.37,1.37])for(const dz of[-1.13,1.13])this.bessGroup.add(cyl(.12,.24,rail,x+dx,.32,z+dz));
   const duct=box(.34,2.9,.45,rail,x+1.56,2.45,z-.58);this.bessGroup.add(duct);
   this.bessGroup.add(box(2.75,.16,.2,copper,x,.54,z+1.77));
  }
  // Huawei-style inverter front bezels, communication ports, indicator lamps,
  // removable cover fasteners and AC isolator boxes.
  for(let i=0;i<3;i++){
   const x=24.5+i*4.5,z=-5;
   this.inverterGroup.add(box(2.9,2.7,.055,paint(0xe0e8e4,.15,.34),x,2.1,z+.695));
   this.inverterGroup.add(box(2.35,.08,.075,rail,x,3.39,z+.726));
   this.inverterGroup.add(box(.68,.1,.075,screen,x,1.2,z+.748));
   this.inverterGroup.add(box(.24,.08,.075,signal,x,3.20,z+.749));
   for(const dx of[-1.22,1.22])for(const dy of[1.05,3.2])this.inverterGroup.add(cyl(.055,.035,copper,x+dx,dy,z+.79));
   this.inverterGroup.add(box(.42,.6,.5,dark,x+1.1,.42,z+.75));
   this.inverterGroup.add(cylinderBetween([x-.9,.51,z+.8],[x-.9,.08,z+1.7],.075,dark));
  }
  // Generator radiator matrix, acoustical shell, hinged side doors, nameplates,
  // inlet louvres and CAT-style exhaust stack / mushroom rain cap.
  this.gensetGroup.add(box(9.45,.31,4.95,dark,29,4.50,11));
  this.gensetGroup.add(box(4.05,2.83,.09,paint(0xd2d4ba,.24,.42),27.12,2.38,13.39));
  this.gensetGroup.add(box(3.79,2.83,.10,paint(0xc8ceb8,.2,.43),31.3,2.38,13.39));
  this.gensetGroup.add(box(.07,2.7,.10,dark,29,2.38,13.46));
  for(let i=0;i<17;i++){this.gensetGroup.add(box(.09,2.2,.10,dark,25.5+i*.31,2.2,13.49));}
  this.gensetGroup.add(box(2.45,1.65,.11,dark,32,2.06,13.49));
  for(let i=0;i<14;i++)this.gensetGroup.add(box(2.28,.05,.06,rail,32,1.39+i*.106,13.58));
  for(let j=0;j<5;j++)this.gensetGroup.add(box(.16,.17,.07,dark,25.3+j*.9,3.13,13.58));
  this.gensetGroup.add(box(2.02,.62,.08,warning,26.8,3.96,13.56));
  this.gensetGroup.add(box(1.11,.24,.10,dark,26.9,3.95,13.62));
  const exhaustCap= new THREE.Mesh(new THREE.ConeGeometry(.95,.42,14),dark);exhaustCap.position.set(32.2,7.18,10.1);this.gensetGroup.add(exhaustCap);
  this.gensetGroup.add(cyl(.08,.22,copper,32.2,7.48,10.1));
  // Vertical wellhead / Christmas-tree-inspired pressure-rated abstraction,
  // VSD cabinet screens, flanged flowline, and anti-slip service walkway.
  const mainPipe=paint(0x4f9b87,.62,.35);
  for(const height of[2.5,3.4,4.15]){
    this.espGroup.add(cyl(.75,.19,copper,29,height,26));
    for(let j=0;j<8;j++){const theta=j*Math.PI/4;this.espGroup.add(cyl(.055,.1,dark,29+.64*Math.cos(theta),height+.15,26+.64*Math.sin(theta)));}
  }
  this.espGroup.add(cylinderBetween([29,3.4,26],[29,5.7,26],.22,mainPipe));
  const valveWheel=new THREE.Mesh(new THREE.TorusGeometry(.57,.075,8,20),warning);
  valveWheel.rotation.x=Math.PI/2;valveWheel.position.set(29,5.32,26);this.espGroup.add(valveWheel);
  this.espGroup.add(cylinderBetween([29,5.32,26],[29,5.32,25.3],.07,rail));
  for(const xx of[31.5,32.6])this.espGroup.add(cylinderBetween([xx,3.56,26],[xx,2.9,26],.27,mainPipe));
  this.espGroup.add(box(2.48,2.63,.11,paint(0xdce8e2,.2,.44),24,1.92,26.89));
  this.espGroup.add(box(.98,.48,.12,screen,24,2.6,26.98));
  this.espGroup.add(box(1.36,.11,.10,signal,24,3.03,27.0));
  for(let i=0;i<8;i++)this.espGroup.add(box(1.75,.045,.08,dark,24,1.15+i*.1,27.0));
  this.espGroup.add(box(.18,1.2,.18,rail,25.15,2.1,27.0));
  // Distribution assembly and three-pole protective incomer breaker.
  const switchboard=this.register(new THREE.Group(),'esp');this.hardware.add(switchboard);
  switchboard.add(box(4.3,3.45,2.5,concrete,20.6,1.92,3));
  switchboard.add(box(3.95,2.9,.065,paint(0xbccdcc,.24,.4),20.6,1.95,4.28));
  switchboard.add(box(.10,3.08,.09,dark,20.6,1.97,4.36));
  switchboard.add(box(.95,.49,.1,screen,19.7,2.48,4.38));
  for(let i=0;i<3;i++){
    switchboard.add(box(.19,.41,.1,dark,20.0+i*.58,1.5,4.39));
    switchboard.add(box(.065,.22,.11,signal,20.0+i*.58,1.51,4.48));
  }
  const swLabel=labelSprite('LV MICROGRID SWITCHGEAR','#b5efe0');swLabel.position.set(20.6,5.65,3);switchboard.add(swLabel);
  // Physical cable infrastructure: cable trays, support posts and rigid conduits
  // based on the equipment arrangement shown in the supplier SLD / datasheets.
  this.physicalCables=new THREE.Group();this.hardware.add(this.physicalCables);
  // Lidded/open-top ladder cable tray runs, individual conductors, rigid metallic
  // conduit risers and concrete supports. The geometry is *illustrative*, not a
  // route survey, cable schedule or hazardous-area installation specification.
  const cableMats={dc:paint(0x4eaecc,.35,.34),ess:paint(0x6fcba1,.35,.34),ac:paint(0xcc9670,.35,.40),load:paint(0x94a7d2,.35,.34)};
  const trayMat=paint(0x2d4248,.72,.38),trayRail=paint(0x839397,.67,.35),conduitMat=paint(0x99a6a8,.58,.38);
  const cableRoutes=[
   {id:'pv',kind:'dc',nominalKw:450,glow:0x7bdfff,pts:[[-16,.42,-20],[0,.42,-20],[20,.42,-20],[20,.42,-6.8],[25,.42,-6.8]],drops:[[-16,1.26,-20],[-8,1.18,-20],[20,1.52,-6.8],[25,1.62,-6.8]]},
   {id:'battery',kind:'ess',nominalKw:324,glow:0x63f1b0,pts:[[29,.48,-12.7],[29,.48,-9.0],[25,.48,-9],[25,.48,1.3],[22.4,.48,1.3]],drops:[[29,1.72,-12.7],[25,1.62,-9],[22.4,1.82,1.3]]},
   {id:'generator',kind:'ac',nominalKw:250,glow:0xf2af64,pts:[[31,.48,8.3],[31,.48,6.3],[24,.48,6.3],[22.5,.48,4.0]],drops:[[31,1.42,8.3],[24,1.58,6.3],[22.5,1.72,4.0]]},
   {id:'load',kind:'load',nominalKw:250,glow:0x9ce9ff,pts:[[20.5,.52,4.2],[20.5,.52,19],[24,.52,19],[24,.76,24.7]],drops:[[20.5,1.66,4.2],[24,1.66,19],[24,1.95,24.7]]},
  ];
  this.cableRoutes=[];
  for(const route of cableRoutes){
    const path=route.pts.map(q=>new THREE.Vector3(...q));
    const curve=new THREE.CatmullRomCurve3(path,false,'centripetal');
    const length=curve.getLength(),segments=Math.max(16,Math.ceil(length*3));
    // Straight tray pieces with 3-dimensional side rails and cross-rungs, not a floating tube.
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],v=b.clone().sub(a),direction=v.clone().normalize();
      const len=v.length();const side=new THREE.Vector3(-direction.z,0,direction.x).normalize();
      const middle=a.clone().add(b).multiplyScalar(.5);
      const angle=Math.atan2(v.z,v.x);
      const plate=box(len,.052,.61,trayMat,middle.x,middle.y-.10,middle.z);
      plate.rotation.y=-angle;this.physicalCables.add(plate);
      for(const sign of [-1,1]){
        const railSide=box(len,.22,.055,trayRail,middle.x+sign*side.x*.295,middle.y+.045,middle.z+sign*side.z*.295);
        railSide.rotation.y=-angle;this.physicalCables.add(railSide);
      }
      const n=Math.max(2,Math.round(len/2.0));
      for(let j=0;j<=n;j++){
        const t=j/n,loc=a.clone().lerp(b,t);
        const rung=box(.065,.047,.59,trayRail,loc.x,loc.y-.052,loc.z);rung.rotation.y=-angle;this.physicalCables.add(rung);
      }
    }
    const wires=[];
    for(let phase=0;phase<3;phase++){
      const pp=path.map(q=>new THREE.Vector3(q.x+(phase-1)*.095,q.y+.086,q.z+(phase-1)*.058));
      const mat=new THREE.MeshStandardMaterial({color:cableMats[route.kind].color,metalness:.22,roughness:.42,emissive:0x000000,emissiveIntensity:0});
      const conductor=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp,false,'centripetal'),segments,.047,8,false),mat);
      conductor.castShadow=true;this.physicalCables.add(conductor);wires.push(conductor);
    }
    for(let t=.04;t<.99;t+=1/Math.max(7,Math.floor(length/2.9))){
      const pt=curve.getPointAt(t);
      const plinth=box(.64,.06,.64,concrete,pt.x,pt.y-.29,pt.z);
      const pedestal=box(.105,.18,.105,trayRail,pt.x,pt.y-.19,pt.z);
      this.physicalCables.add(plinth,pedestal);
    }
    for(const drop of route.drops){
      const a=[drop[0],drop[1],drop[2]],b=[drop[0],route.pts[0][1]+.10,drop[2]];
      const riser=cylinderBetween(a,b,.073,conduitMat);this.physicalCables.add(riser);
      const gland=box(.20,.075,.20,trayRail,drop[0],b[1]+.06,drop[2]);this.physicalCables.add(gland);
    }
    this.cableRoutes.push({id:route.id,curve,segments,nominalKw:route.nominalKw,defaultColor:route.glow,wires});
  }
  this.hardware.add(box(9,.12,1.4,concrete,28.9,-.01,-9));
  for(const z of[-6.2,2.8,7.2]){this.hardware.add(box(11,.09,.36,rail,28.8,.15,z));}
  this.leds=this.batteryIndicators;

 }
 makePrecisionDetails(){
  // Design references: Huawei LUNA2000-161-2S11, Huawei SUN2000-150K-MG0,
  // Caterpillar 3406C and Jinko Tiger Neo 650 Wp reference sheets. Geometry is
  // deliberately illustrative, not exact vendor CAD geometry or an as-built.
  const powder=new THREE.MeshStandardMaterial({color:0xd8e4e0,metalness:.22,roughness:.39});
  const steel=new THREE.MeshStandardMaterial({color:0x536e71,metalness:.79,roughness:.29});
  const dark=new THREE.MeshStandardMaterial({color:0x16262c,metalness:.35,roughness:.44});
  const black=new THREE.MeshStandardMaterial({color:0x101a20,metalness:.27,roughness:.44});
  const amber=new THREE.MeshStandardMaterial({color:0xd8a147,metalness:.34,roughness:.44});
  const cool=new THREE.MeshBasicMaterial({color:0x64edbe});
  const pale=new THREE.MeshBasicMaterial({color:0x87def6});
  const stroke=(a,b,r,mat)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const d=end.clone().sub(start);const pipe=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),10),mat);pipe.position.copy(start).add(end).multiplyScalar(.5);pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());pipe.castShadow=true;return pipe;};
  // LUNA2000-inspired tall white ESS with rectangular intake, top green status bar,
  // detachable modules, bottom forklift skids, cooling fans and access hinges.
  for(let unit=0;unit<3;unit++){
   const x=24.7+unit*4.3,z=-16;
   this.bessGroup.add(box(2.45,.09,.115,dark,x,4.60,z+1.785));
   this.bessGroup.add(box(1.54,.065,.115,cool,x,4.60,z+1.852));
   this.bessGroup.add(box(1.15,2.43,.08,dark,x-.46,2.52,z+1.807));
   for(let j=0;j<14;j++)this.bessGroup.add(box(1.02,.046,.092,steel,x-.46,1.38+j*.174,z+1.863));
   for(const sy of[1.22,3.92])this.bessGroup.add(box(.11,.10,.105,steel,x+1.32,sy,z+1.89));
   this.bessGroup.add(box(2.82,.19,.10,steel,x,.69,z+1.82));
   for(let k=0;k<2;k++)this.bessGroup.add(box(.64,.18,2.2,dark,x+(k?1.13:-1.13),.34,z));
   this.bessGroup.add(box(.55,.18,.14,amber,x+1.01,1.18,z+1.887));
   const cooling=box(1.9,1.12,.06,steel,x,2.05,z-1.77);this.bessGroup.add(cooling);
   for(let j=0;j<11;j++)this.bessGroup.add(box(1.62,.025,.08,dark,x,1.57+j*.092,z-1.84));
  }

  // Perimeter fencing, low plinths and a service lane lift the scene beyond a flat schematic.
  const fenceMat=new THREE.MeshStandardMaterial({color:0x5f7d76,metalness:.52,roughness:.52});
  this.hardware.add(box(76,.04,3.2,black,0,.03,15.8));
  for(const sx of [-38,38]){for(let i=0;i<11;i++){const z=-33+i*6.0;this.hardware.add(box(.08,1.15,.08,fenceMat,sx,.58,z));if(i<10)this.hardware.add(box(.05,.05,6.0,fenceMat,sx,1.08,z+3.0));}}
  for(const sz of [-35,27]){for(let i=0;i<15;i++){const x=-35+i*5.1;this.hardware.add(box(.08,1.15,.08,fenceMat,x,.58,sz));if(i<14)this.hardware.add(box(5.1,.05,.05,fenceMat,x+2.55,1.08,sz));}}
  // Inverter front human-machine interface, isolated AC connectors, cooling ribs.
  for(let i=0;i<3;i++){
   const x=24.5+i*4.5,z=-5;
   this.inverterGroup.add(box(2.43,.135,.083,steel,x,3.30,z+.79));
   this.inverterGroup.add(box(1.80,.047,.085,pale,x,3.33,z+.833));
   this.inverterGroup.add(box(1.24,.55,.115,dark,x,2.34,z+.79));
   this.inverterGroup.add(box(.59,.18,.12,cool,x,2.34,z+.852));
   for(let j=0;j<10;j++)this.inverterGroup.add(box(1.9,.055,.078,dark,x,1.28+j*.115,z+.808));
   for(let j=0;j<6;j++)this.inverterGroup.add(box(.13,.66,.30,steel,x-1.47+j*.45,2.86,z-.71));
   for(let k=0;k<3;k++)this.inverterGroup.add(stroke([x-.55+k*.55,.50,z+.55],[x-.55+k*.55,.12,z+1.11],.072,black));
  }
  // Containerized genset skid, CAT-inspired acoustic enclosure, air intake and
  // vertical exhaust/silencer. Lights correspond to running state.
  for(let side of[-1,1]){
   const y=1.18;
   for(let j=0;j<4;j++)this.gensetGroup.add(box(1.3,.16,.12,steel,26.1+j*1.88,y,11+side*2.53));
  }
  this.gensetGroup.add(box(3.65,.14,.10,amber,27.0,3.72,13.62));
  this.gensetGroup.add(box(1.55,.49,.11,dark,27.1,3.50,13.70));
  this.gensetGroup.add(box(.32,.24,.14,new THREE.MeshBasicMaterial({color:0xffc369}),27.80,3.49,13.80));
  for(let j=0;j<18;j++)this.gensetGroup.add(box(.085,1.27,.10,dark,25.6+j*.36,2.34,8.64));
  this.gensetGroup.add(box(.54,1.02,.55,steel,32.2,6.82,10.1));
  this.gensetGroup.add(stroke([31.70,5.0,10.1],[32.25,6.53,10.1],.13,steel));
  for(const z of[8.82,13.12])this.gensetGroup.add(box(10.2,.075,.07,amber,29,.15,z));
  // ESP / VSD station: capped joints, lateral valves, cable protective risers.
  for(const h of[2.84,3.72,4.38]){
   this.espGroup.add(stroke([29-.38,h,26],[29+.38,h,26],.075,steel));
   for(const sign of[-1,1])this.espGroup.add(cyl(.12,.09,amber,29+sign*.42,h,26));
  }
  this.espGroup.add(box(1.65,.14,.085,dark,24,3.18,27.05));
  this.espGroup.add(box(.54,.15,.09,pale,24,3.17,27.1));
  this.espGroup.add(stroke([24.45,.50,26.8],[24.45,.26,27.5],.09,steel));
  this.espGroup.add(stroke([29,4.5,26],[29,5.65,26],.11,steel));
  // Painted maintenance strips and bollards; conceptual layout only.
  const yellow=new THREE.MeshStandardMaterial({color:0xe5bd63,roughness:.86});
  for(let i=0;i<9;i++){
   this.hardware.add(box(.25,.016,.78,yellow,22.9+i*.85,-.091,0.75));
   this.hardware.add(box(.25,.016,.78,yellow,22.9+i*.85,-.091,17.3));
  }
  for(const [x,z] of[[19.0,1.7],[19.0,4.5],[23,18],[32.7,19]]){
   this.hardware.add(cyl(.11,.98,steel,x,.42,z));
   this.hardware.add(cyl(.13,.12,amber,x,.88,z));
  }
  // Warm low-level luminaires indicate nighttime site access. A few lights are
  // preferred over a costly volumetric/postprocessing pass on mobile devices.
  this.siteLights=[];
  for(const [x,z] of[[16,-13],[35,-9],[18,12],[36,23]]){
   const pole=stroke([x,-.10,z],[x,5.5,z],.11,steel);this.hardware.add(pole);
   const arm=stroke([x,5.48,z],[x+.65,5.48,z],.095,steel);this.hardware.add(arm);
   const luminaire=box(.75,.13,.36,powder,x+.8,5.43,z);this.hardware.add(luminaire);
   const glow=new THREE.MeshBasicMaterial({color:0xffd9a1});
   const glass=box(.58,.035,.22,glow,x+.8,5.34,z);this.hardware.add(glass);this.siteLights.push(glass);
  }
 }
 makeSolarArray(mode){if(this.pvGroup){this.scene.remove(this.pvGroup);this.pvGroup.traverse(o=>{if(o.geometry&&o.geometry !== this.sharedGeom)o.geometry.dispose()});this.assetObjects=this.assetObjects.filter(o=>o!==this.pvGroup)}
  this.pvGroup=this.register(new THREE.Group(),'pv');this.scene.add(this.pvGroup);
  const rows=mode==='supplier'?13:12;const cols=mode==='supplier'?54:39; // 702 or 468 illustrative modules.
  const count=rows*cols;const frameGeo=new THREE.BoxGeometry(.89,.045,1.42);const faceGeo=new THREE.PlaneGeometry(.83,1.35);
  const faceMat=new THREE.MeshStandardMaterial({map:panelTexture(),color:0xd7f4f8,metalness:.18,roughness:.28,side:THREE.DoubleSide});
  const frames=new THREE.InstancedMesh(frameGeo,panelDark,count);const faces=new THREE.InstancedMesh(faceGeo,faceMat,count);frames.castShadow=true;frames.receiveShadow=true;faces.receiveShadow=true;
  const d=new THREE.Object3D();let id=0;const pitch=mode==='supplier'?.91:1.15;const left=-28;const top=-26;
  const tilt=.47;const rowDepth=1.42;const beamMat=metal;
  for(let r=0;r<rows;r++){
   const z=top+r*3.65;
   const rowLen=(cols-1)*pitch+.89;
   const beamZFront=z+.24,beamZRear=z-.26;
   this.pvGroup.add(box(rowLen,.06,.08,beamMat,left+(cols-1)*pitch/2,.68,beamZFront));
   this.pvGroup.add(box(rowLen,.06,.08,beamMat,left+(cols-1)*pitch/2,.33,beamZRear));
   for(const supportCol of [1,Math.floor(cols/2),cols-2]){
    const sx=left+supportCol*pitch;
    this.pvGroup.add(box(.12,.66,.12,beamMat,sx,.32,z-.02));
    this.pvGroup.add(box(.16,.05,.78,beamMat,sx,.66,z+.02));
   }
   for(let c=0;c<cols;c++){
    const x=left+c*pitch;
    d.position.set(x,1.00,z);d.rotation.set(-tilt,0,0);d.updateMatrix();frames.setMatrixAt(id,d.matrix);
    d.position.y+=.036;d.updateMatrix();faces.setMatrixAt(id,d.matrix);id++;
   }
   const combX=left+rowLen/2+.92;
   this.pvGroup.add(box(.42,.62,.28,beamMat,combX,.42,z));
   this.pvGroup.add(box(.14,.08,.48,beamMat,combX+.22,.08,z));
  }
  frames.instanceMatrix.needsUpdate=true;faces.instanceMatrix.needsUpdate=true;this.pvGroup.add(frames,faces);
  const accessMat=new THREE.MeshStandardMaterial({color:0x52635d,roughness:.98,metalness:.03});
  for(let r=0;r<rows-1;r+=2){this.pvGroup.add(box((cols-1)*pitch+1.2,.02,.60,accessMat,left+(cols-1)*pitch/2,.02,top+r*3.65+1.82));}
  const tag=labelSprite(mode==='supplier'?'PV ARRAY / 456 kWp':'PV ARRAY / 304 kWp','#9fdaf5');tag.position.set(-11,6,-29);this.pvGroup.add(tag);
  this.pvGroup.userData.mode=mode;this.mode=mode;
  // Vendor option has three inverters, feasibility model two. Hide unused inverter.
  this.inverterGroup.children.forEach((o)=>{if(o.type==='Sprite')return;o.visible=true});
  if(mode==='feasibility'){this.inverterGroup.children.slice(8,12).forEach(o=>o.visible=false)}
 }
 makeFlow(){
  // Emissive current-direction traces are placed inside a translucent conduit on
  // the installed conceptual cable-tray centreline. Additive shells improve wide
  // zoom readability without suggesting actual cables radiate light.
  this.energyFlowGroup=new THREE.Group();this.hardware.add(this.energyFlowGroup);this.pulses=[];
  for(const route of this.cableRoutes){
   const lightCurve=new THREE.CatmullRomCurve3(route.curve.points.map(q=>q.clone().add(new THREE.Vector3(0,.20,0))),false,'centripetal');
   const shell=new THREE.Mesh(new THREE.TubeGeometry(lightCurve,route.segments,.19,10,false),new THREE.MeshPhysicalMaterial({color:0x223742,metalness:.10,roughness:.16,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}));
   shell.renderOrder=2;this.physicalCables.add(shell); // always visible even when FX hidden
   const halo=new THREE.Mesh(new THREE.TubeGeometry(lightCurve,route.segments,.29,10,false),new THREE.MeshBasicMaterial({color:route.defaultColor,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
   halo.renderOrder=3;this.energyFlowGroup.add(halo);
   const glow=new THREE.Mesh(new THREE.TubeGeometry(lightCurve,route.segments,.11,10,false),new THREE.MeshBasicMaterial({color:route.defaultColor,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
   glow.renderOrder=4;this.energyFlowGroup.add(glow);
   const pulses=[];
   for(let i=0;i<24;i++){
    const mat=new THREE.MeshBasicMaterial({color:route.defaultColor,transparent:true,opacity:.95,depthWrite:false});
    const pulse=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.96,9),mat);
    const aura=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,1.38,10),new THREE.MeshBasicMaterial({color:route.defaultColor,transparent:true,opacity:.33,depthWrite:false,blending:THREE.AdditiveBlending}));
    pulse.add(aura);pulse.userData.aura=aura;
    pulse.visible=false;pulse.renderOrder=5;this.energyFlowGroup.add(pulse);pulses.push(pulse);
   }
   this.pulses.push({id:route.id,curve:lightCurve,samples:lightCurve.getPoints(180),nominalKw:route.nominalKw,glow,halo,pulses,state:{active:false,kw:0,color:route.defaultColor,direction:1},wires:route.wires});
  }
 }
 setFlowVisible(flag){
  this.flowVisible=Boolean(flag);
  if(this.energyFlowGroup)this.energyFlowGroup.visible=this.flowVisible;
  for(const flow of this.pulses){
   const ratio=Math.min(1,flow.state.kw/flow.nominalKw);
   for(const wire of flow.wires)wire.material.emissiveIntensity=this.flowVisible&&flow.state.active?.78+ratio*2.4:0;
  }
 }
 applyFlowState(id,kw,color,direction=1){
  const flow=this.pulses.find(p=>p.id===id);if(!flow)return;
  flow.state={active:kw>.15,kw:Math.max(0,kw),color,direction};
  const ratio=Math.max(0,Math.min(1,flow.state.kw/flow.nominalKw));
  flow.glow.material.color.setHex(color);flow.halo.material.color.setHex(color);
  flow.glow.material.opacity=this.flowVisible&&flow.state.active?.86+ratio*.46:0;
  flow.halo.material.opacity=this.flowVisible&&flow.state.active?.20+ratio*.26:0;
  for(const wire of flow.wires){
   wire.material.emissive.setHex(color);
   wire.material.emissiveIntensity=this.flowVisible&&flow.state.active?.78+ratio*2.4:0;
  }
 }
 makeSun(){this.sunOrb=new THREE.Mesh(new THREE.SphereGeometry(3,18,18),new THREE.MeshBasicMaterial({color:0xf2d8a0,fog:false}));this.scene.add(this.sunOrb);this.sunHalo=new THREE.Sprite(new THREE.SpriteMaterial({color:0xf7d899,transparent:true,opacity:.33}));this.sunHalo.scale.set(12,12,1);this.scene.add(this.sunHalo);
  const dust=new THREE.BufferGeometry();const array=[];for(let i=0;i<280;i++){array.push((Math.sin(i*73)*.5+.5)*115-57,Math.sin(i*61)*.45+5+(i%8), (Math.sin(i*23+6)*.5+.5)*85-42)}dust.setAttribute('position',new THREE.Float32BufferAttribute(array,3));this.particles=new THREE.Points(dust,new THREE.PointsMaterial({color:0xb9e9ca,size:.09,transparent:true,opacity:.28}));this.scene.add(this.particles);
 }
 setTime(hour){this.hour=hour;const solarFactor=Math.max(0,Math.sin(Math.PI*(hour-6)/12));const bright=Math.max(0,Math.min(1,solarFactor*1.13));const nightColor=new THREE.Color(COLORS.night),dayColor=new THREE.Color(COLORS.day);const bg=nightColor.clone().lerp(dayColor,bright);this.scene.background=bg;this.scene.fog.color=bg;
  this.sunOrb.position.set(-45+hour/24*95,3+Math.max(0,solarFactor)*50,-43);this.sunHalo.position.copy(this.sunOrb.position);this.sunOrb.visible=bright>.05;this.sunHalo.visible=this.sunOrb.visible;this.sunLight.position.copy(this.sunOrb.position);this.sunLight.intensity=.25+bright*3.6;this.ambient.intensity=.55+bright*1.65;
  this.dieselOn=!(hour>=9.5 && hour<15);this.solarOn=bright>.08; // overridden by calculated dispatch
  this.gensetHighlight.material.color.setHex(this.dieselOn?0xf9c663:0x5c6e68);
  this.batteryIndicators.forEach((led)=>led.material.color.setHex((hour>=9.5&&hour<15)?0x56f2b3:0x4c7978));
  this.fill.intensity=11+bright*6;
  return {solarFactor,gensetOn:this.dieselOn,batteryState:!this.dieselOn?'SUPPORT':'STANDBY'};
 }
 /** Feed the physically computed dispatch back into the 3D scene and cable pulses. */
 setDispatch(row){
  if(!row)return;
  this.dieselOn=Boolean(row.dieselOn);
  this.solarOn=row.pvUsed>0.5;
  this.bessActive=row.charge>0.05||row.batteryToLoad>0.05;
  this.bessDischarge=row.batteryToLoad>0.05;
  this.gensetHighlight.material.color.setHex(this.dieselOn?0xf6b84b:0x3e6f66);
  this.batteryIndicators.forEach(led=>led.material.color.setHex(this.bessDischarge?0x6aa8f1:this.bessActive?0x62f9b9:0x446a68));
  const sunPower=Math.max(0,Math.min(1,row.ghi/850));
  this.sunLight.intensity=.4+sunPower*3.5;
  this.ambient.intensity=.7+sunPower*1.6;
  const pvKw=Math.max(0,row.solarToLoad+row.charge);
  const battKw=Math.max(0,row.batteryToLoad||row.charge||0);
  const battDir=row.batteryToLoad>0.05?1:-1;
  const battColor=row.batteryToLoad>0.05?0x72a6ff:0x63ef9b;
  const loadColor=row.dieselOn?0xa9d8ff:row.batteryToLoad>0.05?0x8ef0d6:0xb9fff2;
  this.applyFlowState('pv',pvKw,0x7bdfff,1);
  this.applyFlowState('battery',battKw,battColor,battDir);
  this.applyFlowState('generator',Math.max(0,row.genToLoad),0xf2af64,1);
  this.applyFlowState('load',Math.max(0,row.loadKw),loadColor,1);
 }
 setMode(mode){if(!['feasibility','supplier'].includes(mode))return;this.makeSolarArray(mode);}

 focusAsset(id,sendCallback=false){if(!assetProps[id])return;this.selectedAsset=id;this.controls.autoRotate=false;this.focusTarget=assetProps[id].target.clone();const dir=this.camera.position.clone().sub(this.controls.target).normalize();this.focusCamera=assetProps[id].target.clone().addScaledVector(dir,assetProps[id].distance);if(sendCallback&&this.onAssetClick)this.onAssetClick(id);}
 resetCamera(){this.focusTarget=new THREE.Vector3(4,0,-1);this.focusCamera=new THREE.Vector3(45,37,54);this.controls.autoRotate=true;}
 setPaused(pause){this.paused=Boolean(pause);}
 animate(now){if(this.disposed)return;this.frame=requestAnimationFrame(this.animate);const dt=Math.min(.05,(now-this.last)/1000||.016);this.last=now;if(!this.paused){this.elapsed+=dt;
   for(const p of this.pulses){
    const ratio=Math.max(0,Math.min(1,p.state.kw/p.nominalKw));
    const visible=this.flowVisible&&p.state.active&&ratio>.01;
    const activeCount=Math.max(4,Math.round(6+ratio*16));
    const speed=(.16+ratio*.72)*(p.id==='generator'?.85:1);
    p.glow.visible=visible;p.halo.visible=visible;
    p.glow.material.opacity=visible?.86+ratio*.46:0;
    p.halo.material.opacity=visible?.20+ratio*.26:0;
    p.pulses.forEach((pulse,i)=>{
      pulse.visible=visible&&i<activeCount;
      if(!pulse.visible)return;
      // Sample precomputed, bounded waypoints. Avoid CatmullRom extrapolation at t=1.
      const raw=(this.elapsed*speed+i/activeCount)%1;
      const phase=Number.isFinite(raw)?raw:0;
      const t=Math.max(0,Math.min(.999999,p.state.direction>0?phase:1-phase));
      const scaled=t*(p.samples.length-1);
      const n=Math.min(p.samples.length-2,Math.floor(scaled));
      const progress=scaled-n;
      pulse.position.copy(p.samples[n]).lerp(p.samples[n+1],progress);
      const tangent=p.samples[n+1].clone().sub(p.samples[n]).normalize().multiplyScalar(p.state.direction);
      pulse.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);
      const width=1.08+ratio*1.10;
      pulse.scale.set(width,.88+ratio*.28,width);
      pulse.material.color.setHex(p.state.color);pulse.material.opacity=.96;
      pulse.userData.aura.material.color.setHex(p.state.color);
      pulse.userData.aura.material.opacity=.34+ratio*.34;
    });
   }this.sunOrb.rotation.y+=dt*.06;
  }
  if(this.focusTarget){this.controls.target.lerp(this.focusTarget,Math.min(1,dt*3.8));this.camera.position.lerp(this.focusCamera,Math.min(1,dt*3.5));if(this.controls.target.distanceTo(this.focusTarget)<.1){this.focusTarget=null;this.focusCamera=null;}}
  this.controls.update();this.renderer.render(this.scene,this.camera);
 }
 resize(){const w=Math.max(20,this.mount.clientWidth),h=Math.max(20,this.mount.clientHeight);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);}
 dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.renderer.domElement.removeEventListener('pointerdown',this.onDown);this.renderer.domElement.removeEventListener('pointerup',this.onClick);this.controls.dispose();this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){if(m.map)m.map.dispose();m.dispose();}}});this.renderer.dispose();this.renderer.domElement.remove();}
}