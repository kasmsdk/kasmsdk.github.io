import{r as c,j as e,C as G,u as z,T as x,B as R,S as q,P as ee,R as M,c as te}from"./three-B0kUcY50.js";import"./vendor-9sitkZcQ.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(r){if(r.ep)return;r.ep=!0;const a=s(r);fetch(r.href,a)}})();const ne=`
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
`,se=`
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
var metallic_texture: texture_2d<f32>;

@fragment
fn fs_main(input: FragmentInput) -> @location(0) vec4<f32> {
  let uv = input.uv;
  let world_pos = input.world_position;
  let normal = normalize(input.normal);

  // Sample metallic texture for base color
  var base_color = textureSample(metallic_texture, texture_sampler, uv).rgb;

  // Lighting calculation
  let light_dir = normalize(uniforms.light_position - world_pos);
  let view_dir = normalize(-world_pos); // Assuming camera at origin
  let half_dir = normalize(light_dir + view_dir);

  // Diffuse lighting
  let diffuse = max(0.0, dot(normal, light_dir));

  // Specular lighting (stronger for metallic)
  let specular = pow(max(0.0, dot(normal, half_dir)), 64.0) * 0.5;

  // Ambient lighting
  let ambient = 0.4;

  // Final color composition
  let final_color = base_color * (ambient + diffuse * 0.7) + vec3<f32>(specular);

  return vec4<f32>(final_color, 1.0);
}
`;class ie{device;pipeline=null;uniformBuffer=null;metallicTexture=null;bindGroup=null;constructor(n){this.device=n}async initialize(){const n=this.device.createShaderModule({code:ne}),s=this.device.createShaderModule({code:se});this.uniformBuffer=this.device.createBuffer({size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const i=await fetch("./src/assets/textures/metallic.png"),r=await createImageBitmap(await i.blob());this.metallicTexture=this.device.createTexture({size:[r.width,r.height,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),this.device.queue.copyExternalImageToTexture({source:r},{texture:this.metallicTexture},[r.width,r.height]);const a=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"unfilterable-float"}}]}),o=this.device.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"repeat",addressModeV:"repeat"});this.bindGroup=this.device.createBindGroup({layout:a,entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:o},{binding:2,resource:this.metallicTexture.createView()}]}),this.pipeline=this.device.createRenderPipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[a]}),vertex:{module:n,entryPoint:"vs_main",buffers:[{arrayStride:32,attributes:[{format:"float32x3",offset:0,shaderLocation:0},{format:"float32x3",offset:12,shaderLocation:1},{format:"float32x2",offset:24,shaderLocation:2}]}]},fragment:{module:s,entryPoint:"fs_main",targets:[{format:"bgra8unorm"}]},primitive:{topology:"triangle-list",cullMode:"back"}})}updateUniforms(n,s,i,r){if(!this.uniformBuffer)return;const a=new Float32Array(40);a.set(n,0),a.set(s,16),a[32]=i,a.set(r,33),this.device.queue.writeBuffer(this.uniformBuffer,0,a.buffer)}render(n,s,i,r){!this.pipeline||!this.bindGroup||(n.setPipeline(this.pipeline),n.setBindGroup(0,this.bindGroup),n.setVertexBuffer(0,s),n.setIndexBuffer(i,"uint16"),n.drawIndexed(r))}}class re{device=null;context=null;canvas;fallbackToWebGL=!1;webglContext=null;sandstoneMaterial=null;quadVertexBuffer=null;quadIndexBuffer=null;depthTexture=null;constructor(n){this.canvas=n}async initialize(){try{if("gpu"in navigator&&navigator.gpu){const n=navigator.gpu,s=await n.requestAdapter();if(s&&(this.device=await s.requestDevice(),this.context=this.canvas.getContext("webgpu"),this.context&&this.device))return this.context.configure({device:this.device,format:n.getPreferredCanvasFormat(),alphaMode:"premultiplied"}),this.sandstoneMaterial=new ie(this.device),await this.sandstoneMaterial.initialize(),this.createFullScreenQuad(),!0}}catch{}return this.initializeWebGL()}initializeWebGL(){try{if(this.webglContext=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl"),this.webglContext)return this.fallbackToWebGL=!0,this.webglContext.enable(this.webglContext.DEPTH_TEST),this.webglContext.enable(this.webglContext.CULL_FACE),!0}catch{}return!1}render(n,s,i){this.fallbackToWebGL?this.renderWebGL(n,s,i):this.renderWebGPU(n,s,i)}renderWebGPU(n,s,i){if(!this.device||!this.context)return;const r=this.device.createCommandEncoder(),o={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]},l=r.beginRenderPass(o);if(this.sandstoneMaterial&&this.quadVertexBuffer&&this.quadIndexBuffer){const d=performance.now()/1e3,y=new Float32Array([2,5,10]),g=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),m=new Float32Array(16);m.set([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),this.sandstoneMaterial.updateUniforms(m,g,d,y),this.sandstoneMaterial.render(l,this.quadVertexBuffer,this.quadIndexBuffer,6)}for(const d of n)this.renderObjectWebGPU(l,d,s,i);l.end(),this.device.queue.submit([r.finish()])}renderObjectWebGPU(n,s,i,r){s.mesh}createFullScreenQuad(){if(!this.device)return;const n=new Float32Array([-1,-1,.999,0,0,1,0,1,1,-1,.999,0,0,1,1,1,1,1,.999,0,0,1,1,0,-1,1,.999,0,0,1,0,0]),s=new Uint16Array([0,1,2,0,2,3]);this.quadVertexBuffer=this.device.createBuffer({size:n.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.quadVertexBuffer.getMappedRange()).set(n),this.quadVertexBuffer.unmap(),this.quadIndexBuffer=this.device.createBuffer({size:s.byteLength,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0}),new Uint16Array(this.quadIndexBuffer.getMappedRange()).set(s),this.quadIndexBuffer.unmap()}renderWebGL(n,s,i){if(!this.webglContext)return;const r=this.webglContext;r.clearColor(0,0,0,1),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),r.viewport(0,0,this.canvas.width,this.canvas.height);for(const a of n)this.renderObjectWebGL(a,s,i)}renderObjectWebGL(n,s,i){this.webglContext}resize(n,s){this.canvas.width=n,this.canvas.height=s,this.isWebGPU()&&this.device&&this.context&&(this.context.configure({device:this.device,format:navigator.gpu.getPreferredCanvasFormat(),alphaMode:"premultiplied"}),this.depthTexture&&this.depthTexture.destroy(),this.depthTexture=this.device.createTexture({size:[n,s],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT})),this.fallbackToWebGL&&this.webglContext&&this.webglContext.viewport(0,0,n,s)}dispose(){this.device&&this.device.destroy(),this.device=null,this.context=null,this.webglContext=null}isWebGPU(){return!this.fallbackToWebGL&&this.device!==null}isWebGL(){return this.fallbackToWebGL&&this.webglContext!==null}}function oe(t,n,s,i){const r=1/Math.tan(t/2),a=1/(s-i);return new Float32Array([r/n,0,0,0,0,r,0,0,0,0,(i+s)*a,-1,0,0,2*i*s*a,0])}function ae(t,n,s){const i=H(le(t,n)),r=H(P(s,i)),a=P(i,r);return new Float32Array([r[0],a[0],i[0],0,r[1],a[1],i[1],0,r[2],a[2],i[2],0,-W(r,t),-W(a,t),-W(i,t),1])}function le(t,n){return[t[0]-n[0],t[1]-n[1],t[2]-n[2]]}function P(t,n){return[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]}function W(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function H(t){const n=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);return n>0?[t[0]/n,t[1]/n,t[2]/n]:[0,0,0]}const V=c.forwardRef(({src:t="/latest/kasm_canvas_jog_obs.html",title:n="Jog Canvas",width:s=150,height:i=150,style:r={},midiData:a},o)=>{const l=c.useRef(null);return c.useEffect(()=>{a&&l.current&&l.current.contentWindow&&l.current.contentWindow.postMessage({type:"MIDI_DATA",...a},"*")},[a]),c.useImperativeHandle(o,()=>({callKasmFunction:(d,y)=>{l.current&&l.current.contentWindow&&l.current.contentWindow.postMessage({type:"KASM",func:d,args:y},"*")}})),e.jsx("iframe",{ref:l,src:t,title:n,width:s,height:i,style:{border:"1px solid #ccc",borderRadius:"8px",...r}})}),I=({className:t="",style:n})=>e.jsxs("button",{className:`kasm-demo-btn-cart ${t}`.trim(),style:n,onClick:()=>window.open("https://pyrmontbrewery.com/get_kasm","_blank"),title:"Buy and get updates to the Kasm SDK",children:["🛒 ",e.jsx("br",{}),"Buy",e.jsx("br",{}),"Kasm"]}),S=()=>{const t=c.useRef(null);return c.useEffect(()=>{const n=s=>{t.current&&t.current.contentWindow&&t.current.contentWindow.postMessage({type:"KASM_KEY",key:s.key,code:s.code,altKey:s.altKey,ctrlKey:s.ctrlKey,shiftKey:s.shiftKey,metaKey:s.metaKey},"*")};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),e.jsxs("div",{style:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"},onClick:()=>{t.current&&t.current.focus()},children:[e.jsx("iframe",{ref:t,src:"/latest/emanator.html",title:"Kasm Demo",width:"90%",height:"1024",style:{width:"90vw",height:"90vh",minHeight:"2750px",display:"block",border:"2px solid #ccc",borderRadius:"12px",boxShadow:"0 2px 16px rgba(0,0,0,0.12)"},allowFullScreen:!0,tabIndex:-1,onLoad:()=>{t.current&&t.current.focus()}}),e.jsx(I,{})]})},ce=()=>{const t=c.useRef(null);return c.useEffect(()=>{function n(){const l=Math.floor(8)+1;return 40+5*Math.floor(Math.random()*l)}const s=100,i=setInterval(()=>{const r=n(),a=t.current;a&&a.callKasmFunction("update_canvas_data",{pitch:r,velocity:s,cc:!1}),a&&a.callKasmFunction("update_canvas_data",{pitch:r-10,velocity:0,cc:!1})},500);return()=>clearInterval(i)},[]),e.jsxs("p",{children:["Whats New: New Components added in Kasm v1.14.3!",e.jsx("br",{}),"Jog - video jogger canvas kasm_canvas_jog.rs",e.jsx("br",{}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"20px",margin:"16px 0"},children:[e.jsx(V,{ref:t}),e.jsxs("button",{className:"kasm-demo-btn",title:"Download Jog as Ableton Live 12.2 M4L device",onClick:()=>{const n=document.createElement("a");n.href="/latest/Kasm%20Jog.amxd",n.download="Kasm Jog.amxd",document.body.appendChild(n),n.click(),document.body.removeChild(n)},children:["⬇️",e.jsx("br",{}),"Kasm Jog.amxd"]})]}),e.jsx(S,{})]})},B=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Emanator"}),e.jsx("p",{children:"Emanators are a core feature of the Kasm SDK. They are responsible for generating and transforming MIDI data in various ways."}),e.jsx("h2",{children:"How to add your own Emanators"}),e.jsxs("p",{children:["Emanators are executed using the ",e.jsx("code",{children:"execute_emanator"})," function in your Rust code. You provide the index of the emanator you want to use, along with various MIDI and control parameters.",e.jsx("pre",{children:e.jsx("code",{children:`
/// Morse Code repeater with rhythmic patterns
pub fn rhythmic_morse_code(
    note: i32,
    offset: i32,
    velocity: i32,
    enc1_velocity_offset: i32,
    enc2_intensity: i32,
    _time_step: i32,
    _time_bar: i32,
) -> i32 {
    let root_note = (note + offset).max(0).min(127);
    let base_velocity = (velocity + (enc1_velocity_offset / 10)).max(30).min(127);
    let intensity_factor = enc2_intensity.max(1).min(127) as f32 / 32.0;

    // Morse code patterns for different notes
    let morse_alphabet = [
        ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---",
        "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",
        "..-", "...-", ".--", "-..-", "-.--", "--..",
    ];

    let morse_index = ((root_note + enc1_velocity_offset) as usize) % morse_alphabet.len();
    let morse_pattern = morse_alphabet[morse_index];

    let dot_duration = (120.0 * intensity_factor) as i32;
    let dash_duration = (360.0 * intensity_factor) as i32;
    let element_gap = (120.0 * intensity_factor) as i32;

    let mut current_delay = 0;
    let total_elements = morse_pattern.len();
    
    for (i, morse_char) in morse_pattern.chars().enumerate() {
        let pan_angle = (i as f32 / total_elements as f32) * 2.0 * std::f32::consts::PI;
        let pan_position = ((pan_angle.cos() + 1.0) * 63.5) as i32;

        let (duration, pitch_offset) = match morse_char {
            '.' => (dot_duration, 0),
            '-' => (dash_duration, 12),
            _ => continue,
        };

        let morse_note = (root_note + pitch_offset).max(0).min(127);
        let morse_velocity = (base_velocity as f32 * (0.8 + 0.4 * intensity_factor)) as i32;

        send_note(
            morse_note,
            morse_velocity.max(30).min(127),
            current_delay,
            duration,
            pan_position,
        );

        current_delay += duration + element_gap;
    }

    root_note
}
`})})]}),e.jsx("p",{children:e.jsx("pre",{children:e.jsx("code",{children:`/// Simple first-order Markov chain with basic note transitions
pub fn rhythmic_markov_chain(
    note: i32,
    offset: i32,
    velocity: i32,
    enc1_intensity: i32,
    enc2_complexity: i32,
    _time_step: i32,
    _time_bar: i32,
) -> i32 {
    let root_note = (note + offset).max(0).min(127);
    let intensity_factor = (enc1_intensity.max(50).min(127) as f64 + 50.0) / 127.0;
    let complexity_factor = (enc2_complexity.max(40).min(127) as f64 + 40.0) / 127.0;

    // Simple first-order Markov transition matrix
    let transition_matrix = [
        [0.3, 0.2, 0.2, 0.1, 0.1, 0.05, 0.03, 0.02],
        [0.2, 0.1, 0.3, 0.2, 0.1, 0.05, 0.03, 0.02],
        [0.15, 0.2, 0.2, 0.2, 0.15, 0.05, 0.03, 0.02],
        [0.1, 0.15, 0.2, 0.2, 0.2, 0.1, 0.03, 0.02],
        [0.2, 0.1, 0.15, 0.15, 0.2, 0.15, 0.03, 0.02],
        [0.15, 0.1, 0.1, 0.15, 0.2, 0.2, 0.08, 0.02],
        [0.3, 0.15, 0.1, 0.1, 0.15, 0.15, 0.03, 0.02],
        [0.4, 0.2, 0.15, 0.1, 0.1, 0.03, 0.01, 0.01],
    ];

    let intervals = [0, 2, 4, 5, 7, 9, 11, 12];
    let sequence_length = (12.0 + complexity_factor * 8.0) as usize;
    let mut current_state = 0;

    for step in 0..sequence_length {
        let note_interval = intervals[current_state];
        let sequence_note = (root_note + note_interval).max(0).min(127);

        let base_delay = (step as f64 * 400.0 * intensity_factor) as i32;
        let ripple_delay = ((step as f64 * 0.3).sin() * 100.0) as i32;
        let final_delay = base_delay + ripple_delay;

        let base_velocity = (velocity as f64 * (0.8 + 0.2 * intensity_factor)) as i32;
        let velocity_variation = ((step as f64 * 0.7).sin() * 15.0) as i32;
        let sequence_velocity = (base_velocity + velocity_variation).max(40).min(100);

        let duration = (500.0 + (step as f64 * 0.2).cos() * 200.0) as i32;
        let final_duration = duration.max(300);

        let pan_position = ((step as f64 * 0.1).sin() * 30.0 + 64.0) as i32;

        send_note(
            sequence_note,
            sequence_velocity,
            final_delay,
            final_duration,
            pan_position,
        );

        // Determine next state using Markov probabilities
        let random_value = ((step * 17 + current_state * 23) % 1000) as f64 / 1000.0;
        let mut cumulative_prob = 0.0;
        let mut next_state = 0;

        for (state, &prob) in transition_matrix[current_state].iter().enumerate() {
            cumulative_prob += prob;
            if random_value <= cumulative_prob {
                next_state = state;
                break;
            }
        }
        current_state = next_state;
    }

    root_note
}
`})})}),e.jsxs("p",{children:["The emanator.rs contains a simple registry, to add your new emanators to it simply adda short description and you added functions, e.g.",e.jsx("pre",{children:e.jsx("code",{children:`
  pub fn get_emanator_infos() -> Vec<EmanatorInfo> {
      vec![
          EmanatorInfo {
              emanator_idx: MAX4LIVE_UI_EMANATORS_OFFSET_RHYTHMIC,
              name: "Morse Code",
              description: "Morse code patterns with rhythmic timing",
              category: EmanatorCategory::Rhythmic,
              complexity: 4,
              function: rhythmic_morse_code,
          },
          EmanatorInfo {
            emanator_idx: MAX4LIVE_UI_EMANATORS_OFFSET_RHYTHMIC + 1,
              name: "Markov Chain",
              description: "Markov chain-based rhythmic patterns",
              category: EmanatorCategory::Rhythmic,
              complexity: 5,
              function: rhythmic_markov_chain,
          }, 
          ...
`})})]}),e.jsx("h2",{children:"Emanator Categories"}),e.jsx("p",{children:"The Kasm SDK comes with a few example Emanators for some ideas to get you started, they are organized into the following categories:"}),e.jsx("h3",{children:"Harmonic Emanators"}),e.jsxs("p",{children:["Harmonic emanators focus on generating harmonic content, such as chord progressions and harmonic series.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Chord Progression:"})," Classic chord progressions with well-known patterns."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Simple Chord:"})," Basic major triad chord."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Extended Inversions:"})," Extended chords with inversions."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Complex Extensions:"})," Complex chord progressions with extensions and rhythmic variations."]})]})]}),e.jsx("h3",{children:"Rhythmic Emanators"}),e.jsxs("p",{children:["Rhythmic emanators focus on generating rhythmic and percussive patterns.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Morse Code:"})," Morse code patterns with rhythmic timing."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Markov Chain:"})," Markov chain-based rhythmic patterns."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Wave Interference:"})," Trigonometric wave interference patterns."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Complex Reflection:"})," Physics-based reflection algorithms."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Balkan 7/8:"})," Balkan 7/8 rhythm (aksak)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"West African Bell:"})," West African bell pattern (12/8 cross-rhythm)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Indian Tintal:"})," Indian Tintal (16-beat cycle)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Latin son clave:"})," Latin son clave (3-2)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Jazz Swing 8ths:"})," Jazz swing eighths."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fibonacci rhythm:"})," Fibonacci rhythm (5, 8, 13, ...)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Golden ratio pulse:"})," Golden ratio pulse."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Prime number rhythm:"})," Prime number rhythm."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Balkan 11/8 (3+2+3+3):"})," Balkan 11/8 (3+2+3+3)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Contemporary tuplets (5:4):"})," Contemporary tuplets (5:4)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Afro-Cuban 6/8 bell:"})," Afro-Cuban 6/8 bell."]})]})]}),e.jsx("h3",{children:"Melodic Emanators"}),e.jsxs("p",{children:["Melodic emanators focus on generating simple melodic patterns and sequences.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Phone Ringtone:"})," Classic phone ringtone melody with humanization."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Strummed Cascade:"})," Cascading glissando with stereo spread."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Elaborate Panning:"})," Melodic patterns with dynamic panning."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Advanced Rhythmic:"})," Complex melodic patterns with rhythmic variations."]})]})]}),e.jsx("h3",{children:"Progression Emanators"}),e.jsxs("p",{children:["Progression emanators generate musical progressions, including classic cadences and more complex harmonic sequences.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Circle of Fifths:"})," Circle of Fifths progression with modulation and panning."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Stepwise Progression:"})," Diatonic stepwise progression."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Plagal Cadence:"})," IV-I plagal cadence."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Deceptive Cadence:"})," V-vi deceptive cadence."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Modal Mixture:"})," Modal mixture progression."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Descending Fifths:"})," Descending fifths progression."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Jazz Turnaround:"})," I-vi-ii-V jazz turnaround."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chromatic Mediant:"})," Chromatic mediant progression."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Neapolitan Chord:"})," Neapolitan chord progression."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Augmented Sixth:"})," Augmented sixth progression."]})]})]}),e.jsx("h3",{children:"Responsorial Chant Emanators"}),e.jsxs("p",{children:["Responsorial chant emanators generate call and response patterns inspired by Gregorian chant and other responsorial traditions.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Chant Dorian Call-Response:"})," Call and response in Dorian mode (chant style)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chant Psalm Tone:"})," Gregorian psalm tone formula."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chant Ornamented Response:"})," Responsorial echo with ornamentation."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chant with Drone:"})," Responsorial chant with ison (drone)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chant Antiphonal:"})," Antiphonal (alternating) chant."]})]})]}),e.jsx("h3",{children:"Spatial Emanators"}),e.jsxs("p",{children:["Spatial emanators focus on creating spatial and panning effects.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Harmonic Resonance:"})," Harmonic series with spatial positioning."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Swarm Movement:"})," Boids algorithm with spatial audio."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Circular Panning:"})," Dynamic circular panning effects."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"3D Positioning:"})," Simulated 3D spatial positioning."]})]})]}),e.jsx("h3",{children:"Mathematical Emanators"}),e.jsxs("p",{children:["Mathematical emanators use algorithmic and mathematical patterns to generate MIDI.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Fibonacci Spiral:"})," Fibonacci timing with golden ratio velocity decay."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fractal Cascade:"})," Fractal echo patterns at different time scales."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Swarming Spirals:"})," Bumblebee flight patterns with Fibonacci timing."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fractal Chaos:"})," L-systems, strange attractors, and chaos theory."]})]})]}),e.jsx("h3",{children:"Experimental Emanators"}),e.jsxs("p",{children:["Experimental emanators explore chaotic and unconventional patterns.",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Multidimensional Markov:"})," Multi-dimensional Markov chain with harmonic context."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Second Order Markov:"})," Second-order Markov chain with rhythm patterns."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chaos Game Harmony:"})," Chaos game algorithm for counterpoint harmony."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Complex Drums:"})," Complex drum patterns using golden ratio mathematics."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Cellular Automaton:"})," Cellular automaton melody generator (Rule 30)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Euclidean Rhythm:"})," Euclidean rhythm pattern generator."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"L-System:"})," L-system based melody generator."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Microtonal 24-TET:"})," Microtonal melody generator using 24-TET."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Brownian Walk:"})," Stochastic Brownian walk melody generator."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Spectral Texture:"})," Spectral overtone texture generator."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Recursive Pattern:"})," Recursive self-similar pattern generator."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Parameter Morphing:"})," Dynamic parameter morphing melody generator."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Polymetric (3:4):"})," Polymetric engine generating 3:4 patterns."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Polytempo Engine:"})," Polytempo engine for variable speed patterns."]})]})]}),e.jsx(S,{})]}),Y=()=>{const t=c.useRef(null);return c.useEffect(()=>{const n=s=>{t.current&&t.current.contentWindow&&t.current.contentWindow.postMessage({type:"KASM_KEY",key:s.key,code:s.code,altKey:s.altKey,ctrlKey:s.ctrlKey,shiftKey:s.shiftKey,metaKey:s.metaKey},"*")};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),e.jsxs("div",{style:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"},onClick:()=>{t.current&&t.current.focus()},children:[e.jsx("iframe",{ref:t,src:"/latest/arpy.html",title:"Kasm Demo",style:{width:"90vw",height:"90vh",minHeight:"850px",display:"block",border:"2px solid #ccc",borderRadius:"12px",boxShadow:"0 2px 16px rgba(0,0,0,0.12)"},allowFullScreen:!0,tabIndex:-1,onLoad:()=>{t.current&&t.current.focus()}}),e.jsx(I,{})]})},de=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Arpy"}),e.jsx("p",{children:"Arpy is the arpeggiator engine in the Kasm SDK. It provides a powerful and flexible way to create complex arpeggios and sequences."}),e.jsx("h2",{children:"How to Use Arpy"}),e.jsxs("p",{children:["The Arpy engine is controlled through MIDI note messages. When Arpy is active, incoming MIDI note-on messages add notes to the arpeggiator's chord, and note-off messages remove them. The arpeggiator then generates a sequence based on the currently held notes and the selected mode.",e.jsx("br",{}),e.jsx("br",{}),"src/kasm_arpeggiator.rs",e.jsx("pre",{children:e.jsx("code",{children:`
fn generate_note_sequence() -> Vec<i32> {
    let held_notes = HELD_NOTES.lock().unwrap();
    let mode = *ARPEGGIATOR_MODE.lock().unwrap();

    let notes: Vec<i32> = held_notes.iter().map(|n| n.note).collect();

    match mode {
        ArpeggiatorMode::Up => notes,
        ArpeggiatorMode::Down => {
            let mut reversed = notes;
            reversed.reverse();
            reversed
        },
        ArpeggiatorMode::UpDown => {
            let mut sequence = notes.clone();
            let mut down = notes;
            down.reverse();
            if down.len() > 1 {
                down.remove(0); // Remove duplicate of highest note
            }
            if sequence.len() > 1 {
                down.remove(down.len() - 1); // Remove duplicate of lowest note
            }
            sequence.extend(down);
            sequence
        },
        ArpeggiatorMode::DownUp => {
            let mut sequence = notes.clone();
            sequence.reverse();
            let mut up = notes;
            if up.len() > 1 {
                up.remove(0); // Remove duplicate of lowest note
            }
            if sequence.len() > 1 {
                up.remove(up.len() - 1); // Remove duplicate of highest note
            }
            sequence.extend(up);
            sequence
        },
        ArpeggiatorMode::Random => {
            let mut rng = crate::SimpleRng::new(get_current_time_ms() as u32);
            let mut shuffled = notes;
            let len = shuffled.len();
            for i in 0..len {
                let j = (rng.next() as usize) % len;
                shuffled.swap(i, j);
            }
            shuffled
        },
        ...
`})})]}),e.jsx("h2",{children:"Arpeggiator Modes"}),e.jsxs("p",{children:["Arpy includes a wide variety of arpeggiator modes:",e.jsx("br",{}),e.jsxs("ul",{children:[e.jsx("li",{children:"Up"}),e.jsx("li",{children:"Down"}),e.jsx("li",{children:"UpDown"}),e.jsx("li",{children:"DownUp"}),e.jsx("li",{children:"Random"}),e.jsx("li",{children:"Flow"}),e.jsx("li",{children:"UpIn"}),e.jsx("li",{children:"DownIn"}),e.jsx("li",{children:"ExpandingUp"}),e.jsx("li",{children:"ExpandingDown"}),e.jsx("li",{children:"LowAndUp"}),e.jsx("li",{children:"LowAndDown"}),e.jsx("li",{children:"HiAndUp"}),e.jsx("li",{children:"HiAndDown"}),e.jsx("li",{children:"Chord"}),e.jsx("li",{children:"Octaves"}),e.jsx("li",{children:"UpDownRepeat"}),e.jsx("li",{children:"DownUpRepeat"}),e.jsx("li",{children:"DoubledUp"}),e.jsx("li",{children:"DoubledDown"}),e.jsx("li",{children:"Converge"}),e.jsx("li",{children:"Diverge"}),e.jsx("li",{children:"ConvergeDiverge"}),"... etc"]})]}),e.jsx(Y,{}),"Q"]}),X=()=>{const t=c.useRef(null);return c.useEffect(()=>{const n=s=>{t.current&&t.current.contentWindow&&t.current.contentWindow.postMessage({type:"KASM_KEY",key:s.key,code:s.code,altKey:s.altKey,ctrlKey:s.ctrlKey,shiftKey:s.shiftKey,metaKey:s.metaKey},"*")};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),e.jsxs("div",{style:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"},onClick:()=>{t.current&&t.current.focus()},children:[e.jsx("iframe",{ref:t,src:"/latest/bangaz.html",title:"Kasm Demo",style:{width:"90vw",height:"90vh",minHeight:"850px",display:"block",border:"2px solid #ccc",borderRadius:"12px",boxShadow:"0 2px 16px rgba(0,0,0,0.12)"},allowFullScreen:!0,tabIndex:-1,onLoad:()=>{t.current&&t.current.focus()}}),e.jsx(I,{})]})},he=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Bangaz"}),e.jsx("p",{children:"Bangaz is the drum pattern generator in the Kasm SDK. It allows you to create and play a variety of drum beats and rhythms."}),e.jsx("h2",{children:"How to create your own Bangaz drum patterns"}),e.jsxs("p",{children:["The Bangaz drum machine is controlled by selecting a drum pattern. Once a pattern is selected, the drum machine will start playing in sync with the host's transport. You can assign different MIDI notes to each drum sound to customize your kit.",e.jsx("br",{}),e.jsx("br",{}),"src/emanators/drumpattern.rs",e.jsx("pre",{children:e.jsx("code",{children:`
pub fn kasm_emanator_bangaz_1(
    _inlet_0_note: i32,
    _inlet_1_semitone: i32,
    _velocity: i32,
    enc1: i32,
    _enc2: i32,
    step: i32,
    _bar: i32,
) -> i32 {
    // Creative enc1 usage: 100 = normal, <100 = probabilistic beat skipping, >100 = fills and ghost hits
    let enc1_norm = if enc1 <= 100 {
        enc1 as f32 / 100.0 // Linear scaling for 0-100 range
    } else {
        // Exponential scaling for 100-127 range to amplify effect
        let excess = (enc1 - 100) as f32 / 27.0; // 0.0 to 1.0 for range 100-127
        1.0 + excess.powf(1.5) * 2.0 // Scale from 1.0 to 3.0 with exponential curve
    };
    let chaos_factor = (enc1_norm - 1.0).abs(); // Distance from normal (0.0 at enc1=100)

    // Calculate complexity factors based on all input parameters
    let note_complexity = ((_inlet_0_note - 60).max(0) as f32 / 127.0).min(1.0);
    let semitone_complexity = (_inlet_1_semitone.max(0) as f32 / 12.0).min(1.0);
    let combined_complexity = (note_complexity + semitone_complexity + enc1_norm) / 3.0;

    // Mathematical probability functions using golden ratio and prime numbers
    let phi = (1.0 + 5.0_f32.sqrt()) / 2.0; // Golden ratio for natural feel
    let step_f = step as f32;

    // Probability modulation using trigonometric chaos
    let prob_mod = (step_f * phi * 0.1 + chaos_factor * std::f32::consts::PI).sin() * 0.5 + 0.5;

    // Beat probability calculation
    let beat_prob = if enc1 < 100 {
        // Below 100: reduce probability using exponential decay
        enc1_norm.powf(1.5) * (0.7 + prob_mod * 0.3)
    } else {
        1.0 // Always hit main beats when enc1 >= 100
    };

    // Ghost hit probability for enc1 > 100
    let ghost_prob = if enc1 > 100 {
        ((enc1_norm - 1.0) * 2.0).min(1.0) * (0.3 + prob_mod * 0.4)
    } else {
        0.0
    };

    // Fill intensity for enc1 > 100 using Fibonacci-based chaos
    let fib_sequence = [1, 1, 2, 3, 5, 8, 13, 21];
    let fib_index = (step % 8) as usize;
    let fill_trigger = if enc1 > 100 {
        let fill_intensity = ((enc1_norm - 1.0) * 1.5).min(1.0);
        (step % fib_sequence[fib_index] == 0) && (prob_mod > (1.0 - fill_intensity))
    } else {
        false
    };

    // Progressive drum type introduction based on complexity
    let use_advanced_percussion = combined_complexity > 0.6;
    let use_exotic_drums = combined_complexity > 0.7;
    let use_world_percussion = combined_complexity > 0.8;

    // Subtle use of all DrumTypes with probability modulation
    if step % 4 == 0 {
        // Main kick - always respect beat probability
        let kick_vel = 127 + (chaos_factor * 20.0) as i32;
        send_note(get_drum_note(DrumType::Kick), kick_vel.min(127), 0, 100, 30);
        send_note(get_drum_note(DrumType::RideCymbal1), 80, 0, 100, 90); // Ride on downbeat

        // Add BassDrum layer when complexity increases
        if use_advanced_percussion {
            send_note(get_drum_note(DrumType::BassDrum), (kick_vel as f32 * 0.8) as i32, 0, 100, 20);
        }

        // Ghost kick when enc1 > 100
        if ghost_prob > 0.0 && prob_mod < ghost_prob {
            let ghost_delay = ((chaos_factor * 7.0) as i32).max(1);
            if step % ghost_delay == 0 {
                send_note(get_drum_note(DrumType::Kick), 60, 0, 100, 127 - 30);
            }
        }
        return get_drum_note(DrumType::Kick);
    } else if step % 4 == 2 {
        // Snare with probability and ghost hits
        if prob_mod < beat_prob {
            let snare_vel = 127 + (chaos_factor * 15.0) as i32;
            send_note(get_drum_note(DrumType::Snare), snare_vel.min(127), 0, 100, 80);
            send_note(get_drum_note(DrumType::Clap), 90, 0, 100, 100); // Layered clap

            // Add ElectricSnare and SideStick when complexity increases
            if use_advanced_percussion {
                send_note(get_drum_note(DrumType::ElectricSnare), (snare_vel as f32 * 0.6) as i32, 0, 100, 90);
                if step % 8 == 2 {
                    send_note(get_drum_note(DrumType::SideStick), 70, 0, 100, 50);
                }
            }

            // Mathematical ghost snare pattern using prime modulo
            if ghost_prob > 0.3 && step % 7 == 3 {
                send_note(get_drum_note(DrumType::Snare), 45, 0, 100, 64);
            }
        }
        return get_drum_note(DrumType::Snare);
    } else if step % 8 == 3 {
        // Tom patterns with enhanced fills
        if prob_mod < beat_prob || fill_trigger {
            let tom_vel = if fill_trigger { 100 + (chaos_factor * 27.0) as i32 } else { 64 };
            send_note(get_drum_note(DrumType::LowTom), tom_vel.min(127), 0, 100, 64);
            send_note(get_drum_note(DrumType::HiMidTom), 60, 0, 100, 70); // Tom fill

            // Add floor toms when complexity increases
            if use_advanced_percussion {
                send_note(get_drum_note(DrumType::LowFloorTom), (tom_vel as f32 * 0.9) as i32, 0, 100, 40);
                if step % 16 == 3 {
                    send_note(get_drum_note(DrumType::HighFloorTom), (tom_vel as f32 * 0.8) as i32, 0, 100, 90);
                }
            }

            // Complex tom cascade when enc1 is extreme
            if fill_trigger && enc1 > 120 {
                let cascade_pattern = [DrumType::LowTom, DrumType::HiMidTom, DrumType::HighTom];
                for (i, &tom_type) in cascade_pattern.iter().enumerate() {
                    let cascade_vel = (80.0 - i as f32 * 10.0 + chaos_factor * 20.0) as i32;
                    let pan_offset = 64 + (i as i32 * 20 - 20);
                    send_note(get_drum_note(tom_type), cascade_vel.min(127), 0, 100, pan_offset);
                }
            }
        }
        return get_drum_note(DrumType::LowTom);
    } else if step % 8 == 6 {
        if prob_mod < beat_prob {
            send_note(get_drum_note(DrumType::HiMidTom), 127 / 2, 0, 100, 64);
            send_note(get_drum_note(DrumType::HighTom), 60, 0, 100, 80); // Tom fill

            // Add world percussion when complexity is high
            if use_world_percussion && step % 32 == 6 {
                send_note(get_drum_note(DrumType::HiBongo), 75, 0, 100, 85);
                send_note(get_drum_note(DrumType::LowBongo), 70, 0, 100, 75);
            }
        }
        return get_drum_note(DrumType::HiMidTom);
    } else if step % 16 == 9 {
        if prob_mod < beat_prob || fill_trigger {
            let tom_vel = if fill_trigger { 90 } else { 64 };
            send_note(get_drum_note(DrumType::HighTom), tom_vel, 0, 100, 64);
            send_note(get_drum_note(DrumType::Cowbell), 50, 0, 100, 90); // Cowbell accent

            // Add exotic percussion when complexity increases
            if use_exotic_drums {
                send_note(get_drum_note(DrumType::Tambourine), 60, 0, 100, 100);
                if step % 32 == 9 {
                    send_note(get_drum_note(DrumType::Vibraslap), 55, 0, 100, 110);
                }
            }
        }
        return get_drum_note(DrumType::HighTom);
    } else if step % 16 == 13 {
        if prob_mod < beat_prob {
            send_note(get_drum_note(DrumType::Clap), 127 / 2, 0, 100, 64);
            send_note(get_drum_note(DrumType::Cowbell), 127 / 2, 0, 100, 64);
            send_note(get_drum_note(DrumType::RideCymbal1), 60, 0, 100, 110); // Ride fill

            // Add cymbals when complexity increases
            if use_advanced_percussion {
                send_note(get_drum_note(DrumType::CrashCymbal1), 85, 0, 100, 120);
                if step % 64 == 13 {
                    send_note(get_drum_note(DrumType::SplashCymbal), 70, 0, 100, 100);
                }
            }

            // Add exotic cymbals at high complexity
            if use_exotic_drums && step % 128 == 13 {
                send_note(get_drum_note(DrumType::ChineseCymbal), 80, 0, 100, 127);
                send_note(get_drum_note(DrumType::RideBell), 65, 0, 100, 90);
            }
        }
        return get_drum_note(DrumType::Clap);
    }

    // Hi-hat patterns with enc1 modulation
    let hat_skip_prob = if enc1 < 100 {
        1.0 - enc1_norm.powf(0.7) // More skipping as enc1 decreases
    } else {
        0.0
    };

    // Prime number modulo for irregular skipping pattern
    let hat_skip = (step % 23 == 0) && (prob_mod < hat_skip_prob);

    if !hat_skip {
        // Dynamic hi-hat velocity based on enc1 and mathematical chaos
        let hat_vel = if enc1 > 100 {
            // Enhanced velocity with chaos when enc1 > 100
            let base_vel = 64.0 + chaos_factor * 30.0;
            let chaos_mod = (step_f * phi * 0.2).sin() * 15.0;
            (base_vel + chaos_mod) as i32
        } else {
            // Reduced velocity when enc1 < 100
            (64.0 * enc1_norm) as i32
        };

        send_note(get_drum_note(DrumType::ClosedHH), hat_vel.min(127), 0, 100, 64);

        // Add PedalHiHat when complexity increases
        if use_advanced_percussion && step % 8 == 1 {
            send_note(get_drum_note(DrumType::PedalHiHat), (hat_vel as f32 * 0.7) as i32, 0, 100, 45);
        }

        // Mathematical ghost hats using golden ratio
        if ghost_prob > 0.2 && ((step_f * phi) % 11.0) < 2.0 {
            let ghost_hat_vel = (40.0 + chaos_factor * 20.0) as i32;
            let ghost_pan = 64 + ((step_f * phi * 0.1).sin() * 30.0) as i32;
            send_note(get_drum_note(DrumType::ClosedHH), ghost_hat_vel, 0, 100, ghost_pan);
        }
    }

    if step % 2 == 0 && prob_mod < beat_prob {
        send_note(get_drum_note(DrumType::OpenHH), 60, 0, 100, 80);
        send_note(get_drum_note(DrumType::RideCymbal1), 40, 0, 100, 120);

        // Add world percussion patterns at high complexity
        if use_world_percussion {
            // Conga patterns
            if step % 16 == 0 {
                send_note(get_drum_note(DrumType::OpenHiConga), 65, 0, 100, 95);
            } else if step % 16 == 8 {
                send_note(get_drum_note(DrumType::LowConga), 70, 0, 100, 85);
                send_note(get_drum_note(DrumType::MuteHiConga), 60, 0, 100, 75);
            }

            // Timbale accents
            if step % 32 == 16 {
                send_note(get_drum_note(DrumType::HiTimbale), 75, 0, 100, 105);
                send_note(get_drum_note(DrumType::LowTimbale), 70, 0, 100, 95);
            }

            // Add exotic instruments at maximum complexity
            if combined_complexity > 0.8 {
                if step % 64 == 32 {
                    send_note(get_drum_note(DrumType::Maracas), 55, 0, 100, 115);
                    send_note(get_drum_note(DrumType::Cabasa), 50, 0, 100, 105);
                }
                if step % 128 == 64 {
                    send_note(get_drum_note(DrumType::HiAgogo), 60, 0, 100, 110);
                    send_note(get_drum_note(DrumType::LowAgogo), 58, 0, 100, 100);
                }
                if step % 256 == 128 {
                    send_note(get_drum_note(DrumType::Claves), 65, 0, 100, 90);
                    send_note(get_drum_note(DrumType::HiWoodBlock), 60, 0, 100, 80);
                }
            }
        }

        // Complex polyrhythmic fills when enc1 is extreme
        if fill_trigger && enc1 > 130 {
            // Use Euclidean rhythm generation for fills
            let euclidean_hits = ((chaos_factor * 8.0) as i32).max(3);
            let euclidean_steps = 16;
            if (step * euclidean_hits) % euclidean_steps < euclidean_hits {
                let fill_drums = if use_world_percussion {
                    [DrumType::LowTom, DrumType::HiMidTom, DrumType::Clap, DrumType::Cowbell,
                        DrumType::HiBongo, DrumType::LowBongo, DrumType::Tambourine, DrumType::Maracas]
                } else if use_exotic_drums {
                    [DrumType::LowTom, DrumType::HiMidTom, DrumType::Clap, DrumType::Cowbell,
                        DrumType::Tambourine, DrumType::Vibraslap, DrumType::SplashCymbal, DrumType::RideBell]
                } else if use_advanced_percussion {
                    [DrumType::LowTom, DrumType::HiMidTom, DrumType::Clap, DrumType::Cowbell,
                        DrumType::LowFloorTom, DrumType::HighFloorTom, DrumType::ElectricSnare, DrumType::SideStick]
                } else {
                    [DrumType::LowTom, DrumType::HiMidTom, DrumType::Clap, DrumType::Cowbell,
                        DrumType::LowTom, DrumType::HiMidTom, DrumType::Clap, DrumType::Cowbell]
                };

                let drum_idx = ((step / 4) % fill_drums.len() as i32) as usize;
                let fill_vel = (70.0 + chaos_factor * 35.0) as i32;
                let fill_pan = 64 + ((step_f * phi * 0.3).cos() * 50.0) as i32;
                send_note(get_drum_note(fill_drums[drum_idx]), fill_vel.min(127), 0, 100, fill_pan);
            }
        }
    }

    get_drum_note(DrumType::ClosedHH)
}
        `})})]}),e.jsx("p",{children:e.jsx("pre",{children:e.jsx("code",{children:`pub fn kasm_emanator_bangaz_54(
        _inlet_0_note: i32,
        _inlet_1_semitone: i32,
        velocity: i32,
        _enc1: i32,
        enc2: i32,
        step: i32,
        bar: i32,
        ) -> i32 {
        use std::f32::consts::PI;

        // Ambient dub techno - sparse and atmospheric
        let phi = (1.0 + 5.0_f32.sqrt()) / 2.0;
        let ambient_cycle = (bar as f32 * 0.05 * phi).sin();

        let base_vel = velocity + (ambient_cycle * 15.0) as i32;
        let dub_pan = (step as f32 * phi * 0.02 + bar as f32 * 0.01).sin();
        let pan = 64 + (dub_pan * 35.0) as i32;
        let cc1_dub = 64.0 + (step as f32 * PI / 32.0).sin() * (enc2 as f32 * 0.6);

        // Sparse kick pattern with mathematical spacing
        if step % 8 == 0 || (step % 32 == 20 && ambient_cycle > 0.5) {
        send_note(get_drum_note(DrumType::Kick), base_vel + 10, 0, 100, pan);
        send_note(1, cc1_dub as i32, 0, 1, 0); // Modwheel CC1
    }

        // Dub snare with reverb-like spacing
        if step % 16 == 8 || (step % 64 == 40 && ambient_cycle < -0.3) {
        send_note(
        get_drum_note(DrumType::Snare),
        base_vel + 5,
        0,
        100,
        128 - pan,
        );
        send_note(
        get_drum_note(DrumType::SideStick),
        base_vel - 20,
        0,
        100,
        pan + 25,
        );
    }

        // Ambient percussion using prime numbers
        let ambient_primes = [11, 13, 17, 19, 23, 29, 31];
        for (i, &prime) in ambient_primes.iter().enumerate() {
        if step % prime == (prime / 4) && ambient_cycle > (i as f32 * 0.2 - 0.6) {
        let perc_types = [
        DrumType::HiWoodBlock,
        DrumType::LowWoodBlock,
        DrumType::Claves,
        DrumType::RideBell,
        DrumType::Cowbell,
        DrumType::Tambourine,
        DrumType::OpenTriangle,
        ];
        let perc_idx = i % perc_types.len();
        let ambient_pan = pan + (i as i32 * 10 - 30);
        send_note(
        get_drum_note(perc_types[perc_idx]),
        base_vel - 30,
        0,
        100,
        ambient_pan,
        );
    }
    }

        // Sparse hi-hat pattern
        if step % 4 == 2 && ambient_cycle > 0.2 {
        send_note(get_drum_note(DrumType::ClosedHH), base_vel / 3, 0, 100, pan);
    }
        if step % 32 == 24 && ambient_cycle > 0.7 {
        send_note(
        get_drum_note(DrumType::OpenHH),
        base_vel / 2,
        0,
        100,
        128 - pan,
        );
    }

        get_drum_note(DrumType::ClosedHH)
    }
`})})}),e.jsxs("p",{children:["To add your new bangaz emanators to it simply adda short description and you added functions, e.g.",e.jsx("pre",{children:e.jsx("code",{children:`
    pub fn get_emanator_infos() -> Vec<EmanatorInfo> {
        vec![
            EmanatorInfo {
                emanator_idx: MAX4LIVE_UI_BANGAZ_OFFSET_PATTERNS,
                name: "Bangaz 1",
                description: "Classic four-on-the-floor kick/snare with toms, enc1 changes fills/complexity!",
                category: EmanatorCategory::DrumPattern,
                complexity: 2,
                function: kasm_emanator_bangaz_1,
            },
              ...
            EmanatorInfo {
                emanator_idx: MAX4LIVE_UI_BANGAZ_OFFSET_PATTERNS + 53,
                name: "Bangaz 54",
                description: "Ambient Dub Techno with Sparse Math Patterns",
                category: EmanatorCategory::DrumPattern,
                complexity: 2,
                function: kasm_emanator_bangaz_54,
            },
...
    `})})]}),e.jsx("h2",{children:"Drum Kits"}),e.jsxs("p",{children:["Bangaz supports several drum kit layouts:",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Ableton Drum Rack:"})," The default layout for Ableton's Drum Racks."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"General MIDI Drums:"})," The standard General MIDI drum map."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Arpeggiator:"})," A melodic layout for playing arpeggios with drum sounds."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Shuffle:"})," A randomized drum kit layout."]})]})]}),e.jsx("h2",{children:"Drum Patterns"}),e.jsxs("p",{children:["Bangaz includes a variety of built-in drum patterns, from simple to complex:",e.jsxs("ul",{children:[e.jsx("li",{children:"Four-to-the-floor kick"}),e.jsx("li",{children:"Kick and snare backbeat"}),e.jsx("li",{children:"Basic rock beat with hi-hats"}),e.jsx("li",{children:"Syncopated beat with open hi-hats"}),e.jsx("li",{children:"Polyrhythmic patterns with toms and percussion"}),e.jsx("li",{children:"And many more, accessible through the emanator system."})]})]}),e.jsx(X,{})]}),me=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Triggaz"}),e.jsx("p",{children:"Triggaz is the MIDI pattern detection engine in the Kasm SDK. It can analyze incoming MIDI data to identify melodic and rhythmic patterns."}),e.jsx("h2",{children:"How Triggaz Works"}),e.jsxs("p",{children:['Triggaz analyzes the incoming stream of MIDI notes, looking for patterns that match a predefined set of nursery rhymes and simple melodies. It considers both the pitch intervals between notes and the rhythmic timing. When a pattern is detected with a high enough confidence level, Triggaz can trigger a "tune completion" - playing the rest of the melody automatically.',e.jsx("br",{}),e.jsx("br",{}),"A key feature of Triggaz is its dynamic bass/treble split. It analyzes the range of notes being played to distinguish between bass and melody lines, allowing it to focus on the melodic content for pattern matching."]}),e.jsx("h2",{children:"How to Use Triggaz"}),e.jsxs("p",{children:["You can use the ",e.jsx("code",{children:"kasm_triggaz_detect_pattern"})," function to feed MIDI notes to the detection engine. The function returns a confidence score, and if a pattern is confidently detected, it will trigger the tune completion.",e.jsx("pre",{children:e.jsx("code",{children:`
// Rust example of using the Triggaz pattern detection
// Note pattern definitions (relative intervals from starting note)
// Each pattern: (name, intervals, timing_ratios, min_notes_to_trigger)
const PATTERNS: &[(&str, &[i32], &[f64], usize)] = &[
    // Twinkle Twinkle Little Star - "Twinkle twinkle little star" (7 notes)
    // Pattern: C C G G A A G - distinctive opening with repeated notes and fifth leap
    // Key distinction: Repeated tonic, leap to dominant, step up, return to dominant
    ("twinkle_twinkle", &[0, 0, 7, 7, 9, 9, 7], &[1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0], 7),

    // Three Blind Mice - "Three blind mice, three blind mice" (6 notes)
    // Pattern: E D C, E D C - distinctive descending thirds repeated
    // Key distinction: Descending minor third pattern repeated immediately
    // Reduced min_notes from 6 to 4 to trigger earlier (after first phrase + 1 note of repeat)
    ("three_blind_mice", &[0, -2, -4, 0, -2, -4], &[1.0, 1.0, 2.0, 1.0, 1.0, 2.0], 4),

    // Frère Jacques - "Frère Jacques, Frère Jacques" (8 notes)
    // Pattern: C D E C, C D E C - distinctive stepwise motion with returns
    // Key distinction: Stepwise ascending then return to tonic, repeated
    ("frere_jacques", &[0, 2, 4, 0, 0, 2, 4, 0], &[1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], 8),

    // Mary Had a Little Lamb - "Mary had a little lamb" (7 notes)
    // Pattern: E D C D, E E E - distinctive descending then repeated notes
    // Key distinction: Descending minor third, return, then triple repetition
    // Made more specific to avoid false positives
    ("mary_little_lamb", &[0, -2, -4, -2, 0, 0, 0], &[1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0], 7),

    // Happy Birthday - "Happy birthday to you" (6 notes)
    // Pattern: C C D C F E - distinctive leap to fourth with resolution
    // Key distinction: Repeated tonic, step up, leap to fourth, resolve down
    ("happy_birthday", &[0, 0, 2, 0, 5, 4], &[1.5, 0.5, 1.0, 1.0, 1.0, 0.5], 6),
];

// Tune completions - what to play after detecting the pattern
// Format: (pattern_name, completion_notes, completion_timing)
const TUNE_COMPLETIONS: &[(&str, &[i32], &[f64])] = &[
    ("twinkle_twinkle", &[5, 5, 4, 4, 2, 2, 0], &[1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0]),
    ("three_blind_mice", &[3, 1, 1, 0, 3, 1, 1, 0], &[1.5, 1.0, 0.5, 2.0, 1.5, 1.0, 0.5, 2.0]), // "see how they run, see how they run"
    ("frere_jacques", &[4, 5, 7, 4, 5, 7], &[1.0, 1.0, 2.0, 1.0, 1.0, 2.0]),
    ("mary_little_lamb", &[-2, -2, -2, 0, 3, 3], &[1.0, 1.0, 2.0, 1.0, 1.0, 2.0]),
    ("happy_birthday", &[0, 0, 2, 0, 7, 5], &[1.5, 0.5, 2.0, 1.0, 1.0, 1.0]),
];
`})})]}),e.jsx("h2",{children:"Detected Patterns"}),e.jsxs("p",{children:["The Triggaz example can currently detect the following note patterns in any key:",e.jsxs("ul",{children:[e.jsx("li",{children:"Twinkle Twinkle Little Star"}),e.jsx("li",{children:"Three Blind Mice"}),e.jsx("li",{children:"Frère Jacques"}),e.jsx("li",{children:"Mary Had a Little Lamb"}),e.jsx("li",{children:"Happy Birthday"})]})]})]}),$=()=>{const t=c.useRef(null);return c.useEffect(()=>{const n=s=>{t.current&&t.current.contentWindow&&t.current.contentWindow.postMessage({type:"KASM_KEY",key:s.key,code:s.code,altKey:s.altKey,ctrlKey:s.ctrlKey,shiftKey:s.shiftKey,metaKey:s.metaKey},"*")};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),e.jsxs("div",{style:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"},onClick:()=>{t.current&&t.current.focus()},children:[e.jsx("iframe",{ref:t,src:"/latest/lfo.html",title:"Kasm Demo",style:{width:"90vw",height:"100vh",minHeight:"850px",display:"block",border:"2px solid #ccc",borderRadius:"12px",boxShadow:"0 2px 16px rgba(0,0,0,0.12)"},allowFullScreen:!0,tabIndex:-1,onLoad:()=>{t.current&&t.current.focus()}}),e.jsx(I,{})]})},ue=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"LFO"}),e.jsx("p",{children:"The LFO (Low-Frequency Oscillator) engine in the Kasm SDK generates continuous MIDI CC messages for real-time modulation in Ableton Live or any MIDI-compatible software. LFOs are tempo-synced and can be controlled live via the Max for Live UI."}),e.jsx("h2",{children:"How to generate your own LFOs"}),e.jsxs("p",{children:["LFO are executed using the ",e.jsx("code",{children:"execute_emanator"})," function in your Rust code. You provide the index of the LFO emanator you want to use, along with various MIDI and control parameters.",e.jsx("br",{}),e.jsx("br",{}),"src/emanators/lfo.rs",e.jsx("pre",{children:e.jsx("code",{children:`
pub fn kasm_lfo_triangle_wave(
    _note: i32,
    cc_number: i32,
    _velocity: i32,
    enc1: i32,
    enc2: i32,
    _step: i32,
    _bar: i32,
) -> i32 {
    let now = crate::get_current_time_ms();
    let mut last_time = LAST_LFO_TIME.write().unwrap();
    let mut phase = LFO_PHASE.write().unwrap();

    // Calculate time delta in milliseconds
    let delta_ms = if *last_time == 0 {
        // First call, initialize time
        *last_time = now;
        0.0
    } else {
        // Calculate delta and update last time
        let delta = now.saturating_sub(*last_time) as f32;
        *last_time = now;
        delta
    };

    // Calculate phase increment based on speed and tempo/bar length
    let phase_increment = lfo_phase_increment(delta_ms, enc1);

    // Accumulate phase (0..1 range)
    *phase = (*phase + phase_increment).fract();

    // enc2 controls symmetry (0-127, 64 = perfect triangle)
    let symmetry = (enc2 as f32) / 127.0;
    let lfo_value = if *phase < symmetry {
        (*phase / symmetry * 127.0) as i32
    } else {
        ((1.0 - *phase) / (1.0 - symmetry) * 127.0) as i32
    };

    send_cc(cc_number, lfo_value.max(0).min(127), 0);
    cc_number
}
`})})]}),e.jsx("p",{children:e.jsx("pre",{children:e.jsx("code",{children:`
pub fn kasm_lfo_golden_ratio(
    _note: i32,
    cc_number: i32,
    _velocity: i32,
    enc1: i32,
    enc2: i32,
    _step: i32,
    _bar: i32,
) -> i32 {
    let now = crate::get_current_time_ms();
    let mut last_time = LAST_LFO_TIME.write().unwrap();
    let mut phase = LFO_PHASE.write().unwrap();

    // Calculate time delta in milliseconds
    let delta_ms = if *last_time == 0 {
        *last_time = now;
        0.0
    } else {
        let delta = now.saturating_sub(*last_time) as f32;
        *last_time = now;
        delta
    };

    // Make the LFO smoother by reducing the speed multiplier and increasing phase resolution
    // Original: let speed_multiplier = 0.25 + (enc1 as f32 / 100.0) * 0.75;
    // Smoother: scale enc1 down and add a minimum
    let speed_multiplier = 0.05 + (enc1 as f32 / 300.0) * 0.5; // much slower, more resolution
    let beats_per_minute = (*crate::BEATS_PER_MINUTE.lock().unwrap() as f32).max(20.0).min(999.0);
    let beats_per_bar = (*crate::BEATS_PER_BAR.lock().unwrap() as f32).max(1.0).min(16.0);
    let bar_duration_ms = (60_000.0 * beats_per_bar) / beats_per_minute;
    let phase_increment = (delta_ms / bar_duration_ms) * speed_multiplier;

    *phase = (*phase + phase_increment).fract();

    use std::f32::consts::PI;
    let phi = (1.0 + 5.0_f32.sqrt()) / 2.0; // Golden ratio
    let spiral_factor = 1.0 + (enc2 as f32 / 127.0) * 5.0;
    let spiral_phase = *phase * 2.0 * PI;
    let radius = (spiral_phase / spiral_factor).exp();
    let spiral_value = (radius * (spiral_phase * phi).sin()).abs();
    let normalized = spiral_value % 1.0;
    let lfo_value = (normalized * 127.0) as i32;

    send_cc(cc_number, lfo_value.max(0).min(127), 0);
    cc_number
}
`})})}),e.jsxs("p",{children:["Then add your new LFO emanators to the emanators registry with short description and you added functions, e.g.",e.jsx("pre",{children:e.jsx("code",{children:`
  pub fn get_emanator_infos() -> Vec<EmanatorInfo> {
      vec![
            EmanatorInfo {
                emanator_idx: MAX4LIVE_UI_LFO_OFFSET + 3,
                name: "LFO Triangle",
                description: "Triangle wave LFO with speed and symmetry controls",
                category: EmanatorCategory::LFO,
                complexity: 1,
                function: kasm_lfo_triangle_wave,
            },
          ...
            EmanatorInfo {
                emanator_idx: MAX4LIVE_UI_LFO_OFFSET + 9,
                name: "LFO Golden Ratio",
                description: "Golden ratio spiral LFO with spiral tightness control",
                category: EmanatorCategory::LFO,
                complexity: 5,
                function: kasm_lfo_golden_ratio,
            },
          ...
`})})]}),e.jsx("h2",{children:"Supported Waveforms"}),e.jsx("p",{children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("b",{children:"Sine Wave"}),": Classic smooth modulation.",e.jsx("br",{}),e.jsx("b",{children:"Controls:"})," Speed (enc1), Phase Offset (enc2)"]}),e.jsxs("li",{children:[e.jsx("b",{children:"Sawtooth Wave"}),": Linear ramp up or down.",e.jsx("br",{}),e.jsx("b",{children:"Controls:"})," Speed (enc1), Direction (enc2: 0–63 up, 64–127 down)"]}),e.jsxs("li",{children:[e.jsx("b",{children:"Square Wave"}),": On/off modulation with pulse width.",e.jsx("br",{}),e.jsx("b",{children:"Controls:"})," Speed (enc1), Pulse Width (enc2: 1–99%)"]}),e.jsxs("li",{children:[e.jsx("b",{children:"Triangle Wave"}),": Symmetrical or asymmetrical triangle shape.",e.jsx("br",{}),e.jsx("b",{children:"Controls:"})," Speed (enc1), Symmetry (enc2: 0–127, 64 = perfect triangle)"]}),e.jsxs("li",{children:[e.jsx("b",{children:"Motown Fadeout"}),": Gradually fades out modulation for smooth transitions.",e.jsx("br",{}),e.jsx("b",{children:"Controls:"})," Fadeout length in bars (enc2), Fadeout steps (enc1)"]})]})}),e.jsx("h2",{children:"General Features"}),e.jsx("p",{children:e.jsxs("ul",{children:[e.jsx("li",{children:"All LFOs are synchronized to Ableton Live's transport and tempo for rhythmic effects."}),e.jsx("li",{children:"Parameters are mapped to encoder controls for live tweaking."}),e.jsx("li",{children:"Each LFO sends MIDI CC messages to modulate parameters in Ableton or other MIDI-compatible software."})]})}),e.jsx("h2",{children:"Usage"}),e.jsx("p",{children:"Select the desired LFO waveform and assign a MIDI CC number to modulate. Adjust the encoders in the Max for Live UI to control speed, shape, and other parameters in real time. The LFO engine will continuously send MIDI CC messages based on your settings, synchronized to the current tempo and transport."}),e.jsx($,{})]}),J=()=>{const t=c.useRef(null);return c.useEffect(()=>{const n=s=>{t.current&&t.current.contentWindow&&t.current.contentWindow.postMessage({type:"KASM_KEY",key:s.key,code:s.code,altKey:s.altKey,ctrlKey:s.ctrlKey,shiftKey:s.shiftKey,metaKey:s.metaKey},"*")};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),e.jsxs("div",{style:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"},onClick:()=>{t.current&&t.current.focus()},children:[e.jsx("iframe",{ref:t,src:"/latest/emanator.html",title:"Kasm Demo",style:{width:"90vw",height:"90vh",display:"block",border:"2px solid #ccc",borderRadius:"12px",boxShadow:"0 2px 16px rgba(0,0,0,0.12)"},allowFullScreen:!0,tabIndex:-1,onLoad:()=>{t.current&&t.current.focus()}}),e.jsx(I,{})]})},pe=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Looper"}),e.jsx("p",{children:"The Looper engine in the Kasm SDK records and processes MIDI note events in real time, simulating the physical and timing constraints of real instruments. It uses a tape buffer to store note events with timestamps, supports pattern detection, tape delay, feedback loops, and automatic pruning of old events."}),e.jsx("h2",{children:"Core Features"}),e.jsx("p",{children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("b",{children:"Tape Recording:"})," Captures MIDI notes with timing for playback and analysis."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Pattern Detection:"})," Identifies and records repeating note patterns with time offsets."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Tape Delay & Feedback:"})," Adjustable delay and feedback loops for creative looping effects."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Pruning:"})," Automatically removes old note events to prevent overflow and maintain performance."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Instrument Realism:"})," Applies rules to enforce physical constraints of real instruments."]}),e.jsx("li",{children:"Adjust tape delay and feedback loops for creative looping."}),e.jsx("li",{children:"Wipe tape and prune events to reset or optimize performance."}),e.jsx("li",{children:"Customize rule parameters (e.g., capo offset, hand span) for each instrument."})]})}),e.jsx(J,{})]}),fe=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Canvas"}),e.jsx("p",{children:"The Canvas mechanism in the Kasm SDK is used to create visualizers for MIDI data. It provides a way to draw and animate graphics in response to MIDI events."}),e.jsx("h2",{children:"How the Canvas Works"}),e.jsxs("p",{children:[`The Kasm Canvas is a 2D drawing surface that you can use to create real-time visualizations of MIDI data. It's built on the HTML5 Canvas API and is controlled from your Rust code. When you send MIDI data to the canvas, it creates animated "glows" that represent the notes and CC messages.`,e.jsx("br",{}),e.jsx("br",{}),"The canvas displays MIDI notes as squares and CC messages as circles. The color of the glow is determined by the note's pitch, and the size is determined by its velocity. The position of the glow is determined by the note's pan position (for CCs) or spread across the canvas by pitch (for notes)."]}),e.jsx("h2",{children:"How to Use the Canvas"}),e.jsxs("p",{children:["To use the canvas, you first need to initialize it with a specific width and height. Then, you can send MIDI data to it using the"," ",e.jsx("code",{children:"update_canvas_data"})," function.",e.jsx("pre",{children:e.jsx("code",{children:`
fn render_frame() {
    let window = match web_sys::window() {
        Some(w) => w,
        None => return,
    };

    let document = match window.document() {
        Some(d) => d,
        None => return,
    };

    let canvas = match document.get_element_by_id("kasmHTMLCanvas") {
        Some(c) => match c.dyn_into::<HtmlCanvasElement>() {
            Ok(canvas) => canvas,
            Err(_) => return,
        },
        None => return,
    };

    let context = match canvas.get_context("2d") {
        Ok(Some(ctx)) => match ctx.dyn_into::<CanvasRenderingContext2d>() {
            Ok(context) => context,
            Err(_) => return,
        },
        _ => return,
    };

    let width = *CANVAS_WIDTH.lock().unwrap() as f64;
    let height = *CANVAS_HEIGHT.lock().unwrap() as f64;
    let min_dim = width.min(height);

    // Clear canvas
    context.clear_rect(0.0, 0.0, width, height);

    let centre_x = width / 2.0;
    let centre_y = height / 2.0;

    // Draw circle
    context.set_fill_style_str("#444");
    context.begin_path();
    let _ = context.arc(centre_x, centre_y, min_dim * 0.20, 0.0, 2.0 * std::f64::consts::PI);
    context.fill();

    // Draw text
    context.set_fill_style_str("#aaa");
    context.set_font("10px Arial");
    context.set_text_align("center");
    let _ = context.fill_text("Kasm", centre_x, centre_y + 3.0);
    context.set_text_align("start"); // Reset
}
`})})]}),e.jsx("h2",{children:"Example Canvas Visualizers"}),e.jsx("p",{children:e.jsxs("ul",{children:[e.jsx("li",{children:"Emanator - shows notes and CC data as squares and circles in an live animation."}),e.jsx("li",{children:"Arpy - show held notes and how they are being played out in the sequence."}),e.jsx("li",{children:"Jog - shows motion video behind the apreggiator visualizer"})]})})]}),xe=()=>{const t=c.useRef(null);return c.useEffect(()=>{const n=s=>{t.current&&t.current.contentWindow&&t.current.contentWindow.postMessage({type:"KASM_KEY",key:s.key,code:s.code,altKey:s.altKey,ctrlKey:s.ctrlKey,shiftKey:s.shiftKey,metaKey:s.metaKey},"*")};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),e.jsxs("div",{style:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"},onClick:()=>{t.current&&t.current.focus()},children:[e.jsx("iframe",{ref:t,src:"/latest/rulez.html",title:"Kasm Rulez Demo",style:{width:"90vw",height:"90vh",minHeight:"850px",display:"block",border:"2px solid #ccc",borderRadius:"12px",boxShadow:"0 2px 16px rgba(0,0,0,0.12)"},allowFullScreen:!0,tabIndex:-1,onLoad:()=>{t.current&&t.current.focus()}}),e.jsx(I,{})]})},ge=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Rulez"}),e.jsx("p",{children:"The Rulez engine in the Kasm SDK is used to detect unrealistic MIDI patterns that a human could not play on certain instruments."}),e.jsx("h2",{children:"How the Rulez Engine Works"}),e.jsx("p",{children:"The Rulez engine allows you to define a set of rules that are applied to incoming MIDI data. Each rule can inspect the MIDI data and decide to either allow it, block it, or modify it. This is useful for enforcing constraints that mimic the physical limitations of real instruments."}),e.jsx("p",{children:'For example, a "Hand Drums" rule might limit the number of simultaneous notes to two, since a percussionist only has two hands. A "Keyboard" rule might prevent notes from being played that are impossibly far apart.'}),e.jsx("h2",{children:"How to Use the Rulez Engine"}),e.jsxs("p",{children:["You can add and remove rules from a global registry. When MIDI data is sent, the ",e.jsx("code",{children:"apply_rules_chain"})," function is called to process the data through all active rules.",e.jsx("pre",{children:e.jsx("code",{children:`
pub struct HandDrumsRule;

pub const MAX_NOTES_TWO_HANDS_CAN_PLAY: usize = 2; // Two hands can realistically play two notes at once
const MIN_VELOCITY_TO_PRODUCE_SOUND: i32 = 5; // Very light touch
const MINIMUM_TIMING_BETWEEN_ONE_NOTE_HUMANLY_POSSIBLE_TO_REPEAT_PLAY: u32 = 100; // Minimum time in ms between one note and the next on the same drum

impl InstrumentRule for HandDrumsRule {
    fn apply_rule(&self, notes: Vec<NoteData>) -> Vec<RulezResult> {
        use std::collections::HashMap;
        let mut results = Vec::new();
        let mut notes_by_time: HashMap<i32, Vec<&NoteData>> = HashMap::new();
        // Group notes by timestamp
        for note in &notes {
            notes_by_time.entry(note.start_time).or_default().push(note);
        }
        let mut notes_at_time = NOTES_AT_TIMESTAMP.lock().unwrap();
        for (timestamp, notes_group) in notes_by_time {
            let mut remove_timestamp = false;
            let mut batch_allowed_pitches = std::collections::HashSet::new();
            let mut batch_results = Vec::new();
            for note in notes_group {
                if note.velocity == 0 {
                    batch_results.push((note, RuleOutcome::DoNothing));
                    continue;
                }
                if note.velocity < MIN_VELOCITY_TO_PRODUCE_SOUND {
                    batch_results.push((note, RuleOutcome::Ignore));
                    continue;
                }
                if batch_allowed_pitches.len() < MAX_NOTES_TWO_HANDS_CAN_PLAY && !batch_allowed_pitches.contains(&note.note) {
                    batch_allowed_pitches.insert(note.note);
                    batch_results.push((note, RuleOutcome::DoNothing));
                } else {
                    batch_results.push((note, RuleOutcome::Ignore));
                }
            }
            let entry = notes_at_time.entry(timestamp).or_insert_with(std::collections::HashSet::new);
            for (note, outcome) in batch_results {
                if note.velocity == 0 {
                    if entry.is_empty() {
                        remove_timestamp = true;
                    }
                } else if outcome == RuleOutcome::DoNothing {
                    entry.insert(note.note);
                }
                results.push(RulezResult { note: note.clone(), outcome });
            }
            if remove_timestamp {
                notes_at_time.remove(&timestamp);
            }
        }
        results
    }
}

pub fn can_add_hand_drums_note(note_data: &NoteData) -> bool {
    let mut notes_at_time = NOTES_AT_TIMESTAMP.lock().unwrap();
    let entry = notes_at_time.entry(note_data.start_time).or_insert_with(std::collections::HashSet::new);
    if note_data.velocity == 0 {
        if entry.remove(&note_data.note) {
            post!("HandDrums: Note off at {} pitch {} removed, pitches now {:?}", note_data.start_time, note_data.note, entry);
        }
        if entry.is_empty() {
            notes_at_time.remove(&note_data.start_time);
        }
        return true;
    }
    if note_data.velocity < MIN_VELOCITY_TO_PRODUCE_SOUND {
        post!("HandDrums: Note at {} pitch {} blocked due to low velocity {}", note_data.start_time, note_data.note, note_data.velocity);
        return false;
    }
    if entry.len() < MAX_NOTES_TWO_HANDS_CAN_PLAY {
        entry.insert(note_data.note);
        true
    } else {
        post!("HandDrums: Note at {} pitch {} blocked, pitches are {:?} (max {})", note_data.start_time, note_data.note, entry, MAX_NOTES_TWO_HANDS_CAN_PLAY);
        false
    }
}
`})})]}),e.jsx("h2",{children:"Some Rulez Examples what you might do with it"}),e.jsx("p",{children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"EncoderDialsAndFaders:"})," Limits the rate of change for CC messages to simulate physical knobs and faders."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Guitar6String:"})," Enforces the physical limitations of a 6-string guitar."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"HandDrums:"})," Simulates the limitations of a two-handed percussionist."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Keyboard:"})," Enforces realistic hand spans for keyboard playing."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Bowed:"})," Simulates the characteristics of bowed string instruments like violins."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Stringed:"})," General rules for stringed instruments."]})]})}),e.jsx(xe,{})]}),_e=()=>e.jsxs("div",{children:[e.jsx("h2",{children:"Scale Key and Chored Detection"}),e.jsx("p",{children:"The Krumhansel mechanism in the Kasm SDK is used to detect the scale, key, and chords being played in real-time."}),e.jsx("h2",{children:"How the Krumhansel Algorithm Works"}),e.jsx("p",{children:'The Krumhansel algorithm is a method for determining the musical key of a passage of music. It works by comparing the distribution of notes played over a short period of time to a set of predefined "key profiles" for major and minor keys. The key whose profile most closely matches the recent note distribution is selected as the current key.'}),e.jsx("p",{children:"In the Kasm SDK, this algorithm is also used to detect the current chord being played. It analyzes the most recent notes and matches them against a library of known chord types."}),e.jsx("h2",{children:"How to Use the Krumhansel Engine"}),e.jsxs("p",{children:["You can feed MIDI notes to the Krumhansel engine using the"," ",e.jsx("code",{children:"kasm_krumhansl_detect_key"})," function. You can then retrieve the detected key and chord using their respective getter functions.",e.jsx("pre",{children:e.jsx("code",{children:`
// Rust example of using the Krumhansel engine
use kasm_sdk::krumhansl::{kasm_krumhansl_detect_key, kasm_krumhansl_get_current_key, kasm_krumhansl_get_current_chord};

fn process_midi_note(note: i32, velocity: i32) {
    // Feed the note to the key detection engine
    kasm_krumhansl_detect_key(note, 0, velocity, 0, 0, 0);

    // Get the detected key and chord
    let current_key = kasm_krumhansl_get_current_key();
    let current_chord = kasm_krumhansl_get_current_chord();

    println!("Current Key: {}", current_key);
    println!("Current Chord: {}", current_chord);
}
`})})]})]});function ye({onNavigate:t}){function n(){const a=Math.floor(Math.random()*200),o=Math.floor(Math.random()*200);return`${a}px ${o}px`}const[s,i]=c.useState("whatsnew");function r(a){switch(a){case"emanator":return e.jsx(B,{});case"arpy":return e.jsx(de,{});case"bangaz":return e.jsx(he,{});case"triggaz":return e.jsx(me,{});case"canvas":return e.jsx(fe,{});case"rulez":return e.jsx(ge,{});case"krumhansel":return e.jsx(_e,{});case"lfo":return e.jsx(ue,{});case"looper":return e.jsx(pe,{});default:return e.jsx(B,{})}}return e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Kasm SDK"}),e.jsx("p",{style:{backgroundPosition:n()},children:"The main intention is interoperability between Web Browsers and DAWs using open standards, in particular to make head way for Augmented Reality glasses and Virtual Reality headset based instruments. The aim is to achieve this by utilising cross platform technologies such as WebAssembly, WebXR, WebGL/WebGPU, WebMIDI and OSC (Open Sound Control)"}),e.jsx("p",{style:{backgroundPosition:n()},children:"The collection has zero formal roadmap, there is no rule book here as to what's right or wrong way, there will certainly be better ways of doing things, but it's a start. The common goal here is ease of open patching and sharing of editor tools to support the many different use cases and musical genres"}),e.jsx("div",{style:{backgroundPosition:n()},children:e.jsx("div",{className:"kasmnav",children:e.jsxs("div",{className:"kasm-demo-buttons",children:[e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:`kasm-demo-btn${s==="whatsnew"?" active":""}`,onClick:()=>i("whatsnew"),children:["📰 ",e.jsx("br",{}),"What's",e.jsx("br",{}),"New"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>window.open("/latest/kasm_ableton_rust/index.html","_blank"),children:["📖 ",e.jsx("br",{}),"Kasm Rust",e.jsx("br",{}),"Crate"]})]}),e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>t("emanator"),children:["🎹 ",e.jsx("br",{}),"Emanator"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("emanator"),children:["📖 ",e.jsx("br",{}),"Emanator",e.jsx("br",{}),"Docs"]})]}),e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>t("bangaz"),children:["🎹 ",e.jsx("br",{}),"Bangaz"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("bangaz"),children:["📖 ",e.jsx("br",{}),"Bangaz",e.jsx("br",{}),"Docs"]})]}),e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>t("arpy"),children:["🎹 ",e.jsx("br",{}),"Arpy"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("arpy"),children:["📖 ",e.jsx("br",{}),"Arpy",e.jsx("br",{}),"Docs"]})]}),e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>t("triggaz"),children:["🎹 ",e.jsx("br",{}),"Triggaz"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("triggaz"),children:["📖 ",e.jsx("br",{}),"Triggaz",e.jsx("br",{}),"Docs"]})]}),e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>t("lfo"),children:["🎹 ",e.jsx("br",{}),"MIDI LFO"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("lfo"),children:["📖 ",e.jsx("br",{}),"LFO",e.jsx("br",{}),"Docs"]})]}),e.jsxs("div",{className:"kasm-demo-buttons-group",children:[e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>t("looper"),children:["🎹 ",e.jsx("br",{}),"MIDI Looper"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("looper"),children:["📖 ",e.jsx("br",{}),"Looper",e.jsx("br",{}),"Docs"]})]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("canvas"),children:["📖 ",e.jsx("br",{}),"Canvas",e.jsx("br",{}),"Docs"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("rulez"),children:["📖 ",e.jsx("br",{}),"Rulez",e.jsx("br",{}),"Docs"]}),e.jsxs("button",{className:"kasm-demo-btn",onClick:()=>i("krumhansel"),children:["📖 ",e.jsx("br",{}),"Key/Chord",e.jsx("br",{}),"Docs"]})]})})}),s==="whatsnew"&&e.jsx(ce,{}),e.jsx("div",{className:"kasm-docs-section",children:s!=="whatsnew"&&r(s)})]})}function be(){const t=c.useRef(null),[n,s]=c.useState({protocol:"TechWebMIDI",latency:"45ms",throughput:"125 Mbps",objects:1247,subscribers:8,publishers:3,quality:"Ultra Low Latency"});return z(()=>{s(i=>({...i,latency:`${(40+Math.sin(Date.now()*.001)*10).toFixed(0)}ms`,throughput:`${(120+Math.sin(Date.now()*.0015)*20).toFixed(0)} Mbps`,objects:i.objects+Math.floor(Math.random()*3),subscribers:8+Math.floor(Math.sin(Date.now()*.002)*2),publishers:3+Math.floor(Math.cos(Date.now()*.0025)*1)}))}),e.jsxs("group",{position:[0,0,-2],children:[e.jsx(x,{ref:t,position:[0,.8,0],fontSize:.25,color:"#00ff00",anchorX:"center",anchorY:"middle",children:"WebMIDI"}),e.jsxs(x,{position:[0,.4,0],fontSize:.12,color:"#ffff00",anchorX:"center",anchorY:"middle",children:["Protocol: ",n.protocol," | Quality: ",n.quality]}),e.jsxs(x,{position:[0,.2,0],fontSize:.1,color:"#ff6600",anchorX:"center",anchorY:"middle",children:["Latency: ",n.latency," | Throughput: ",n.throughput]}),e.jsxs(x,{position:[0,0,0],fontSize:.1,color:"#00ffff",anchorX:"center",anchorY:"middle",children:["Objects: ",n.objects," | Subscribers: ",n.subscribers]}),e.jsxs(x,{position:[0,-.2,0],fontSize:.1,color:"#ff00ff",anchorX:"center",anchorY:"middle",children:["Publishers: ",n.publishers]}),e.jsx(x,{position:[0,-.5,0],fontSize:.08,color:"#888888",anchorX:"center",anchorY:"middle",children:"Ultra-low latency media streaming over QUIC"})]})}function je(){const t=c.useRef(null),n=c.useRef(null),s=c.useRef([]),i=c.useRef(null);return z(()=>{const r=Date.now()*.001;if(t.current&&(t.current.rotation.y=r*.4,t.current.scale.setScalar(1+Math.sin(r*2)*.1)),n.current&&(n.current.rotation.x=r*.3,n.current.rotation.z=r*.2),s.current.forEach((a,o)=>{a&&(a.rotation.y=r*(.5+o*.1),a.position.y=Math.sin(r*(1+o*.3))*.1)}),i.current){i.current.position.x=Math.sin(r*3)*.4;const a=i.current.material;a&&"opacity"in a&&(a.opacity=.7+Math.sin(r*5)*.2)}}),e.jsxs("group",{position:[2,0,-2],children:[e.jsx(R,{ref:t,args:[.3,.3,.3],position:[-.8,.4,0],children:e.jsx("meshBasicMaterial",{color:"#00ff00"})}),e.jsx(q,{ref:n,args:[.2,16,16],position:[0,.2,0],children:e.jsx("meshBasicMaterial",{color:"#ffff00"})}),e.jsx(ee,{ref:i,args:[.6,.03],position:[0,.4,0],children:e.jsx("meshBasicMaterial",{color:"#00ffff",transparent:!0})}),[0,1,2].map(r=>e.jsx(R,{ref:a=>{a&&(s.current[r]=a)},args:[.2,.2,.2],position:[.6+r*.3,-.2-r*.2,0],children:e.jsx("meshBasicMaterial",{color:"#ff6600"})},r)),e.jsx(x,{position:[-.8,.1,0],fontSize:.06,color:"#00ff00",anchorX:"center",anchorY:"middle",children:"Publisher"}),e.jsx(x,{position:[0,-.1,0],fontSize:.06,color:"#ffff00",anchorX:"center",anchorY:"middle",children:"WebMIDI Relay"}),e.jsx(x,{position:[.8,-.6,0],fontSize:.06,color:"#ff6600",anchorX:"center",anchorY:"middle",children:"Subscribers"}),e.jsx(x,{position:[0,-.9,0],fontSize:.08,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"WebMIDI Network"}),e.jsx(x,{position:[0,-1.1,0],fontSize:.06,color:"#888888",anchorX:"center",anchorY:"middle",children:"QUIC Transport"})]})}function we(){const[t]=c.useState(["🚀 Ultra Low Latency","📦 Object-based Delivery","🔄 Adaptive Bitrate","🌐 CDN Integration","📱 Multi-device Sync","🔒 Built-in Security"]),[n]=c.useState(["Live Streaming","Interactive Media","Gaming Applications","Real-time Collaboration","IoT Data Streams"]);return e.jsxs("group",{position:[-2,0,-2],children:[e.jsx(x,{position:[0,1,0],fontSize:.12,color:"#ffffff",anchorX:"center",anchorY:"middle",children:"WebMIDI Features"}),t.map((s,i)=>e.jsx(x,{position:[0,.6-i*.15,0],fontSize:.07,color:"#00ff88",anchorX:"center",anchorY:"middle",children:s},i)),e.jsx(x,{position:[0,-.5,0],fontSize:.1,color:"#ffff00",anchorX:"center",anchorY:"middle",children:"Use Cases"}),n.map((s,i)=>e.jsxs(x,{position:[0,-.7-i*.1,0],fontSize:.06,color:"#ff6600",anchorX:"center",anchorY:"middle",children:["• ",s]},i))]})}function ve(){return e.jsxs(e.Fragment,{children:[e.jsx("ambientLight",{intensity:.5}),e.jsx("pointLight",{position:[10,10,10]}),e.jsx(be,{}),e.jsx(je,{}),e.jsx(we,{})]})}function ke(){const[t,n]=c.useState({webmidi:!1});return c.useEffect(()=>{(()=>{n({webmidi:!1})})()},[]),e.jsxs("div",{className:"webmidi-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"webmidi-header",style:{position:"absolute",top:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white"},children:[e.jsx("h2",{children:"📡 WebMIDI"}),e.jsx("p",{children:"Ultra-low latency media streaming protocol"}),e.jsx("p",{style:{fontSize:"0.9em",marginTop:"10px",color:"#aaa"},children:"Object-based media delivery with Rust WebAssembly optimization"}),e.jsx("div",{style:{marginTop:"10px",fontSize:"0.8em"},children:e.jsxs("div",{style:{color:t.webmidi?"#00ff00":"#ffaa00"},children:[t.webmidi?"✅":"🚧"," WebMIDI (Experimental)"]})})]}),e.jsx(G,{camera:{position:[0,0,5],fov:75},style:{background:"linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)"},children:e.jsx(ve,{})})]})}function Te(){const[t,n]=c.useState("webmidi");c.useEffect(()=>{const r=new URLSearchParams(window.location.search).get("module");r&&["webmidi"].includes(r)&&n(r)},[]);const s=[{id:"webmidi",name:"WebMIDI",icon:"📡",description:"TechWebMIDI"},{id:"webgpu",name:"WebGPU",icon:"📡",description:"WebGPU"}];return e.jsxs("div",{className:"tech-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"tech-selector",style:{position:"absolute",top:"20px",right:"20px",zIndex:20,background:"rgba(0, 0, 0, 0.8)",borderRadius:"15px",padding:"1rem",backdropFilter:"blur(10px)",border:"1px solid rgba(255, 255, 255, 0.1)"},children:[e.jsx("h3",{style:{color:"white",marginBottom:"1rem",fontSize:"1.1rem",textAlign:"center"},children:"🔧 Tech Demos"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:s.map(i=>e.jsx("button",{onClick:()=>n(i.id),style:{background:t===i.id?"rgba(0, 255, 136, 0.2)":"rgba(255, 255, 255, 0.1)",border:t===i.id?"1px solid rgba(0, 255, 136, 0.5)":"1px solid rgba(255, 255, 255, 0.2)",borderRadius:"10px",padding:"0.75rem",color:"white",cursor:"pointer",transition:"all 0.3s ease",fontSize:"0.9rem",minWidth:"180px",textAlign:"left"},onMouseEnter:r=>{t!==i.id&&(r.currentTarget.style.background="rgba(255, 255, 255, 0.2)")},onMouseLeave:r=>{t!==i.id&&(r.currentTarget.style.background="rgba(255, 255, 255, 0.1)")},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{fontSize:"1.2rem",color:"var(--sandstone-base)"},children:i.icon}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:"bold"},children:i.name}),e.jsx("div",{style:{fontSize:"0.8rem",opacity:.8},children:i.description})]})]})},i.id))}),e.jsx("div",{style:{marginTop:"1rem",padding:"0.5rem",background:"rgba(255, 255, 255, 0.05)",borderRadius:"8px",fontSize:"0.8rem",color:"#aaa",textAlign:"center"},children:"Giving a home to various tech demos and experiments that might be useful to others."})]}),e.jsx("div",{className:"tech-module-display",style:{width:"100%",height:"100%"},children:t==="webmidi"&&e.jsx(ke,{})}),e.jsxs("div",{className:"tech-info",style:{position:"absolute",bottom:"20px",left:"20px",zIndex:10,background:"rgba(0, 0, 0, 0.7)",padding:"1rem",borderRadius:"10px",color:"white",maxWidth:"300px"},children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"var(--sandstone-base)"},children:[s.find(i=>i.id===t)?.icon," ",s.find(i=>i.id===t)?.name]}),e.jsxs("p",{style:{fontSize:"0.9rem",lineHeight:"1.4",margin:0},children:[t==="webmidi"&&"How TechWebMIDI works, or at least is supposed to.",t==="webgpu"&&"How WebGPU can be used to speed instrument rendering and visualizations up."]})]})]})}function De(){const t=c.useRef(null),[n,s]=c.useState(0),i=[{title:"Kasm XR Experience",subtitle:"Advanced WebXR Platform",description:"Control virtual musical instruments that aren't quite all there"},{title:"Rust WebAssembly Core",subtitle:"High-Performance Computing",description:"Shared WASM foundation across all modules"},{title:"WebXR Innovation",subtitle:"Immersive Experiences",description:"AR/VR capabilities for modern web browsers"}];z(()=>{const a=Date.now(),o=Math.floor(a/3e3%i.length);o!==n&&s(o)});const r=i[n];return e.jsxs("group",{position:[0,0,-2],children:[e.jsx(x,{ref:t,position:[0,.8,0],fontSize:.25,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:r.title}),e.jsx(x,{position:[0,.4,0],fontSize:.15,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:r.subtitle}),e.jsx(x,{position:[0,0,0],fontSize:.12,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:r.description}),e.jsxs(x,{position:[0,-.4,0],fontSize:.08,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:[n+1," / ",i.length]})]})}function Ce(){const t=c.useRef(null),n=c.useRef(null),s=c.useRef(null);return z(()=>{const i=Date.now()*.001;t.current&&(t.current.rotation.y=i*.5,t.current.position.y=Math.sin(i)*.2),n.current&&(n.current.rotation.x=i*.3,n.current.position.y=Math.cos(i*1.2)*.15),s.current&&(s.current.rotation.z=i*.7,s.current.position.y=Math.sin(i*.8)*.25)}),e.jsxs("group",{position:[2,0,-2],children:[e.jsx(R,{ref:t,args:[.3,.3,.3],position:[0,.5,0],children:e.jsx("meshBasicMaterial",{color:"#ce422b"})}),e.jsx(q,{ref:n,args:[.15,16,16],position:[0,0,0],children:e.jsx("meshBasicMaterial",{color:"#00d4ff"})}),e.jsx(R,{ref:s,args:[.2,.2,.2],position:[0,-.5,0],children:e.jsx("meshBasicMaterial",{color:"#ff6b35"})}),e.jsx(x,{position:[0,-1,0],fontSize:.08,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:"Core Technologies"}),e.jsx(x,{position:[0,-1.2,0],fontSize:.06,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:"🦀 Rust WebAssembly"}),e.jsx(x,{position:[0,-1.35,0],fontSize:.06,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:"🥽 WebXR"}),e.jsx(x,{position:[0,-1.5,0],fontSize:.06,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:"⚡ WebGPU"})]})}function Me(){const[t]=c.useState(["🎵 TechWebMIDI Audio Synthesis","🥽 AR/VR MIDI Controllers"]);return e.jsxs("group",{position:[-2,0,-2],children:[e.jsx(x,{position:[0,1,0],fontSize:.12,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:"Platform Features"}),t.map((n,s)=>e.jsx(x,{position:[0,.6-s*.2,0],fontSize:.08,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:n},s)),e.jsx(x,{position:[0,-.8,0],fontSize:.06,color:"#fff600",outlineColor:"#fff600",outlineWidth:.01,anchorX:"center",anchorY:"middle",children:"Powered by Rust + WebAssembly"})]})}function Ie(){return e.jsxs(e.Fragment,{children:[e.jsx("ambientLight",{intensity:.5}),e.jsx("pointLight",{position:[10,10,10]}),e.jsx(De,{}),e.jsx(Ce,{}),e.jsx(Me,{})]})}function Se(){return e.jsxs("div",{className:"about-container",style:{width:"100%",height:"100vh",position:"relative"},children:[e.jsxs("div",{className:"about-header",style:{position:"absolute",top:"20px",left:"50%",transform:"translateX(-50%)",zIndex:10,maxWidth:"800px",width:"90%",color:"white",textAlign:"center"},children:[e.jsx("h2",{children:"About"}),e.jsx("p",{children:"Kasm SDK Open Source Community"}),e.jsx("p",{style:{fontSize:"0.9em",marginTop:"10px",color:"#aaa"},children:"Kasm SDK is an open source community project focused on building advanced web based musical instruments including AR and VR instruments and MIDI controllers"})]}),e.jsx(G,{camera:{position:[0,0,5],fov:75},style:{},children:e.jsx(Ie,{})})]})}const Ee=({currentApp:t,onAppChange:n,appContext:s="main",onFilterChange:i})=>{const[r,a]=c.useState(!1),l=(()=>{switch(s){case"kasm":default:return[{id:"kasm",label:"Kasm SDK",icon:"🎹",description:"Documentatin for the Kasm SDK"},{id:"emanator",label:"Emanator",icon:"🎹",description:"Emanator editor tool"},{id:"bangaz",label:"Bangaz",icon:"🎹",description:"Drum Machine pattern editor tool"},{id:"arpy",label:"Arpy",icon:"🎹",description:"Arpeggiaor editor tool"},{id:"triggaz",label:"Triggaz",icon:"🎹",description:"MIDI note/cc pattern detection"},{id:"lfo",label:"LFO",icon:"🎹",description:"Low Frequecy Oscillators editor"},{id:"looper",label:"MIDI Looper",icon:"🎹",description:"Tape style looper with harmonizer"}]}})(),d=g=>{if(s!=="main"&&i)i(g);else{n(g);const m=g;let j;switch(m){case"kasm":j=[{id:"kasm_emanator"},{id:"oscillators"},{id:"kasm_lfo"},{id:"effects"},{id:"kasm_canvas"},{id:"kasm_jog"},{id:"kasm_emanator_trans"}];break;case"tech":j=[{id:"webmidi"},{id:"webgpu"}];break;default:j=[]}j.length===0&&a(!1)}},y=()=>{n&&n("bangaz")};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:`hamburger-menu${r?" open":""}`,onClick:()=>a(!r),"aria-label":"Toggle navigation menu","aria-expanded":r,children:[e.jsx("span",{className:"hamburger-line"}),e.jsx("span",{className:"hamburger-line"}),e.jsx("span",{className:"hamburger-line"})]}),r&&e.jsx("div",{className:"sidebar-overlay",onClick:()=>a(!1)}),e.jsx("nav",{className:`sidebar${r?" open":""}`,children:e.jsxs("div",{className:"sidebar-content",children:[e.jsx("div",{className:"sidebar-header"}),s!=="main"&&e.jsx("div",{className:"sidebar-back-main",children:e.jsx("button",{className:"nav-link-back",style:{width:"100%",marginBottom:"1em",color:"#ffffff",fontWeight:"bold",borderRadius:0},onClick:y,children:"← Back to Main"})}),e.jsx("div",{className:"sidebar-nav",children:e.jsx("ul",{className:"nav-list",children:l.map(g=>e.jsx("li",{className:"nav-item",children:e.jsxs("button",{className:`nav-link ${t===g.id?"active":""}`,onClick:()=>d(g.id),"aria-current":t===g.id?"page":void 0,children:[e.jsx("span",{className:"nav-icon",children:g.icon}),e.jsxs("div",{className:"nav-content",children:[e.jsx("span",{className:"nav-label",children:g.label}),e.jsx("span",{className:"nav-description",children:g.description})]})]})},g.id))})})]})})]})},A=({onDeviceChange:t,onChannelChange:n,initialDeviceId:s="",initialChannel:i=0})=>{const[r,a]=c.useState([]),[o,l]=c.useState(s),[d,y]=c.useState(i),g=()=>{navigator.requestMIDIAccess&&navigator.requestMIDIAccess().then(b=>{const w=[];b.outputs.forEach(v=>{w.push({id:v.id,name:v.name??"Unknown Device"})}),a(w)}).catch(()=>a([]))};c.useEffect(()=>{g()},[]);const m=b=>{l(b.target.value);const w=window;w.kasmWebMIDI&&w.kasmWebMIDI.setCurrentMidiOutput(b.target.value),t&&t(b.target.value)},j=b=>{const w=Number(b.target.value);y(w),n&&n(w)};return e.jsxs("div",{style:{marginBottom:"10px"},children:[e.jsx("label",{children:e.jsxs("select",{style:{padding:"3px",marginLeft:"10px"},value:o,onChange:m,children:[e.jsx("option",{value:"",children:"Select MIDI Device..."}),r.map(b=>e.jsx("option",{value:b.id,children:b.name},b.id))]})}),e.jsx("button",{style:{marginLeft:"10px",padding:"3px 8px"},onClick:g,children:"<"}),e.jsxs("label",{style:{marginLeft:"20px"},children:["MIDI Channel:",e.jsx("select",{style:{padding:"3px",width:"40px",marginLeft:"10px"},value:d,onChange:j,children:[...Array(16)].map((b,w)=>e.jsx("option",{value:w,children:w+1},w))})]})]})},E=c.forwardRef(({src:t="/latest/kasm_canvas_obs.html",title:n="LFO Canvas",width:s=150,height:i=150,style:r={},midiData:a,inlet_5_emanator:o},l)=>{const d=c.useRef(null),y=c.useRef(!1),g=()=>{y.current=!0,typeof o=="number"&&d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"INLET_5_EMANATOR",value:o},"*")};return c.useEffect(()=>{a&&d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"MIDI_DATA",...a},"*")},[a]),c.useEffect(()=>{y.current&&typeof o=="number"&&d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"INLET_5_EMANATOR",value:o},"*")},[o]),c.useImperativeHandle(l,()=>({callKasmFunction:(m,j)=>{d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"KASM",func:m,args:j},"*")},postHello:()=>{const m=d.current?.contentWindow;m&&typeof m.post=="function"&&m.post("Hello, World!")},setInlets:m=>{d.current&&d.current.contentWindow&&m&&(d.current.contentWindow.postMessage({type:"INLET_0_NOTE",value:m.pitch},"*"),d.current.contentWindow.postMessage({type:"INLET_2_VELOCITY",value:m.velocity},"*"),d.current.contentWindow.postMessage({type:"BANG"},"*"))}})),e.jsx("iframe",{ref:d,src:t,title:n,width:s,height:i,style:{border:"1px solid #ccc",borderRadius:"8px",...r},onLoad:g})}),O=[0,2,4,5,7,9,11],U=60,L={a:0,w:1,s:2,e:3,d:4,f:5,t:6,g:7,y:8,h:9,u:10,j:11,k:12,o:13,l:14,p:15,";":16,"'":17,"]":18,"\\":20},K=({onNoteOn:t,onNoteOff:n,highlightedNotes:s=[],velocity:i=100})=>{const[r,a]=c.useState([]),[o,l]=c.useState(i),d=c.useRef(new Set),y=c.useRef(null);c.useEffect(()=>{l(i)},[i]),c.useEffect(()=>{const h=p=>{const u=p.key.toLowerCase();if(!p.repeat&&!d.current.has(u)){if(d.current.add(u),u==="z"){l(f=>Math.max(f-10,1));return}if(u==="x"){l(f=>Math.min(f+10,127));return}if(Object.prototype.hasOwnProperty.call(L,u)){const f=U+L[u];r.includes(f)||(a(k=>[...k,f]),t(f,o),window.kasm_rust&&typeof window.kasm_rust.update_canvas_data=="function"&&window.kasm_rust.update_canvas_data(f,o,!1))}}},_=p=>{const u=p.key.toLowerCase();if(d.current.delete(u),Object.prototype.hasOwnProperty.call(L,u)){const f=U+L[u];a(k=>k.filter(Z=>Z!==f)),n(f),window.kasm_rust&&typeof window.kasm_rust.update_canvas_data=="function"&&window.kasm_rust.update_canvas_data(f,0,!1)}};return window.addEventListener("keydown",h),window.addEventListener("keyup",_),()=>{window.removeEventListener("keydown",h),window.removeEventListener("keyup",_)}},[o,r,t,n]),c.useEffect(()=>{if(!y.current)return;let h=0,_=0;for(let k=0;k<=127;k++)if(O.includes(k%12)){if(k===60){h=_;break}_++}const p=h*v+v/2,u=y.current,f=u.clientWidth;u.scrollLeft=Math.max(0,p-f/2)},[]);const g=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],m=h=>{const _=g[h%12],p=Math.floor(h/12)-2;return`${_}${p}`},j=(h,_)=>{let p=o;if(_){const f=_.target.getBoundingClientRect();let k;"touches"in _&&_.touches.length>0?k=_.touches[0].clientY-f.top:"clientY"in _?k=_.clientY-f.top:k=f.height/2,p=Math.round(10+k/f.height*117),p=Math.max(10,Math.min(127,p))}r.includes(h)||(a(u=>[...u,h]),t(h,p),window.kasm_rust&&typeof window.kasm_rust.update_canvas_data=="function"&&window.kasm_rust.update_canvas_data(h,p,!1))},b=h=>{a(_=>_.filter(p=>p!==h)),n(h),window.kasm_rust&&typeof window.kasm_rust.update_canvas_data=="function"&&window.kasm_rust.update_canvas_data(h,0,!1)},w=[],v=40,T=28,N=100,F=160;let D=0;const C=[];for(let h=0;h<=127;h++){const _=h%12;if(O.includes(_)){const u=D*v;C.push(u),w.push(e.jsxs("g",{children:[e.jsx("rect",{x:u,y:0,width:v,height:F,fill:r.includes(h)||s.includes(h)?"lime":"white",stroke:"#333",strokeWidth:1,onMouseDown:f=>j(h,f),onMouseUp:()=>b(h),onMouseLeave:()=>b(h),onTouchStart:f=>j(h,f),onTouchEnd:()=>b(h),style:{cursor:"pointer"}}),e.jsx("text",{x:u+v/2,y:150,textAnchor:"middle",fontSize:10,fill:"#666",style:{userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",pointerEvents:"none"},children:m(h)})]},`w${h}`)),D++}}D=0;for(let h=0;h<=127;h++){const _=h%12;if(O.includes(_)){D++;continue}let p=0,u=0;switch(_){case 1:p=.9,u=C[D-1]+v*p-T/2;break;case 3:p=1.1,u=C[D-1]+v*p-T/2;break;case 6:p=.9,u=C[D-1]+v*p-T/2;break;case 8:p=1,u=C[D-1]+v*p-T/2;break;case 10:p=1.1,u=C[D-1]+v*p-T/2;break;default:u=C[D-1]+v-T/2}w.push(e.jsxs("g",{children:[e.jsx("rect",{x:u,y:0,width:T,height:N,fill:r.includes(h)||s.includes(h)?"#fbc02d":"#333",stroke:"#000",strokeWidth:1,onMouseDown:f=>j(h,f),onMouseUp:()=>b(h),onMouseLeave:()=>b(h),onTouchStart:f=>j(h,f),onTouchEnd:()=>b(h),style:{cursor:"pointer"}}),e.jsx("text",{x:u+T/2,y:90,textAnchor:"middle",fontSize:8,fill:"#fff",style:{userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",pointerEvents:"none"},children:m(h)})]},`b${h}`))}const Q=C.length;return e.jsx("div",{ref:y,style:{overflowX:"auto",width:"100%",borderRadius:8,border:"2px solid #333",background:"#f0f0f0"},children:e.jsx("svg",{width:Q*v,height:F,style:{userSelect:"none",display:"block"},children:w})})},Ae=10,Le=()=>{const[t,n]=c.useState(null),s=Array.from({length:Ae},()=>M.createRef()),i=c.useRef(s),r=(o,l)=>{window.inlet_5_emanator="1",n({note:o,velocity:l,isCC:!1}),i.current.forEach(d=>{d.current&&(d.current.callKasmFunction("update_canvas_data",{pitch:o,velocity:l,cc:!1}),d.current.postHello())})},a=o=>{n({note:o,velocity:0,isCC:!1}),i.current.forEach(l=>{l.current&&l.current.callKasmFunction("update_canvas_data",{pitch:o,velocity:0,cc:!1})})};return e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{className:"main-title",children:"Bangaz Drum Pattern Browser and Editor"}),e.jsx("p",{children:"Bangaz is a collection of step sequences for General MIDI Drums and Ableton Drum Racks Drum patterns, a form of emanator with step/beat"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download Bangaz as Ableton Live 12.2 M4L device",onClick:()=>{const o=document.createElement("a");o.href="/latest/Kasm%20Bangaz.amxd",o.download="Kasm%20Bangaz.amxd",document.body.appendChild(o),o.click(),document.body.removeChild(o)},children:["⬇️",e.jsx("br",{}),"Bangaz .amxd"]})}),e.jsx(X,{}),e.jsxs("p",{children:["Pattern gallery/browser",e.jsx("br",{}),i.current.map((o,l)=>e.jsx(E,{ref:o,title:`Bangaz Canvas ${l+1}`,midiData:t},l))]}),e.jsx(A,{}),e.jsx("div",{style:{display:"flex",justifyContent:"center",margin:"20px 0"},children:e.jsx(K,{onNoteOn:r,onNoteOff:a})})]})},Re=60,ze=()=>{const[t,n]=c.useState(null),s=Array.from({length:Re},()=>M.createRef()),i=c.useRef(s),r=(o,l)=>{n({note:o,velocity:l,isCC:!1}),i.current.forEach(d=>{d&&d.current&&d.current.setInlets({pitch:o,velocity:l,cc:!1})})},a=o=>{n({note:o,velocity:0,isCC:!1}),i.current.forEach(l=>{l.current&&l.current.setInlets({pitch:o,velocity:0,cc:!1})})};return M.useEffect(()=>{r(60,100);const o=setInterval(()=>{r(60,100)},5e3);return()=>clearInterval(o)},[]),e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Emanator MIDI Pattern Browser and Editor Tool"}),e.jsx("p",{children:"Emanator is a collection of MIDI note patterns with CC articulations that continue playing, the concept of emanators is used in other contexts such as arpeggiators, and loops as they are all have similar results"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download as Ableton Live 12.2 M4L device",onClick:()=>{const o=document.createElement("a");o.href="/latest/Kasm%20Emanator.amxd",o.download="Kasm Emanator.amxd",document.body.appendChild(o),o.click(),document.body.removeChild(o)},children:["⬇️",e.jsx("br",{}),"Emanator .amxd"]})}),e.jsx(S,{}),e.jsxs("p",{children:["Pattern gallery/browser",e.jsx("br",{}),i.current.map((o,l)=>e.jsx(E,{ref:o,title:`Emanator ${l+1}`,midiData:t,inlet_5_emanator:l},l))]}),e.jsx(A,{}),e.jsx("div",{style:{display:"flex",justifyContent:"center",margin:"20px 0"},children:e.jsx(K,{onNoteOn:r,onNoteOff:a})}),e.jsx("p",{children:"What is an emanator? Effectively it is a Rust function that is called upon to generate notes, each Emanator function has some common parameters like the root note and velocity to go on and a couple of generic encoders that change purpose depending on what the emanator is expected to do"}),e.jsxs("p",{children:["The file structure of Emanators is as follows, again there is no right or wrong way here...",e.jsxs("ul",{children:[e.jsx("li",{children:"arpeggiation.rs"}),e.jsx("li",{children:"experimental.rs"}),e.jsx("li",{children:"lfo.rs"}),e.jsx("li",{children:"mathematical.rs"}),e.jsx("li",{children:"mod.rs"}),e.jsx("li",{children:"responsorial.rs"}),e.jsx("li",{children:"spatial.rs"}),e.jsx("li",{children:"drumpattern.rs"}),e.jsx("li",{children:"harmonic.rs"}),e.jsx("li",{children:"loopcounterpoint.rs"}),e.jsx("li",{children:"melodic.rs"}),e.jsx("li",{children:"progressions.rs"}),e.jsx("li",{children:"rhythmic.rs"})]})]})]})},Ke=c.forwardRef(({src:t="/latest/kasm_canvas_arpy_obs.html",title:n="LFO Canvas",width:s=150,height:i=150,style:r={},midiData:a,inlet_5_emanator:o},l)=>{const d=c.useRef(null),y=c.useRef(!1),g=()=>{y.current=!0,typeof o=="number"&&d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"INLET_5_EMANATOR",value:o},"*")};return c.useEffect(()=>{a&&d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"MIDI_DATA",...a},"*")},[a]),c.useEffect(()=>{y.current&&typeof o=="number"&&d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"INLET_5_EMANATOR",value:o},"*")},[o]),c.useImperativeHandle(l,()=>({callKasmFunction:(m,j)=>{d.current&&d.current.contentWindow&&d.current.contentWindow.postMessage({type:"KASM",func:m,args:j},"*")},postHello:()=>{const m=d.current?.contentWindow;m&&typeof m.post=="function"&&m.post("Hello, World!")},setInlets:m=>{d.current&&d.current.contentWindow&&m&&(d.current.contentWindow.postMessage({type:"INLET_0_NOTE",value:m.pitch},"*"),d.current.contentWindow.postMessage({type:"INLET_2_VELOCITY",value:m.velocity},"*"),d.current.contentWindow.postMessage({type:"BANG"},"*"))}})),e.jsx("iframe",{ref:d,src:t,title:n,width:s,height:i,style:{border:"1px solid #ccc",borderRadius:"8px",...r},onLoad:g})}),Ne=16,We=()=>{const[t,n]=c.useState(null),s=Array.from({length:Ne},()=>M.createRef()),i=c.useRef(s),r=(o,l)=>{n({note:o,velocity:l,isCC:!1}),i.current.forEach(d=>{d.current&&d.current.setInlets({pitch:o,velocity:l,cc:!1})})};M.useEffect(()=>{setTimeout(()=>{r(48,100),r(52,100),r(55,100),r(60,100),r(64,100),r(67,100)},1e3)},[]);const a=o=>{n({note:o,velocity:0,isCC:!1}),i.current.forEach(l=>{l.current&&l.current.setInlets({pitch:o,velocity:0,cc:!1})})};return e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Arpy MIDI Pattern Browser and Editor Tool"}),e.jsx("p",{children:"Arpy is a collection of MIDI note patterns with CC articulations that continue playing, the concept of emanators is used in other contexts such as arpeggiators, and loops as they are all have similar results"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download this Arpeggiator as Ableton Live 12.2 M4L device",onClick:()=>{const o=document.createElement("a");o.href="/latest/Kasm%20Arpy.amxd",o.download="Kasm Arpy.amxd",document.body.appendChild(o),o.click(),document.body.removeChild(o)},children:["⬇️",e.jsx("br",{}),"Kasm Arpy.amxd"]})}),e.jsx(Y,{}),e.jsxs("p",{style:{maxHeight:"400px",overflowY:"auto",display:"block"},children:["Pattern gallery/browser",e.jsx("br",{}),i.current.map((o,l)=>e.jsx(Ke,{ref:o,title:`Arpy ${l+1}`,midiData:t,inlet_5_emanator:l},l))]}),e.jsx(A,{}),e.jsx("div",{style:{display:"flex",justifyContent:"center",margin:"20px 0"},children:e.jsx(K,{onNoteOn:r,onNoteOff:a})}),e.jsx("p",{children:"What is an emanator? Effectively it is a Rust function that is called upon to generate notes, each Arpy function has some common parameters like the root note and velocity to go on and a couple of generic encoders that change purpose depending on what the emanator is expected to do"}),e.jsxs("p",{children:["The file structure of Arpys is as follows, again there is no right or wrong way here...",e.jsxs("ul",{children:[e.jsx("li",{children:"arpeggiation.rs"}),e.jsx("li",{children:"experimental.rs"}),e.jsx("li",{children:"lfo.rs"}),e.jsx("li",{children:"mathematical.rs"}),e.jsx("li",{children:"mod.rs"}),e.jsx("li",{children:"responsorial.rs"}),e.jsx("li",{children:"spatial.rs"}),e.jsx("li",{children:"drumpattern.rs"}),e.jsx("li",{children:"harmonic.rs"}),e.jsx("li",{children:"loopcounterpoint.rs"}),e.jsx("li",{children:"melodic.rs"}),e.jsx("li",{children:"progressions.rs"}),e.jsx("li",{children:"rhythmic.rs"})]})]})]})},Oe=()=>e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Triggaz midi note/cc pattern detection tool"}),e.jsx("p",{children:"Triggaz are a bit like Emanators in reverse, they look for patterns in the live performance and when a close enough match has been made it triggers an emanator, or a MIDI CC event or Ableton Live mapped parameter and so on"}),e.jsx("p",{children:"Demo: Try playing Twinkle Twinkle little Star, Three blind Mice, Merrily we Roll Along..."}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download Triggaz as Ableton Live 12.2 M4L device",onClick:()=>{const t=document.createElement("a");t.href="/latest/Kasm%20Triggaz.amxd",t.download="Kasm Triggaz.amxd",document.body.appendChild(t),t.click(),document.body.removeChild(t)},children:["⬇️",e.jsx("br",{}),"Triggaz .amxd"]})}),e.jsx(S,{}),e.jsx("p",{children:"Triggaz detection pattern browser/gallery and web based pattern learning tools are coming here soon..."}),e.jsx(A,{}),e.jsxs("div",{style:{display:"flex",gap:"20px",justifyContent:"center",margin:"40px 0"},children:[e.jsx(E,{title:"Triggaz 1"}),e.jsx(E,{title:"Triggaz 2"}),e.jsx(E,{title:"Triggaz 3"})]})]}),Fe=c.forwardRef(({src:t="/latest/kasm_canvas_obs.html",title:n="LFO Canvas",width:s=150,height:i=150,style:r={},midiData:a},o)=>{const l=c.useRef(null);return c.useEffect(()=>{a&&l.current&&l.current.contentWindow&&l.current.contentWindow.postMessage({type:"MIDI_DATA",...a},"*")},[a]),c.useImperativeHandle(o,()=>({callKasmFunction:(d,y)=>{l.current&&l.current.contentWindow&&l.current.contentWindow.postMessage({type:"KASM",func:d,args:y},"*")},postHello:()=>{l.current&&l.current.contentWindow&&typeof l.current.contentWindow.post=="function"&&l.current.contentWindow.post("HELLO")}})),e.jsx("iframe",{ref:l,src:t,title:n,width:s,height:i,style:{border:"1px solid #ccc",borderRadius:"8px",...r}})}),Pe=10,He=()=>{const[t,n]=c.useState(null),s=Array.from({length:Pe},()=>M.createRef()),i=c.useRef(s),r=(o,l)=>{window.inlet_5_emanator="1",n({note:o,velocity:l,isCC:!1}),i.current.forEach(d=>{d.current&&(d.current.callKasmFunction("update_canvas_data",{pitch:o,velocity:l,cc:!1}),d.current.postHello())})},a=o=>{n({note:o,velocity:0,isCC:!1}),i.current.forEach(l=>{l.current&&l.current.callKasmFunction("update_canvas_data",{pitch:o,velocity:0,cc:!1})})};return e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"LFO Sequence Browser and Editor Tool"}),e.jsx("p",{children:"Low Frequency Oscillators, periodically update MIDI CCs and Ableton Live mapped parameters"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download this LFO as Ableton Live 12.2 M4L device",onClick:()=>{const o=document.createElement("a");o.href="/latest/Kasm%20LFO.amxd",o.download="Kasm LFO.amxd",document.body.appendChild(o),o.click(),document.body.removeChild(o)},children:["⬇️",e.jsx("br",{}),"Kasm LFO.amxd"]})}),e.jsx($,{}),e.jsxs("p",{children:["Pattern gallery/browser",e.jsx("br",{}),i.current.map((o,l)=>e.jsx(Fe,{ref:o,title:`LFO Canvas ${l+1}`,midiData:t},l))]}),e.jsx(A,{}),e.jsx("div",{style:{display:"flex",justifyContent:"center",margin:"20px 0"},children:e.jsx(K,{onNoteOn:r,onNoteOff:a})})]})},Be=()=>e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Kasm Looper"}),e.jsx("p",{children:"MIDI Tape looping with counterpoint harmonizer"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download Looper as Ableton Live 12.2 M4L device",onClick:()=>{const t=document.createElement("a");t.href="/latest/Kasm%20Looper.amxd",t.download="Kasm Looper.amxd",document.body.appendChild(t),t.click(),document.body.removeChild(t)},children:["⬇️",e.jsx("br",{}),"Looper .amxd"]})}),e.jsx(J,{})]}),Ue=()=>e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Kasm Canvas"}),e.jsx("p",{children:"2D/WebGL HTML5 canvas from Rust/WebAssembly (WebGPU coming)"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download Kasm Canvas as Ableton Live 12.2 M4L device",onClick:()=>{const t=document.createElement("a");t.href="/latest/Kasm%20Canvas.amxd",t.download="Kasm Canvas.amxd",document.body.appendChild(t),t.click(),document.body.removeChild(t)},children:["⬇️",e.jsx("br",{}),"Canvas .amxd"]})}),e.jsx(S,{})]}),Ge=()=>e.jsxs("div",{className:"kasm-landing-container",children:[e.jsx("h1",{children:"Kasm Krumhansel"}),e.jsx("p",{children:"Key/chord detection"}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"16px",margin:"16px 0"},children:e.jsxs("button",{className:"kasm-demo-btn-download",title:"Download as Ableton Live 12.2 M4L device",onClick:()=>{const t=document.createElement("a");t.href="/latest/Kasm%20Canvas.amxd",t.download="Kasm Canvas.amxd",document.body.appendChild(t),t.click(),document.body.removeChild(t)},children:["⬇️",e.jsx("br",{}),"Kasm Canvas.amxd"]})}),e.jsx(S,{})]});function qe(){const[t,n]=c.useState("kasm"),s=c.useRef(null);c.useEffect(()=>{const l=new URLSearchParams(window.location.search).get("app");l&&["kasm","tech","about","bangaz","arpy","emanator","lfo","looper","jog","canvas","krumhansel"].includes(l)?n(l):l&&["webmidi","webgpu"].includes(l)&&n("tech")},[]);const i=["kasm","emanator","bangaz","arpy","triggaz","lfo","looper","jog","canvas"].includes(t),r=()=>t==="kasm"?"kasm":t==="tech"?"tech":"main";c.useEffect(()=>{if(!s.current)return;const o=s.current,l=new re(o);let d;const y=async()=>{await l.initialize()&&(l.resize(window.innerWidth,window.innerHeight),g())},g=()=>{const v=ae([0,0,5],[0,0,0],[0,1,0]),T=window.innerWidth/window.innerHeight,N=oe(45*(Math.PI/180),T,.1,100);l.render([],v,N),d=requestAnimationFrame(g)};y();const m=()=>{l.resize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",m),()=>{window.removeEventListener("resize",m),cancelAnimationFrame(d),l.dispose()}},[]);const a=o=>{n(o)};return e.jsxs(e.Fragment,{children:[e.jsx("canvas",{ref:s,style:{position:"fixed",top:0,left:0,zIndex:-1,width:"100vw",height:"100vh"}}),e.jsxs("div",{className:"App",children:[e.jsx(Ee,{currentApp:t,onAppChange:a,appContext:r()}),e.jsxs("div",{className:`app-content ${i?"standalone-mode":""}`,children:[t==="bangaz"&&e.jsx(Le,{}),t==="arpy"&&e.jsx(We,{}),t==="triggaz"&&e.jsx(Oe,{}),t==="kasm"&&e.jsx(ye,{onNavigate:a}),t==="emanator"&&e.jsx(ze,{}),t==="tech"&&e.jsx(Te,{}),t==="about"&&e.jsx(Se,{}),t==="lfo"&&e.jsx(He,{}),t==="looper"&&e.jsx(Be,{}),t==="jog"&&e.jsx(V,{}),t==="canvas"&&e.jsx(Ue,{}),t==="krumhansel"&&e.jsx(Ge,{})]})]})]})}te.createRoot(document.getElementById("root")).render(e.jsx(c.StrictMode,{children:e.jsx(qe,{})}));
