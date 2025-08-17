import{r as c,j as e,C as w,u as m,T as a,B as p,S as y,P as _,c as T}from"./three-D8slNa4G.js";import"./vendor-9sitkZcQ.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const R=`
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) world_position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
}

struct Uniforms {
  view_proj: mat4x4<f32>,
  model: mat4x4<f32>,
  time: f32,
  light_position: vec3<f32>,
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  
  let world_position = uniforms.model * vec4<f32>(input.position, 1.0);
  out.world_position = world_position.xyz;
  out.clip_position = uniforms.view_proj * world_position;
  out.normal = normalize((uniforms.model * vec4<f32>(input.normal, 0.0)).xyz);
  out.uv = input.uv;
  
  return out;
}
`,A=`
struct FragmentInput {
  @location(0) world_position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
}

struct Uniforms {
  view_proj: mat4x4<f32>,
  model: mat4x4<f32>,
  time: f32,
  light_position: vec3<f32>,
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

@group(0) @binding(1)
var texture_sampler: sampler;

@group(0) @binding(2)
var noise_texture: texture_2d<f32>;

// Authentic Pyrmont sandstone color palette (1880s rustic)
const SANDSTONE_BASE: vec3<f32> = vec3<f32>(0.82, 0.68, 0.45); // Warm golden base
const SANDSTONE_DARK: vec3<f32> = vec3<f32>(0.58, 0.48, 0.32); // Deep weathered blocks
const SANDSTONE_LIGHT: vec3<f32> = vec3<f32>(0.92, 0.82, 0.62); // Light weathered surface
const SANDSTONE_MORTAR: vec3<f32> = vec3<f32>(0.72, 0.62, 0.48); // Mortar joints
const SANDSTONE_STAIN: vec3<f32> = vec3<f32>(0.68, 0.52, 0.35); // Age staining

// Noise functions for procedural texture generation
fn hash(p: vec2<f32>) -> f32 {
  let h = dot(p, vec2<f32>(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  
  let a = hash(i);
  let b = hash(i + vec2<f32>(1.0, 0.0));
  let c = hash(i + vec2<f32>(0.0, 1.0));
  let d = hash(i + vec2<f32>(1.0, 1.0));
  
  let u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

fn fbm(p: vec2<f32>) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  
  for (var i = 0; i < 6; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

// Authentic Pyrmont sandstone block pattern
fn sandstoneBlocks(uv: vec2<f32>) -> f32 {
  // Create realistic block pattern with mortar joints
  let block_size = vec2<f32>(0.3, 0.15); // Typical sandstone block proportions
  let block_uv = uv / block_size;
  let block_id = floor(block_uv);
  let block_local = fract(block_uv);
  
  // Mortar joint width
  let mortar_width = 0.08;
  let mortar_x = smoothstep(0.0, mortar_width, block_local.x) * smoothstep(1.0, 1.0 - mortar_width, block_local.x);
  let mortar_y = smoothstep(0.0, mortar_width, block_local.y) * smoothstep(1.0, 1.0 - mortar_width, block_local.y);
  
  return mortar_x * mortar_y;
}

// Weathering and age patterns specific to 1880s Pyrmont stone
fn weatheringPattern(uv: vec2<f32>, world_pos: vec3<f32>) -> f32 {
  // Surface weathering from 140+ years of exposure
  let age_weathering = fbm(uv * 6.0 + world_pos.xz * 0.08);
  
  // Rain streaking patterns (vertical emphasis)
  let rain_streaks = fbm(vec2<f32>(uv.x * 3.0, uv.y * 12.0));
  
  // Wind erosion (horizontal patterns)
  let wind_erosion = fbm(vec2<f32>(uv.x * 15.0, uv.y * 4.0));
  
  return mix(age_weathering, mix(rain_streaks, wind_erosion, 0.4), 0.6);
}

// Iron oxide staining typical of Pyrmont sandstone
fn ironStaining(uv: vec2<f32>, world_pos: vec3<f32>) -> f32 {
  // Iron-rich mineral deposits create characteristic staining
  let iron_deposits = fbm(uv * 8.0 + world_pos.xz * 0.03);
  
  // Vertical streaking from water runoff
  let vertical_stains = fbm(vec2<f32>(uv.x * 4.0, uv.y * 0.8));
  
  // Concentrated staining near mortar joints
  let joint_staining = 1.0 - sandstoneBlocks(uv);
  
  return max(0.0, iron_deposits - 0.3) * (0.4 + 0.6 * vertical_stains) * (0.7 + 0.3 * joint_staining);
}

// Surface roughness for realistic lighting
fn surfaceRoughness(uv: vec2<f32>) -> f32 {
  let detail_scale = 32.0;
  let fine_detail = fbm(uv * detail_scale) * 0.1;
  let medium_detail = fbm(uv * detail_scale * 0.5) * 0.2;
  
  return fine_detail + medium_detail;
}

@fragment
fn fs_main(input: FragmentInput) -> @location(0) vec4<f32> {
  let uv = input.uv;
  let world_pos = input.world_position;
  let normal = normalize(input.normal);
  
  // Generate authentic Pyrmont sandstone texture layers
  let blocks = sandstoneBlocks(uv);
  let weathering = weatheringPattern(uv, world_pos);
  let iron_stain = ironStaining(uv, world_pos);
  let roughness = surfaceRoughness(uv);
  
  // Base sandstone color - start with authentic golden tone
  var base_color = SANDSTONE_BASE;
  
  // Apply block structure - mortar joints are darker
  base_color = mix(base_color, SANDSTONE_MORTAR, (1.0 - blocks) * 0.4);
  
  // Apply weathering - creates lighter weathered areas
  base_color = mix(base_color, SANDSTONE_LIGHT, weathering * 0.3);
  
  // Apply age staining - darker weathered areas
  base_color = mix(base_color, SANDSTONE_STAIN, weathering * 0.2);
  
  // Apply iron oxide staining - characteristic rust-colored streaks
  base_color = mix(base_color, SANDSTONE_STAIN, iron_stain * 0.5);
  
  // Lighting calculation
  let light_dir = normalize(uniforms.light_position - world_pos);
  let view_dir = normalize(-world_pos); // Assuming camera at origin
  let half_dir = normalize(light_dir + view_dir);
  
  // Modify normal with surface roughness
  let perturbed_normal = normalize(normal + vec3<f32>(roughness * 2.0 - 1.0, 0.0, roughness * 2.0 - 1.0) * 0.1);
  
  // Diffuse lighting
  let diffuse = max(0.0, dot(perturbed_normal, light_dir));
  
  // Specular lighting (subtle for sandstone)
  let specular = pow(max(0.0, dot(perturbed_normal, half_dir)), 16.0) * 0.1;
  
  // Ambient occlusion approximation - based on block structure and weathering
  let ao = 1.0 - ((1.0 - blocks) * 0.15 + weathering * 0.1);
  
  // Final color composition
  let ambient = 0.3;
  let final_color = base_color * (ambient * ao + diffuse * 0.8) + vec3<f32>(specular);
  
  // Add subtle subsurface scattering effect
  let subsurface = pow(max(0.0, dot(-light_dir, perturbed_normal)), 2.0) * 0.1;
  let sss_color = SANDSTONE_LIGHT * subsurface;
  
  return vec4<f32>(final_color + sss_color, 1.0);
}
`,W=`
@group(0) @binding(0)
var<storage, read_write> noise_data: array<f32>;

@compute @workgroup_size(8, 8, 1)
fn cs_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let dims = 256u;
  let index = global_id.y * dims + global_id.x;
  
  if (global_id.x >= dims || global_id.y >= dims) {
    return;
  }
  
  let uv = vec2<f32>(f32(global_id.x), f32(global_id.y)) / f32(dims);
  
  // Generate procedural noise for sandstone texture
  var noise_value = 0.0;
  var amplitude = 1.0;
  var frequency = 1.0;
  
  for (var i = 0; i < 8; i++) {
    let p = uv * frequency;
    let n = sin(p.x * 6.28318) * cos(p.y * 6.28318) * 0.5 + 0.5;
    noise_value += n * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  noise_data[index] = noise_value;
}
`;class k{device;pipeline=null;uniformBuffer=null;noiseTexture=null;bindGroup=null;constructor(t){this.device=t}async initialize(){const t=this.device.createShaderModule({code:R}),o=this.device.createShaderModule({code:A});this.uniformBuffer=this.device.createBuffer({size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),await this.generateNoiseTexture();const i=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"unfilterable-float"}}]}),n=this.device.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"repeat",addressModeV:"repeat"});this.bindGroup=this.device.createBindGroup({layout:i,entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:n},{binding:2,resource:this.noiseTexture.createView()}]}),this.pipeline=this.device.createRenderPipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[i]}),vertex:{module:t,entryPoint:"vs_main",buffers:[{arrayStride:32,attributes:[{format:"float32x3",offset:0,shaderLocation:0},{format:"float32x3",offset:12,shaderLocation:1},{format:"float32x2",offset:24,shaderLocation:2}]}]},fragment:{module:o,entryPoint:"fs_main",targets:[{format:"bgra8unorm"}]},primitive:{topology:"triangle-list",cullMode:"back"}})}async generateNoiseTexture(){const o=this.device.createShaderModule({code:W}),i=this.device.createBuffer({size:256*256*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),n=this.device.createComputePipeline({layout:"auto",compute:{module:o,entryPoint:"cs_main"}}),s=this.device.createBindGroup({layout:n.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:i}}]}),l=this.device.createCommandEncoder(),d=l.beginComputePass();d.setPipeline(n),d.setBindGroup(0,s),d.dispatchWorkgroups(Math.ceil(256/8),Math.ceil(256/8)),d.end(),this.noiseTexture=this.device.createTexture({size:[256,256,1],format:"r32float",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),l.copyBufferToTexture({buffer:i,bytesPerRow:256*4},{texture:this.noiseTexture},[256,256,1]),this.device.queue.submit([l.finish()])}updateUniforms(t,o,i,n){if(!this.uniformBuffer)return;const s=new Float32Array(40);s.set(t,0),s.set(o,16),s[32]=i,s.set(n,33),this.device.queue.writeBuffer(this.uniformBuffer,0,s.buffer)}render(t,o,i,n){!this.pipeline||!this.bindGroup||(t.setPipeline(this.pipeline),t.setBindGroup(0,this.bindGroup),t.setVertexBuffer(0,o),t.setIndexBuffer(i,"uint16"),t.drawIndexed(n))}}class U{device=null;context=null;canvas;fallbackToWebGL=!1;webglContext=null;sandstoneMaterial=null;quadVertexBuffer=null;quadIndexBuffer=null;depthTexture=null;constructor(t){this.canvas=t}async initialize(){try{if("gpu"in navigator&&navigator.gpu){const t=navigator.gpu,o=await t.requestAdapter();if(o&&(this.device=await o.requestDevice(),this.context=this.canvas.getContext("webgpu"),this.context&&this.device))return this.context.configure({device:this.device,format:t.getPreferredCanvasFormat(),alphaMode:"premultiplied"}),this.sandstoneMaterial=new k(this.device),await this.sandstoneMaterial.initialize(),this.createFullScreenQuad(),!0}}catch{}return this.initializeWebGL()}initializeWebGL(){try{if(this.webglContext=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl"),this.webglContext)return this.fallbackToWebGL=!0,this.webglContext.enable(this.webglContext.DEPTH_TEST),this.webglContext.enable(this.webglContext.CULL_FACE),!0}catch{}return!1}render(t,o,i){this.fallbackToWebGL?this.renderWebGL(t,o,i):this.renderWebGPU(t,o,i)}renderWebGPU(t,o,i){if(!this.device||!this.context)return;const n=this.device.createCommandEncoder(),l={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]},d=n.beginRenderPass(l);if(this.sandstoneMaterial&&this.quadVertexBuffer&&this.quadIndexBuffer){const f=performance.now()/1e3,b=new Float32Array([2,5,10]),h=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),u=new Float32Array(16);u.set([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),this.sandstoneMaterial.updateUniforms(u,h,f,b),this.sandstoneMaterial.render(d,this.quadVertexBuffer,this.quadIndexBuffer,6)}for(const f of t)this.renderObjectWebGPU(d,f,o,i);d.end(),this.device.queue.submit([n.finish()])}renderObjectWebGPU(t,o,i,n){o.mesh}createFullScreenQuad(){if(!this.device)return;const t=new Float32Array([-1,-1,.999,0,0,1,0,1,1,-1,.999,0,0,1,1,1,1,1,.999,0,0,1,1,0,-1,1,.999,0,0,1,0,0]),o=new Uint16Array([0,1,2,0,2,3]);this.quadVertexBuffer=this.device.createBuffer({size:t.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.quadVertexBuffer.getMappedRange()).set(t),this.quadVertexBuffer.unmap(),this.quadIndexBuffer=this.device.createBuffer({size:o.byteLength,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0}),new Uint16Array(this.quadIndexBuffer.getMappedRange()).set(o),this.quadIndexBuffer.unmap()}renderWebGL(t,o,i){if(!this.webglContext)return;const n=this.webglContext;n.clearColor(0,0,0,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.viewport(0,0,this.canvas.width,this.canvas.height);for(const s of t)this.renderObjectWebGL(s,o,i)}renderObjectWebGL(t,o,i){this.webglContext}resize(t,o){this.canvas.width=t,this.canvas.height=o,this.isWebGPU()&&this.device&&this.context&&(this.context.configure({device:this.device,format:navigator.gpu.getPreferredCanvasFormat(),alphaMode:"premultiplied"}),this.depthTexture&&this.depthTexture.destroy(),this.depthTexture=this.device.createTexture({size:[t,o],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT})),this.fallbackToWebGL&&this.webglContext&&this.webglContext.viewport(0,0,t,o)}dispose(){this.device&&this.device.destroy(),this.device=null,this.context=null,this.webglContext=null}isWebGPU(){return!this.fallbackToWebGL&&this.device!==null}isWebGL(){return this.fallbackToWebGL&&this.webglContext!==null}}function G(r,t,o,i){const n=1/Math.tan(r/2),s=1/(o-i);return new Float32Array([n/t,0,0,0,0,n,0,0,0,0,(i+o)*s,-1,0,0,2*i*o*s,0])}function N(r,t,o){const i=S(D(r,t)),n=S(j(o,i)),s=j(i,n);return new Float32Array([n[0],s[0],i[0],0,n[1],s[1],i[1],0,n[2],s[2],i[2],0,-v(n,r),-v(s,r),-v(i,r),1])}function D(r,t){return[r[0]-t[0],r[1]-t[1],r[2]-t[2]]}function j(r,t){return[r[1]*t[2]-r[2]*t[1],r[2]*t[0]-r[0]*t[2],r[0]*t[1]-r[1]*t[0]]}function v(r,t){return r[0]*t[0]+r[1]*t[1]+r[2]*t[2]}function S(r){const t=Math.sqrt(r[0]*r[0]+r[1]*r[1]+r[2]*r[2]);return t>0?[r[0]/t,r[1]/t,r[2]/t]:[0,0,0]}function B(){const r=c.useRef(null),[t,o]=c.useState({protocol:"TechWebMIDI",latency:"45ms",throughput:"125 Mbps",objects:1247,subscribers:8,publishers:3,quality:"Ultra Low Latency"});return m(()=>{o(i=>({...i,latency:`${(40+Math.sin(Date.now()*.001)*10).toFixed(0)}ms`,throughput:`${(120+Math.sin(Date.now()*.0015)*20).toFixed(0)} Mbps`,objects:i.objects+Math.floor(Math.random()*3),subscribers:8+Math.floor(Math.sin(Date.now()*.002)*2),publishers:3+Math.floor(Math.cos(Date.now()*.0025)*1)}))}),e.jsxs("group",{position:[0,0,-2],children:[e.jsx(a,{ref:r,position:[0,.8,0],fontSize:.25,color:"#00ff00",anchorX:"center",anchorY:"middle",font:"/fonts/monospace.woff",children:"WebMIDI"}),e.jsxs(a,{position:[0,.4,0],fontSize:.12,color:"#ffff00",anchorX:"center",anchorY:"middle",children:["Protocol: ",t.protocol," | Quality: ",t.quality]}),e.jsxs(a,{position:[0,.2,0],fontSize:.1,color:"#ff6600",anchorX:"center",anchorY:"middle",children:["Latency: ",t.latency," | Throughput: ",t.throughput]}),e.jsxs(a,{position:[0,0,0],fontSize:.1,color:"#00ffff",anchorX:"center",anchorY:"middle",children:["Objects: ",t.objects," | Subscribers: ",t.subscribers]}),e.jsxs(a,{position:[0,-.2,0],fontSize:.1,color:"#ff00ff",anchorX:"center",anchorY:"middle",children:["Publishers: ",t.publishers]}),e.jsx(a,{position:[0,-.5,0],fontSize:.08,color:"#888888",anchorX:"center",anchorY:"middle",children:"Ultra-low latency media streaming over QUIC"})]})}function C(){const r=c.useRef(null),t=c.useRef(null),o=c.useRef([]),i=c.useRef(null);return m(()=>{const n=Date.now()*.001;if(r.current&&(r.current.rotation.y=n*.4,r.current.scale.setScalar(1+Math.sin(n*2)*.1)),t.current&&(t.current.rotation.x=n*.3,t.current.rotation.z=n*.2),o.current.forEach((s,l)=>{s&&(s.rotation.y=n*(.5+l*.1),s.position.y=Math.sin(n*(1+l*.3))*.1)}),i.current){i.current.position.x=Math.sin(n*3)*.4;const s=i.current.material;s&&"opacity"in s&&(s.opacity=.7+Math.sin(n*5)*.2)}}),e.jsxs("group",{position:[2,0,-2],children:[e.jsx(p,{ref:r,args:[.3,.3,.3],position:[-.8,.4,0],children:e.jsx("meshBasicMaterial",{color:"#00ff00"})}),e.jsx(y,{ref:t,args:[.2,16,16],position:[0,.2,0],children:e.jsx("meshBasicMaterial",{color:"#ffff00"})}),e.jsx(_,{ref:i,args:[.6,.03],position:[0,.4,0],children:e.jsx("meshBasicMaterial",{color:"#00ffff",transparent:!0})}),[0,1,2].map(n=>e.jsx(p,{ref:s=>{s&&(o.current[n]=s)},args:[.2,.2,.2],position:[.6+n*.3,-.2-n*.2,0],children:e.jsx("meshBasicMaterial",{color:"#ff6600"})},n)),e.jsx(a,{position:[-.8,.1,0],fontSize:.06,color:"#00ff00",anchorX:"center",anchorY:"middle",children:"Publisher"}),e.jsx(a,{position:[0,-.1,0],fontSize:.06,color:"#ffff00",anchorX:"center",anchorY:"middle",children:"WebMIDI Relay"}),e.jsx(a,{position:[.8,-.6,0],fontSize:.06,color:"#ff6600",anchorX:"center",anchorY:"middle",children:"Subscribers"}),e.jsx(a,{position:[0,-.9,0],fontSize:.08,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"WebMIDI Network"}),e.jsx(a,{position:[0,-1.1,0],fontSize:.06,color:"#888888",anchorX:"center",anchorY:"middle",children:"QUIC Transport"})]})}function E(){const[r]=c.useState(["🚀 Ultra Low Latency","📦 Object-based Delivery","🔄 Adaptive Bitrate","🌐 CDN Integration","📱 Multi-device Sync","🔒 Built-in Security"]),[t]=c.useState(["Live Streaming","Interactive Media","Gaming Applications","Real-time Collaboration","IoT Data Streams"]);return e.jsxs("group",{position:[-2,0,-2],children:[e.jsx(a,{position:[0,1,0],fontSize:.12,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"WebMIDI Features"}),r.map((o,i)=>e.jsx(a,{position:[0,.6-i*.15,0],fontSize:.07,color:"#00ff88",anchorX:"center",anchorY:"middle",children:o},i)),e.jsx(a,{position:[0,-.5,0],fontSize:.1,color:"#ffff00",anchorX:"center",anchorY:"middle",children:"Use Cases"}),t.map((o,i)=>e.jsxs(a,{position:[0,-.7-i*.1,0],fontSize:.06,color:"#ff6600",anchorX:"center",anchorY:"middle",children:["• ",o]},i))]})}function L(){return e.jsxs(e.Fragment,{children:[e.jsx("ambientLight",{intensity:.5}),e.jsx("pointLight",{position:[10,10,10]}),e.jsx(B,{}),e.jsx(C,{}),e.jsx(E,{})]})}function z(){const[r,t]=c.useState({webmidi:!1});return c.useEffect(()=>{(()=>{t({webmidi:!1})})()},[]),e.jsxs("div",{className:"webmidi-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"webmidi-header",style:{position:"absolute",top:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white"},children:[e.jsx("h2",{children:"📡 WebMIDI"}),e.jsx("p",{children:"Ultra-low latency media streaming protocol"}),e.jsx("p",{style:{fontSize:"0.9em",marginTop:"10px",color:"#aaa"},children:"Object-based media delivery with Rust WebAssembly optimization"}),e.jsx("div",{style:{marginTop:"10px",fontSize:"0.8em"},children:e.jsxs("div",{style:{color:r.webmidi?"#00ff00":"#ffaa00"},children:[r.webmidi?"✅":"🚧"," WebMIDI (Experimental)"]})})]}),e.jsx(w,{camera:{position:[0,0,5],fov:75},style:{background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)"},children:e.jsx(L,{})})]})}function F(){const r=c.useRef(null),[t,o]=c.useState({protocol:"TechWebGPU",latency:"45ms",throughput:"125 Mbps",objects:1247,subscribers:8,publishers:3,quality:"Ultra Low Latency"});return m(()=>{o(i=>({...i,latency:`${(40+Math.sin(Date.now()*.001)*10).toFixed(0)}ms`,throughput:`${(120+Math.sin(Date.now()*.0015)*20).toFixed(0)} Mbps`,objects:i.objects+Math.floor(Math.random()*3),subscribers:8+Math.floor(Math.sin(Date.now()*.002)*2),publishers:3+Math.floor(Math.cos(Date.now()*.0025)*1)}))}),e.jsxs("group",{position:[0,0,-2],children:[e.jsx(a,{ref:r,position:[0,.8,0],fontSize:.25,color:"#00ff00",anchorX:"center",anchorY:"middle",font:"/fonts/monospace.woff",children:"WebGPU"}),e.jsxs(a,{position:[0,.4,0],fontSize:.12,color:"#ffff00",anchorX:"center",anchorY:"middle",children:["Protocol: ",t.protocol," | Quality: ",t.quality]}),e.jsxs(a,{position:[0,.2,0],fontSize:.1,color:"#ff6600",anchorX:"center",anchorY:"middle",children:["Latency: ",t.latency," | Throughput: ",t.throughput]}),e.jsxs(a,{position:[0,0,0],fontSize:.1,color:"#00ffff",anchorX:"center",anchorY:"middle",children:["Objects: ",t.objects," | Subscribers: ",t.subscribers]}),e.jsxs(a,{position:[0,-.2,0],fontSize:.1,color:"#ff00ff",anchorX:"center",anchorY:"middle",children:["Publishers: ",t.publishers]}),e.jsx(a,{position:[0,-.5,0],fontSize:.08,color:"#888888",anchorX:"center",anchorY:"middle",children:"Ultra-low latency media streaming over QUIC"})]})}function X(){const r=c.useRef(null),t=c.useRef(null),o=c.useRef([]),i=c.useRef(null);return m(()=>{const n=Date.now()*.001;if(r.current&&(r.current.rotation.y=n*.4,r.current.scale.setScalar(1+Math.sin(n*2)*.1)),t.current&&(t.current.rotation.x=n*.3,t.current.rotation.z=n*.2),o.current.forEach((s,l)=>{s&&(s.rotation.y=n*(.5+l*.1),s.position.y=Math.sin(n*(1+l*.3))*.1)}),i.current){i.current.position.x=Math.sin(n*3)*.4;const s=i.current.material;s&&"opacity"in s&&(s.opacity=.7+Math.sin(n*5)*.2)}}),e.jsxs("group",{position:[2,0,-2],children:[e.jsx(p,{ref:r,args:[.3,.3,.3],position:[-.8,.4,0],children:e.jsx("meshBasicMaterial",{color:"#00ff00"})}),e.jsx(y,{ref:t,args:[.2,16,16],position:[0,.2,0],children:e.jsx("meshBasicMaterial",{color:"#ffff00"})}),e.jsx(_,{ref:i,args:[.6,.03],position:[0,.4,0],children:e.jsx("meshBasicMaterial",{color:"#00ffff",transparent:!0})}),[0,1,2].map(n=>e.jsx(p,{ref:s=>{s&&(o.current[n]=s)},args:[.2,.2,.2],position:[.6+n*.3,-.2-n*.2,0],children:e.jsx("meshBasicMaterial",{color:"#ff6600"})},n)),e.jsx(a,{position:[-.8,.1,0],fontSize:.06,color:"#00ff00",anchorX:"center",anchorY:"middle",children:"Publisher"}),e.jsx(a,{position:[0,-.1,0],fontSize:.06,color:"#ffff00",anchorX:"center",anchorY:"middle",children:"WebGPU Relay"}),e.jsx(a,{position:[.8,-.6,0],fontSize:.06,color:"#ff6600",anchorX:"center",anchorY:"middle",children:"Subscribers"}),e.jsx(a,{position:[0,-.9,0],fontSize:.08,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"WebGPU Network"}),e.jsx(a,{position:[0,-1.1,0],fontSize:.06,color:"#888888",anchorX:"center",anchorY:"middle",children:"QUIC Transport"})]})}function O(){const[r]=c.useState(["🚀 Ultra Low Latency","📦 Object-based Delivery","🔄 Adaptive Bitrate","🌐 CDN Integration","📱 Multi-device Sync","🔒 Built-in Security"]),[t]=c.useState(["Live Streaming","Interactive Media","Gaming Applications","Real-time Collaboration","IoT Data Streams"]);return e.jsxs("group",{position:[-2,0,-2],children:[e.jsx(a,{position:[0,1,0],fontSize:.12,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"WebGPU Features"}),r.map((o,i)=>e.jsx(a,{position:[0,.6-i*.15,0],fontSize:.07,color:"#00ff88",anchorX:"center",anchorY:"middle",children:o},i)),e.jsx(a,{position:[0,-.5,0],fontSize:.1,color:"#ffff00",anchorX:"center",anchorY:"middle",children:"Use Cases"}),t.map((o,i)=>e.jsxs(a,{position:[0,-.7-i*.1,0],fontSize:.06,color:"#ff6600",anchorX:"center",anchorY:"middle",children:["• ",o]},i))]})}function Y(){return e.jsxs(e.Fragment,{children:[e.jsx("ambientLight",{intensity:.5}),e.jsx("pointLight",{position:[10,10,10]}),e.jsx(F,{}),e.jsx(X,{}),e.jsx(O,{})]})}function q(){const[r,t]=c.useState({webgpu:!1});return c.useEffect(()=>{(()=>{t({webgpu:!1})})()},[]),e.jsxs("div",{className:"webgpu-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"webgpu-header",style:{position:"absolute",top:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white"},children:[e.jsx("h2",{children:"📡 WebGPU"}),e.jsx("p",{children:"Ultra-low latency media streaming protocol"}),e.jsx("p",{style:{fontSize:"0.9em",marginTop:"10px",color:"#aaa"},children:"Object-based media delivery with Rust WebAssembly optimization"}),e.jsxs("div",{style:{marginTop:"10px",fontSize:"0.8em"},children:[e.jsxs("div",{style:{color:r.webgpu?"#00ff00":"#ffaa00"},children:[r.webgpu?"✅":"🚧"," WebGPU (Experimental)"]}),e.jsxs("div",{style:{color:r.webgpu?"#00ff00":"#ffaa00"},children:[r.webgpu?"✅":"🚧"," WebGPU (Experimental)"]})]})]}),e.jsx(w,{camera:{position:[0,0,5],fov:75},style:{background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)"},children:e.jsx(Y,{})})]})}function V(){const[r,t]=c.useState("webmidi");c.useEffect(()=>{const n=new URLSearchParams(window.location.search).get("module");n&&["webmidi"].includes(n)&&t(n)},[]);const o=[{id:"webmidi",name:"WebMIDI",icon:"📡",description:"WebMIDI"},{id:"webgpu",name:"WebGPU",icon:"📡",description:"WebGPU"}];return e.jsxs("div",{className:"tech-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"tech-selector",style:{position:"absolute",top:"20px",right:"20px",zIndex:20,background:"rgba(0, 0, 0, 0.8)",borderRadius:"15px",padding:"1rem",backdropFilter:"blur(10px)",border:"1px solid rgba(255, 255, 255, 0.1)"},children:[e.jsx("h3",{style:{color:"white",marginBottom:"1rem",fontSize:"1.1rem",textAlign:"center"},children:"🔧 Tech Demos"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:o.map(i=>e.jsx("button",{onClick:()=>t(i.id),style:{background:r===i.id?"rgba(0, 255, 136, 0.2)":"rgba(255, 255, 255, 0.1)",border:r===i.id?"1px solid rgba(0, 255, 136, 0.5)":"1px solid rgba(255, 255, 255, 0.2)",borderRadius:"10px",padding:"0.75rem",color:"white",cursor:"pointer",transition:"all 0.3s ease",fontSize:"0.9rem",minWidth:"180px",textAlign:"left"},onMouseEnter:n=>{r!==i.id&&(n.currentTarget.style.background="rgba(255, 255, 255, 0.2)")},onMouseLeave:n=>{r!==i.id&&(n.currentTarget.style.background="rgba(255, 255, 255, 0.1)")},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{fontSize:"1.2rem"},children:i.icon}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:"bold"},children:i.name}),e.jsx("div",{style:{fontSize:"0.8rem",opacity:.8},children:i.description})]})]})},i.id))}),e.jsx("div",{style:{marginTop:"1rem",padding:"0.5rem",background:"rgba(255, 255, 255, 0.05)",borderRadius:"8px",fontSize:"0.8rem",color:"#aaa",textAlign:"center"},children:"Giving a home to various tech demos and experiments that might be useful to others."})]}),e.jsxs("div",{className:"tech-module-display",style:{width:"100%",height:"100%"},children:[r==="webmidi"&&e.jsx(z,{}),r==="webgpu"&&e.jsx(q,{})]}),e.jsxs("div",{className:"tech-info",style:{position:"absolute",bottom:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white",maxWidth:"300px"},children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"#00ff88"},children:[o.find(i=>i.id===r)?.icon," ",o.find(i=>i.id===r)?.name]}),e.jsxs("p",{style:{fontSize:"0.9rem",lineHeight:"1.4",margin:0},children:[r==="webmidi"&&"How TechWebMIDI works, or at least is supposed to.",r==="webgpu"&&"How WebGPU can be used to speed instrument rendering and visualizations up."]})]})]})}function H(){const[r,t]=c.useState("webmidi");c.useEffect(()=>{const n=new URLSearchParams(window.location.search).get("module");n&&["webmidi"].includes(n)&&t(n)},[]);const o=[{id:"webmidi",name:"WebMIDI",icon:"📡",description:"TechWebMIDI"},{id:"webgpu",name:"WebGPU",icon:"📡",description:"WebGPU"}];return e.jsxs("div",{className:"tech-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"tech-selector",style:{position:"absolute",top:"20px",right:"20px",zIndex:20,background:"rgba(0, 0, 0, 0.8)",borderRadius:"15px",padding:"1rem",backdropFilter:"blur(10px)",border:"1px solid rgba(255, 255, 255, 0.1)"},children:[e.jsx("h3",{style:{color:"white",marginBottom:"1rem",fontSize:"1.1rem",textAlign:"center"},children:"🔧 Tech Demos"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:o.map(i=>e.jsx("button",{onClick:()=>t(i.id),style:{background:r===i.id?"rgba(0, 255, 136, 0.2)":"rgba(255, 255, 255, 0.1)",border:r===i.id?"1px solid rgba(0, 255, 136, 0.5)":"1px solid rgba(255, 255, 255, 0.2)",borderRadius:"10px",padding:"0.75rem",color:"white",cursor:"pointer",transition:"all 0.3s ease",fontSize:"0.9rem",minWidth:"180px",textAlign:"left"},onMouseEnter:n=>{r!==i.id&&(n.currentTarget.style.background="rgba(255, 255, 255, 0.2)")},onMouseLeave:n=>{r!==i.id&&(n.currentTarget.style.background="rgba(255, 255, 255, 0.1)")},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{fontSize:"1.2rem"},children:i.icon}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:"bold"},children:i.name}),e.jsx("div",{style:{fontSize:"0.8rem",opacity:.8},children:i.description})]})]})},i.id))}),e.jsx("div",{style:{marginTop:"1rem",padding:"0.5rem",background:"rgba(255, 255, 255, 0.05)",borderRadius:"8px",fontSize:"0.8rem",color:"#aaa",textAlign:"center"},children:"Giving a home to various tech demos and experiments that might be useful to others."})]}),e.jsx("div",{className:"tech-module-display",style:{width:"100%",height:"100%"},children:r==="webmidi"&&e.jsx(z,{})}),e.jsxs("div",{className:"tech-info",style:{position:"absolute",bottom:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white",maxWidth:"300px"},children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"#00ff88"},children:[o.find(i=>i.id===r)?.icon," ",o.find(i=>i.id===r)?.name]}),e.jsxs("p",{style:{fontSize:"0.9rem",lineHeight:"1.4",margin:0},children:[r==="webmidi"&&"How TechWebMIDI works, or at least is supposed to.",r==="webgpu"&&"How WebGPU can be used to speed instrument rendering and visualizations up."]})]})]})}function K(){const r=c.useRef(null),[t,o]=c.useState(0),i=[{title:"Kasm XR Experience",subtitle:"Advanced WebXR Platform",description:"Control virtual musical instruments that aren't quite all there"},{title:"Rust WebAssembly Core",subtitle:"High-Performance Computing",description:"Shared WASM foundation across all modules"},{title:"WebXR Innovation",subtitle:"Immersive Experiences",description:"AR/VR capabilities for modern web browsers"}];m(()=>{const s=Date.now(),l=Math.floor(s/3e3%i.length);l!==t&&o(l)});const n=i[t];return e.jsxs("group",{position:[0,0,-2],children:[e.jsx(a,{ref:r,position:[0,.8,0],fontSize:.25,color:"#00ff00",anchorX:"center",anchorY:"middle",font:"/fonts/monospace.woff",children:n.title}),e.jsx(a,{position:[0,.4,0],fontSize:.15,color:"#ffff00",anchorX:"center",anchorY:"middle",children:n.subtitle}),e.jsx(a,{position:[0,0,0],fontSize:.12,color:"#ff6600",anchorX:"center",anchorY:"middle",children:n.description}),e.jsxs(a,{position:[0,-.4,0],fontSize:.08,color:"#888888",anchorX:"center",anchorY:"middle",children:[t+1," / ",i.length]})]})}function $(){const r=c.useRef(null),t=c.useRef(null),o=c.useRef(null);return m(()=>{const i=Date.now()*.001;r.current&&(r.current.rotation.y=i*.5,r.current.position.y=Math.sin(i)*.2),t.current&&(t.current.rotation.x=i*.3,t.current.position.y=Math.cos(i*1.2)*.15),o.current&&(o.current.rotation.z=i*.7,o.current.position.y=Math.sin(i*.8)*.25)}),e.jsxs("group",{position:[2,0,-2],children:[e.jsx(p,{ref:r,args:[.3,.3,.3],position:[0,.5,0],children:e.jsx("meshBasicMaterial",{color:"#ce422b"})}),e.jsx(y,{ref:t,args:[.15,16,16],position:[0,0,0],children:e.jsx("meshBasicMaterial",{color:"#00d4ff"})}),e.jsx(p,{ref:o,args:[.2,.2,.2],position:[0,-.5,0],children:e.jsx("meshBasicMaterial",{color:"#ff6b35"})}),e.jsx(a,{position:[0,-1,0],fontSize:.08,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"Core Technologies"}),e.jsx(a,{position:[0,-1.2,0],fontSize:.06,color:"#ce422b",anchorX:"center",anchorY:"middle",children:"🦀 Rust WebAssembly"}),e.jsx(a,{position:[0,-1.35,0],fontSize:.06,color:"#00d4ff",anchorX:"center",anchorY:"middle",children:"🥽 WebXR"}),e.jsx(a,{position:[0,-1.5,0],fontSize:.06,color:"#ff6b35",anchorX:"center",anchorY:"middle",children:"⚡ WebGPU"})]})}function Q(){const[r]=c.useState(["🎵 TechWebMIDI Audio Synthesis","🥽 AR/VR MIDI Controllers"]);return e.jsxs("group",{position:[-2,0,-2],children:[e.jsx(a,{position:[0,1,0],fontSize:.12,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"Platform Features"}),r.map((t,o)=>e.jsx(a,{position:[0,.6-o*.2,0],fontSize:.08,color:"#00ff88",anchorX:"center",anchorY:"middle",children:t},o)),e.jsx(a,{position:[0,-.8,0],fontSize:.06,color:"#888888",anchorX:"center",anchorY:"middle",children:"Powered by Rust + WebAssembly"})]})}function J(){return e.jsxs(e.Fragment,{children:[e.jsx("ambientLight",{intensity:.5}),e.jsx("pointLight",{position:[10,10,10]}),e.jsx(K,{}),e.jsx($,{}),e.jsx(Q,{})]})}function Z(){return e.jsxs("div",{className:"about-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"about-header",style:{position:"absolute",top:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white"},children:[e.jsx("h2",{children:"ℹ️ About"}),e.jsx("p",{children:"Kasm SDK Open Source Community"}),e.jsx("p",{style:{fontSize:"0.9em",marginTop:"10px",color:"#aaa"},children:"Kasm SDK is an open source community project focused on building advanced web based musical instruments including AR and VR instruments and MIDI controllers"})]}),e.jsx(w,{camera:{position:[0,0,5],fov:75},style:{background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)"},children:e.jsx(J,{})})]})}const ee=({currentApp:r,onAppChange:t,appContext:o="main",onFilterChange:i})=>{const[n,s]=c.useState(!1),d=(()=>{switch(o){case"kasm":return[{id:"all-instruments",label:"All Instruments",icon:"🎵",description:"View all available instruments"},{id:"oscillators",label:"Oscillators",icon:"〰️",description:"Basic waveform generators"},{id:"synthesizers",label:"Synthesizers",icon:"🎹",description:"Complex multi-oscillator synths"},{id:"effects",label:"Effects",icon:"🎛️",description:"Audio processing effects"},{id:"sequencers",label:"Sequencers",icon:"📊",description:"Pattern and sequence generators"},{id:"midi-devices",label:"MIDI Devices",icon:"🔌",description:"Connected MIDI controllers"},{id:"presets",label:"Presets",icon:"💾",description:"Saved instrument configurations"}];case"tech":return[{id:"webmidi",label:"TechWebMIDI",icon:"🎥",description:"Everything TechWebMIDI"},{id:"webgpu",label:"WebGPU",icon:"🎮",description:"Using GPU compute shaders with music"}];default:return[{id:"emanator",label:"Emanations Editor",icon:"🎼",description:"Emanator editor tool"},{id:"bangaz",label:"Bangaz Drum Machine",icon:"🥁",description:"Drum machine patter editor tool"},{id:"arpy",label:"Arpy Arpeggiator Editor",icon:"🎼",description:"Arpeggiator editor tool"},{id:"about",label:"About",icon:"ℹ️",description:"Project information and credits"}]}})(),f=u=>{if(o!=="main"&&i)i(u);else{t(u);let x=u,g;switch(x){case"kasm":g=[{id:"all-instruments"},{id:"oscillators"},{id:"synthesizers"},{id:"effects"},{id:"sequencers"},{id:"midi-devices"},{id:"presets"}];break;case"tech":g=[{id:"webmidi"},{id:"webgpu"}];break;default:g=[]}g.length===0&&s(!1)}},b=()=>{t&&t("bangaz")},h=()=>{s(!n)};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:`hamburger-menu ${n?"open":""}`,onClick:h,"aria-label":"Toggle navigation menu","aria-expanded":n,children:[e.jsx("span",{className:"hamburger-line"}),e.jsx("span",{className:"hamburger-line"}),e.jsx("span",{className:"hamburger-line"})]}),n&&e.jsx("div",{className:"sidebar-overlay",onClick:()=>s(!1)}),e.jsxs("nav",{className:`sidebar ${n?"open":""}`,children:[e.jsxs("div",{className:"sidebar-header",children:[e.jsxs("h2",{className:"sidebar-title",children:[e.jsx("span",{className:"sidebar-icon",children:"🚀"}),"Kasm SDK"]}),e.jsx("button",{className:"sidebar-close",onClick:()=>s(!1),"aria-label":"Close navigation menu",children:"✕"})]}),o!=="main"&&e.jsx("div",{className:"sidebar-back-main",children:e.jsx("button",{className:"nav-link",style:{width:"100%",marginBottom:"1em",background:"#ffe4b5",color:"#3D3426",fontWeight:"bold"},onClick:b,children:"← Back to Main"})}),e.jsx("div",{className:"sidebar-nav",children:e.jsx("ul",{className:"nav-list",children:d.map(u=>e.jsx("li",{className:"nav-item",children:e.jsxs("button",{className:`nav-link ${r===u.id?"active":""}`,onClick:()=>f(u.id),"aria-current":r===u.id?"page":void 0,children:[e.jsx("span",{className:"nav-icon",children:u.icon}),e.jsxs("div",{className:"nav-content",children:[e.jsx("span",{className:"nav-label",children:u.label}),e.jsx("span",{className:"nav-description",children:u.description})]})]})},u.id))})})]})]})};function te(){const[r,t]=c.useState("bangaz"),o=c.useRef(null);c.useEffect(()=>{const d=new URLSearchParams(window.location.search).get("app");d&&["kasm","tech","about","bangaz","arpy"].includes(d)?t(d):d&&["webmidi","webgpu"].includes(d)&&t("tech")},[]),c.useEffect(()=>{},[r]);const i=r==="kasm"||r==="emanator",n=()=>r==="kasm"?"kasm":r==="tech"?"tech":"main";c.useEffect(()=>{if(!o.current)return;const l=o.current,d=new U(l);let f;const b=async()=>{await d.initialize()&&(d.resize(window.innerWidth,window.innerHeight),h())},h=()=>{const M=N([0,0,5],[0,0,0],[0,1,0]),I=window.innerWidth/window.innerHeight,P=G(45*(Math.PI/180),I,.1,100);d.render([],M,P),f=requestAnimationFrame(h)};b();const u=()=>{d.resize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",u),()=>{window.removeEventListener("resize",u),cancelAnimationFrame(f),d.dispose()}},[]);const s=l=>{t(l)};return e.jsxs(e.Fragment,{children:[e.jsx("canvas",{ref:o,style:{position:"fixed",top:0,left:0,zIndex:-1,width:"100vw",height:"100vh"}}),e.jsxs("div",{className:"App",children:[e.jsx(ee,{currentApp:r,onAppChange:s,appContext:n()}),e.jsxs("div",{className:`app-content ${i?"standalone-mode":""}`,children:[r==="bangaz"&&e.jsx("div",{children:"Bangaz app is now managed as a submodule."}),r==="arpy"&&e.jsx("div",{children:"Arpy app is now managed as a submodule."}),r==="kasm"&&e.jsx(V,{}),r==="emanator"&&e.jsx("div",{children:"Emanator app is now managed as a submodule."}),r==="tech"&&e.jsx(H,{}),r==="about"&&e.jsx(Z,{})]})]})]})}T.createRoot(document.getElementById("root")).render(e.jsx(c.StrictMode,{children:e.jsx(te,{})}));
