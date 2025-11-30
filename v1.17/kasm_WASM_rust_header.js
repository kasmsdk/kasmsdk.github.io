// Rust code in Ableton Live!
// The complete source code and build/test tools for this Rust/WebAssembly Ableton device project can be downloaded from:

// Go build similar instruments like this using Kasm Rust WASM SDK here:
//     https://pyrmontbrewery.com/get_kasm

// Version: VERSION_ID

// Gist of what you'll find in the Rust code that is compiled as part of this JavaScript file

// use wasm_bindgen::prelude::*;
//
// // Import external functions from lib.rs
// use crate::{post, send_note};
//
// #[wasm_bindgen]
// pub fn kasm_midi_note_offset(inlet_0: i32, inlet_1: i32) -> i32 {
//     let result = inlet_0 + inlet_1;
//     // Clamp the result to valid MIDI note range (0-127)
//     let clamped_result = result.max(0).min(127);
//
//     // Use the helper function for cleaner code
//     send_note(clamped_result, 127, 0, 500, -1);
//     ...
//
// #[wasm_bindgen]
// pub fn kasm_midi_note_octave_hit(inlet_0: i32, inlet_1: i32) -> i32 {
//     let result = inlet_0 + inlet_1 + 12;
//     // Clamp the result to valid MIDI note range (0-127)
//     let clamped_result = result.max(0).min(127);
//
//     // Use helper function for cleaner code
//     send_note(clamped_result + 3, 127, 0, 400, -1);
//     send_note(clamped_result + 7, 127, 0, 400, -1);
//     send_note(clamped_result + 12, 127, 0, 400, -1);
//     ...
//
// #[wasm_bindgen]
// pub fn kasm_midi_note_octave_strummed(inlet_0: i32, inlet_1: i32) -> i32 {
//     let result = inlet_0 + inlet_1 + 12;
//     // Clamp the result to valid MIDI note range (0-127)
//     let clamped_result = result.max(0).min(127);
//
//     // Use helper function for cleaner strumming pattern
//     send_note(clamped_result + 3, 70, 0, 300, -1);      // First note immediately
//     send_note(clamped_result + 7, 100, 50, 300, -1);    // Second note after 50ms
//     send_note(clamped_result + 12, 90, 100, 300, -1);   // Third note after 100ms
// ...
//
// #[wasm_bindgen]
// pub fn kasm_midi_note_octave_arp(inlet_0: i32, inlet_1: i32) -> i32 {
//     let result = inlet_0 + inlet_1 + 12;
//     // Clamp the result to valid MIDI note range (0-127)
//     let clamped_result = result.max(0).min(127);
//
//     // Use helper function for cleaner arpeggio pattern
//     send_note(clamped_result - 12, 80, 0, 250, -1);     // First note immediately
//     send_note(clamped_result + 12, 110, 100, 250, -1);  // Second note after 100ms
//     send_note(clamped_result + 24, 100, 200, 250, -1);  // Third note after 200ms
//     send_note(clamped_result + 36, 90, 300, 250, -1);   // Fourth note after 300ms
//     ...
//
// /// Enhanced version with configurable delays for more complex strumming patterns
// #[wasm_bindgen]
// pub fn kasm_midi_note_weird_strum(inlet_0: i32, inlet_1: i32, strum_delay: i32) -> i32 {
//     let result = inlet_0 + inlet_1 + 12;
//     // Clamp the result to valid MIDI note range (0-127)
//     let clamped_result = result.max(0).min(127);
//
//     // Create a chord with configurable strumming delay using send_midi
//     let notes = [0, 3, 7, 12]; // Root, minor third, fifth, octave
//
//     for (i, &offset) in notes.iter().enumerate() {
//         let note = (clamped_result + offset).max(0).min(127);
//         let delay = i as i32 * strum_delay;
//         let velocity = 100 - (i as i32 * 10); // Decreasing velocity
//
//         send_note(note, velocity, delay, 300, -1);
//     }
// ...
//
// /// Ripple effect with exponential delay spacing
// #[wasm_bindgen]
// pub fn kasm_midi_note_ripple(inlet_0: i32, inlet_1: i32, base_delay: i32) -> i32 {
//     let result = inlet_0 + inlet_1 + 12;
//     // Clamp the result to valid MIDI note range (0-127)
//     let clamped_result = result.max(0).min(127);
//
//     // Create rippling notes with exponential delay spacing using send_midi
//     let notes = [0, 4, 7, 12, 16]; // Major chord with extensions
//
//     for (i, &offset) in notes.iter().enumerate() {
//         let note = (clamped_result + offset).max(0).min(127);
//         // Exponential delay: 0, base_delay, base_delay*2, base_delay*4, base_delay*8
//         let delay = if i == 0 { 0 } else { base_delay * (1 << (i - 1)) };
//         let velocity = 120 - (i as i32 * 15); // Decreasing velocity for ripple effect
//
//         send_note(note, velocity, delay, 400, -1);
//     }
//     ...
//
// /// Elaborate rendition of a familiar nursery rhyme with rich dynamics and harmonies
// #[wasm_bindgen]
// pub fn kasm_playout_nursery_rhyme_sequence(inlet_0: i32, inlet_1_semitone_offset: i32, inlet_2_velocity: i32, enc1_progression_speed: i32) -> i32 {
//     let root_note = (inlet_0 + inlet_1_semitone_offset).max(0).min(127);
//     let speed_factor = enc1_progression_speed.max(50).min(500) as f32 / 200.0;
//
//     // Melody: E D C D E E E D D D E G G
//     // Translated to intervals from root: 4 2 0 2 4 4 4 2 2 2 4 7 7
//     let melody_notes = [4, 2, 0, 2, 4, 4, 4, 2, 2, 2, 4, 7, 7];
//     let note_durations = [400, 400, 400, 400, 400, 400, 600, 400, 400, 600, 400, 400, 800]; // ms
//     let note_velocities = [5, -5, 0, 2, 10, 8, 15, -2, 0, 5, 8, 12, 20];
//     ...
//
/// Kasm emanator 1 - Morse Code repeater
// #[wasm_bindgen]
// pub fn kasm_emanator_1(note: i32, offset: i32, velocity: i32, enc1_velocity_offset: i32, enc2_intensity: i32) -> i32 {
//     post("kasm_emanator_1: Morse Code Spatial Emanator");
//
//     // validate/normalise/clamp inputs
//     let root_note = (note + offset).max(0).min(127);
//     let base_velocity = (velocity + enc1_velocity_offset).max(30).min(127);
//     let intensity_factor = enc2_intensity.max(1).min(127) as f32 / 32.0;
//
//     // Morse code patterns for different notes (dot = short, dash = long)
//     // Each note gets a different morse sequence based on note % 26 (alphabet)
//     let morse_alphabet = [
//         ".-",     // A
//         "-...",   // B
//         "-.-.",   // C
//         "-..",    // D
//         ".",      // E
//         "..-.",   // F
//     ...
//
/// Kasm Emanator 2 - strummed cascading glissando (enc_1 changes how fast we strum)
// #[wasm_bindgen]
// pub fn kasm_emanator_2(note: i32, offset: i32, inlet_2_velocity: i32, intensity: i32, stereo_spread: i32) -> i32 {
//     post("kasm_emanator_2: strummed cascading glissando (enc_1 changes how fast we strum)");
//
//     let root_note = (note + offset).max(0).min(127);
//     let intensity_factor = intensity.max(1).min(127) as f32 / 127.0;
//     let pan_factor = stereo_spread.max(0).min(127) as f32 / 127.0;
//
//     // Primary cascading arpeggio with spatial panning
//     let primary_notes = [0, 4, 7, 12, 16, 19, 24];
//     for (i, &offset) in primary_notes.iter().enumerate() {
//         let note = (root_note + offset).max(0).min(127);
//         let delay = (i as f32 * 120.0 * intensity_factor) as i32;
//         let velocity = (127.0 - (i as f32 * 8.0)) as i32;
//
//         // Calculate panning position (left to right sweep)
//     ...
//
/// Kasm Emanator 3 - chord progression cascade
// #[wasm_bindgen]
// pub fn kasm_emanator_3(note: i32, semitone_offset: i32, progression_speed: i32) -> i32 {
//     post("kasm_emanator_3");
//
//     send_cc(10, 20,0);
//
//     let root_note = (note + semitone_offset).max(0).min(127);
//     let speed_factor = progression_speed.max(50).min(500) as f32 / 200.0;
//
//     // Chord progression: I - vi - IV - V with extensions
//     let chord_progressions = [
//         // I chord (major 7th, add9)
//         [0, 4, 7, 11, 14],
//         // vi chord (minor 7th, add9)
//         [9, 12, 16, 19, 23],
//         // IV chord (major 7th, add9)
//         [5, 9, 12, 16, 19],
//         // V chord (dominant 7th, sus4)
//         [7, 11, 14, 17, 21],
//     ];
//
//     for (chord_idx, chord) in chord_progressions.iter().enumerate() {
//         let chord_start_time = (chord_idx as f32 * 1200.0 * speed_factor) as i32;
//
//         // Arpeggiate each chord
//        ...
//
/// Kasm Emanator 3 - classic chord progression cascade
// #[wasm_bindgen]
// pub fn kasm_emanator_3(note: i32, semitone_offset: i32, inlet_2_velocity: i32, progression_id: i32, progression_speed: i32) -> i32 {
//     post("kasm_emanator_3: Chord Progression Cascade with Well-Known Progressions");
//
//     let root_note = (note + semitone_offset).max(0).min(127);
//     let base_velocity = inlet_2_velocity.max(30).min(127);
//     let speed_factor = progression_speed.max(50).min(500) as f64 / 200.0;
//
//     let progression_name = match progression_id % 20 {
//         0 => "I-V-vi-IV (Pop)",
//             1 => "ii-V-I (Jazz)",
//             2 => "vi-IV-I-V (Ballad)",
//             3 => "I-vi-ii-V (Circle of Fifths)",
//             4 => "I-bVII-IV-I (Modal Rock)",
//             5 => "i-bVI-bVII-i (Natural Minor)",
//             6 => "I-iii-vi-IV (50s Doo-wop)",
//             7 => "Pachelbel's Canon",
//             8 => "Jazz Turnaround",
//             9 => "Blues I-IV-I-V",
//             10 => "Andalusian Cadence",
//             11 => "Plagal Cadence",
//             12 => "Dorian Modal",
//             13 => "Giant Steps Style",
//             14 => "Neo-Riemannian",
//             15 => "Chromatic Mediant",
//             16 => "Diminished Passing",
//             17 => "Quartal Harmony",
//             18 => "Modal Interchange",
//             19 => "Whole Tone",
//             _ => "Default Pop",
//     };
//     ...
//
/// Kasm emanator 4 - Swarming spirals with Fibonacci timing and golden ratio velocity modulation
// #[wasm_bindgen]
// pub fn kasm_emanator_4(note: i32, semitone_offset: i32, velocity: i32, enc1_intensity: i32, enc2_rate: i32) -> i32 {
//     post("kasm_emanator_4: Swarming spirals with Fibonacci timing and golden ratio velocity modulation");
//
//     let root_note = semitone_offset + note.max(24).min(96); // Keep in reasonable range for rapid runs
//     let base_velocity = (velocity / 2).max(10).min(127);
//     let intensity_factor = enc1_intensity.max(1).min(127) as f64 / 16.0;
//
//     // Rate control - higher values slow down the bees
//     let rate_factor = 1.0 + (enc2_rate.max(0).min(127) as f64 / 127.0) / 4.0; // 1.0 to 5.0 multiplier
//
//     // Bumblebee flight patterns - characteristic chromatic and scalar runs
//     let flight_patterns = [
//         // Rapid ascending chromatic buzz
//         vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//         // Descending chromatic with gaps (like erratic flight)
//         vec![12, 10, 8, 7, 5, 3, 2, 0, -1, -3, -5],
//         // Zigzag pattern (bumblebee changing direction)
//         vec![0, 3, 1, 4, 2, 5, 3, 6, 4, 7, 5, 8],
//         // Arpeggiated buzz (diminished chords for tension)
//         vec![0, 3, 6, 9, 12, 9, 6, 3, 0, -3, -6],
//         // Rapid scalar fragments
//         vec![0, 2, 4, 5, 7, 9, 11, 12, 14, 16],
//     ];
//
//     // Fibonacci-based timing for natural acceleration/deceleration
//     let base_delays = [13, 21, 34, 55, 89, 144, 233, 377];
//     let golden_ratio: f64 = 1.618034;
//     ...
//
/// Kasm Emanator 5 - Fractal mathematics, L-systems, strange attractors, and chaos theory
// #[wasm_bindgen]
// pub fn kasm_emanator_5(note: i32, _offset: i32, velocity: i32, intensity: i32, complexity: i32) -> i32 {
//     post("kasm_emanator_5: Fractal mathematics, L-systems, strange attractors, and chaos theory");
//
//     let root_note = note.max(12).min(115); // Keep room for high harmonics
//     let base_velocity = velocity.max(80).min(127); // Much higher minimum velocity
//     let intensity_factor = (intensity.max(50).min(127) as f64 + 50.0) / 127.0; // Boost intensity (default ~1.2)
//     let complexity_factor = (complexity.max(40).min(127) as f64 + 40.0) / 127.0; // Boost complexity (default ~0.94)
//
//     // Polyphony limit - maximum 12 simultaneous notes
//     let max_polyphony = 12;
//     let mut note_count = 0;
//
//     // Advanced fractal parameters
//     let max_fractal_levels = (complexity_factor * 8.0) as i32 + 3; // Up to 11 levels
//     let base_delay = (60.0 / complexity_factor) as i32; // Faster base timing
//
//     // Multiple fractal algorithms running simultaneously
//     let fractal_systems = [
//         "mandelbrot",
//         "julia",
//         "burning_ship",
//         "phoenix",
//         "newton",
//         "l_system"
//     ];
//
//     // Generate massive multi-layered fractal cascade
//     for (system_idx, &fractal_type) in fractal_systems.iter().enumerate() {
//         let system_offset = system_idx as f64 * 200.0 * intensity_factor;
//         let levels = (max_fractal_levels - system_idx as i32).max(3);
//
//         for level in 0..levels {
//             let level_scale = (1.5_f64).powi(level) * complexity_factor;
//             let echoes_per_level = match fractal_type {
//                 "mandelbrot" => (4_i32.pow(level as u32)).min(16),
//                     "julia" => (3_i32.pow(level as u32)).min(12),
//                     "burning_ship" => (5_i32.pow(level as u32)).min(20),
//                     "phoenix" => (2_i32.pow(level as u32 + 1)).min(8),
//                     "newton" => (6_i32.pow(level as u32)).min(24),
//                     "l_system" => (7_i32.pow(level as u32)).min(28),
//                     _ => 4,
//             };
//
//             for echo in 0..echoes_per_level {
//                 // Complex fractal mathematics for each system
//                 let (chaos_factor, velocity_boost, harmonic_series) = match fractal_type {
//                     "mandelbrot" => {
//                         // Mandelbrot set iteration
//                         ...
//
/// Kasm Emanator 6 - Harmonic Series Resonance (echoes based on harmonic series)
// #[wasm_bindgen]
// pub fn kasm_emanator_6(note: i32, offset: i32, velocity: i32, intensity: i32) -> i32 {
//     post("kasm_emanator_6: Harmonic Series Resonance (echoes based on harmonic series)");
//
//     // Harmonic series ratios (frequency multipliers)
//     let harmonics: [f64; 12] = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 11.0, 13.0, 15.0];
//     let base_delay = 200;
//
//     for (i, &harmonic) in harmonics.iter().enumerate() {
//         // Convert harmonic ratio to semitone offset (12-tone equal temperament)
//         let semitone_offset = (12.0_f64 * harmonic.log2()).round() as i32 + offset;
//         let harmonic_note = (note + semitone_offset).min(127);
//     ...
//
/// Kasm Emanator 7 - Phone Ringtone Tune with micro-timing and velocity humanization
// #[wasm_bindgen]
// pub fn kasm_emanator_7(note: i32, semitone_offset: i32, velocity: i32, complexity: i32, humanize: i32) -> i32 {
//     post("kasm_emanator_7: Phone Ringtone Tune with micro-timing and velocity humanization");
//
//     let root_note = (note + semitone_offset).max(0).min(127);
//     let complexity_factor = complexity.max(1).min(100) as f32 / 100.0;
//     let humanize_factor = humanize.max(0).min(50) as f32;
//
//     // Phone tune melody intervals (relative to root note)
//     // The classic ringtone melody in E major
//     let ringtone_melody = [
//         4,   // E (perfect 4th from root if root is B)
//         2,   // D (major 2nd)
//         -5,  // F# (perfect 4th down)
//         -7,  // E (perfect 5th down)
//         11,  // B (major 7th)
//         9,   // A (major 6th)
//         5,   // F# (perfect 4th)
//         4,   // E (major 3rd)
//         9,   // A (major 6th)
//         7,   // G# (perfect 5th)
//         4,   // E (major 3rd)
//         2,   // D (major 2nd)
//         11,  // B (major 7th)
//         9,   // A (major 6th)
//         5,   // F# (perfect 4th)
//         4,   // E (major 3rd)
//     ];
//     ...
//
/// Kasm Emanator 8 - Trigonometric Wave Interference
// /// Creates melodic patterns based on sine wave interference and circular trigonometry
// #[wasm_bindgen]
// pub fn kasm_emanator_8(note: i32, semitone_offset: i32, complexity: i32, humanize: i32) -> i32 {
//     post("kasm_emanator_8: Trigonometric Wave Interference");
//
//     let root_note = (note + semitone_offset).max(0).min(127);
//     let complexity_factor = complexity.max(1).min(127) as f64 / 127.0;
//     let humanize_factor = humanize.max(0).min(50) as f64;
//
//     // Generate interference patterns using multiple sine waves
//     let wave_frequencies = [1.0, 1.618, 2.414, 3.162]; // Golden ratio and mathematical constants
//     let phase_offsets = [0.0, std::f64::consts::PI / 3.0, std::f64::consts::PI / 2.0, std::f64::consts::PI];
//
//     let total_samples = (16.0 * complexity_factor) as usize + 8;
//
//     for sample in 0..total_samples {
//         let t = sample as f64 * 0.2; // Time parameter
//
//         // Calculate wave interference
//         let mut interference_sum = 0.0;
//         for (freq, phase) in wave_frequencies.iter().zip(phase_offsets.iter()) {
//             interference_sum += (freq * t + phase).sin() * (1.0 / freq.sqrt());
//         }
//
//         // Convert interference to musical parameters
//         let normalized_interference = (interference_sum + 2.0) / 4.0; // Normalize to 0-1
//
//         // Trigonometric pitch calculation
//         let pitch_angle = t * std::f64::consts::PI / 4.0;
//         let pitch_modifier = (pitch_angle.cos() * 12.0 + pitch_angle.sin() * 7.0) as i32;
//         let interference_pitch = (normalized_interference * 24.0) as i32;
//
//     ...
//
//
/// Kasm Emanator 9 - Complex Reflection Algorithm
// /// Uses geometric reflection and fractal mathematics for evolving melodic patterns
// #[wasm_bindgen]
// pub fn kasm_emanator_9(note: i32, semitone_offset: i32, complexity: i32, humanize: i32) -> i32 {
//     post("kasm_emanator_9: Complex Reflection Algorithm");
//
//     let root_note = (note + semitone_offset).max(0).min(127);
//     let complexity_factor = complexity.max(1).min(127) as f64 / 127.0;
//     let humanize_factor = humanize.max(0).min(50) as f64;
//
//     // Initialize reflection chamber - virtual geometric space
//     let chamber_size = 127.0;
//     let mut particle_x = chamber_size / 2.0;
//     let mut particle_y = chamber_size / 2.0;
//     let mut velocity_x = 3.7 * complexity_factor;
//     let mut velocity_y = 2.3 * complexity_factor;
//
//     // Reflection surfaces with different absorption coefficients
//     let surfaces = [
//         (0.0, 0.95),      // Bottom wall, high absorption
//         (chamber_size, 0.85), // Top wall, medium absorption
//         (0.0, 0.90),      // Left wall, high absorption
//         (chamber_size, 0.80), // Right wall, lower absorption
//     ];
//     ...
//
/// Kasm Emanator 10 - Swarm/boids algorithms, fluid dynamics, and cellular automata for complex musical swarms
// #[wasm_bindgen]
// pub fn kasm_emanator_10(note: i32, semitone_offset: i32, complexity: i32, humanize: i32) -> i32 {
//     post("kasm_emanator_10: Swarm/boids algorithms, fluid dynamics, and cellular automata for complex musical swarms");
//
//     let root_note = (note + semitone_offset).max(0).min(127);
//     let complexity_factor = complexity.max(1).min(127) as f64 / 127.0;
//     let humanize_factor = humanize.max(0).min(50) as f64;
//
//     // Swarm parameters - each agent represents a musical voice
//     let swarm_size = (8.0 + complexity_factor * 12.0) as usize;
//     let mut agents: Vec<(f64, f64, f64, f64, f64)> = Vec::new(); // (x, y, vx, vy, energy)
//
//     // Initialize swarm agents in a circular formation
//     for i in 0..swarm_size {
//         let angle = (i as f64 / swarm_size as f64) * 2.0 * std::f64::consts::PI;
//         let radius = 30.0 + complexity_factor * 20.0;
//         let x = 64.0 + radius * angle.cos();
//         let y = 64.0 + radius * angle.sin();
//         let vx = angle.sin() * complexity_factor * 2.0;
//         let vy = -angle.cos() * complexity_factor * 2.0;
//         let energy = 1.0;
//         agents.push((x, y, vx, vy, energy));
//     }
//
//     // Cellular automata grid for environmental influence
//     let grid_size = 16;
//     let mut cellular_grid = vec![vec![0.0f64; grid_size]; grid_size];
//
//     // Initialize cellular automata with Conway-inspired rules
//     for i in 0..grid_size {
//         for j in 0..grid_size {
//     ...
//
/// Kasm emanator 11 - Fibonacci Spiral Echos (sequence timing with golden ratio velocity decay)
// #[wasm_bindgen]
// pub fn kasm_emanator_11(note: i32, offset: i32, velocity: i32, enc1_velocity_offset: i32, intensity: i32) -> i32 {
//     post("kasm_emanator_11: Fibonacci Spiral Echos (sequence timing with golden ratio velocity decay)");
//
//     let root_note = (note + offset).max(0).min(127);
//
//     // Fibonacci sequence for delay timing (in milliseconds)
//     let fib_delays = [89 , 144, 233, 377, 610, 987, 1597, 2584];
//     let golden_ratio: f64 = 1.618034;
//
//     // Generate echoes with Fibonacci timing and golden ratio decay
//     for (i, &delay) in fib_delays.iter().enumerate() {
//         // Calculate velocity decay using golden ratio
//         let decay_factor = 1.0 / golden_ratio.powi(i as i32 + 1);
//         let mut echo_velocity = (((velocity + (10 * enc1_velocity_offset)) as f64) * decay_factor * ((intensity + 100) as f64 / 127.0)) as i32;
//     ...
//
/// Kasm Emanator 12 - Fractal cascade/echo patterns at different time scales
// #[wasm_bindgen]
// pub fn kasm_emanator_12(note: i32, offset: i32, velocity: i32, enc1_intensity: i32, enc2_complexity: i32) -> i32 {
//     post("kasm_emanator_12: Fractal cascade/echo patterns at different time scales");
//
//     let root_note = (note + offset).max(0).min(127);
//     let base_delay = 120; // Base delay in ms
//     let fractal_levels = (enc2_complexity / 32 + 2).min(5); // 2-5 levels based on complexity
//
//     // Generate fractal echo pattern
//     for level in 0..fractal_levels {
//         let level_scale = 2.0_f64.powi(level);
//         let echoes_per_level = 3_i32.pow(level as u32); // Exponential branching
//
//         for echo in 0..echoes_per_level.min(8) { // Limit to prevent too many notes
//             // Fractal timing: each level has different time scale
//     ...
//
/// Kasm Emanator 13 - Simple first-order Markov chain with basic note transitions
// #[wasm_bindgen]
// pub fn kasm_emanator_13(note: i32, offset: i32, velocity: i32, enc1_intensity: i32, enc2_complexity: i32) -> i32 {
//     post("kasm_emanator_13: Simple first-order Markov chain with basic note transitions");
//
//     let root_note = (note + offset).max(0).min(127);
//     let intensity_factor = (enc1_intensity.max(50).min(127) as f64 + 50.0) / 127.0; // Default ~1.2
//     let complexity_factor = (enc2_complexity.max(40).min(127) as f64 + 40.0) / 127.0; // Default ~0.94
//
//     // Simple first-order Markov transition matrix
//     // States: 0=root, 1=major2nd, 2=major3rd, 3=perfect4th, 4=perfect5th, 5=major6th, 6=major7th, 7=octave
//     let transition_matrix = [
//         [0.3, 0.2, 0.2, 0.1, 0.1, 0.05, 0.03, 0.02], // From root
//         [0.2, 0.1, 0.3, 0.2, 0.1, 0.05, 0.03, 0.02], // From major 2nd
//         [0.15, 0.2, 0.2, 0.2, 0.15, 0.05, 0.03, 0.02], // From major 3rd
//         [0.1, 0.15, 0.2, 0.2, 0.2, 0.1, 0.03, 0.02], // From perfect 4th
//         [0.2, 0.1, 0.15, 0.15, 0.2, 0.15, 0.03, 0.02], // From perfect 5th
//         [0.15, 0.1, 0.1, 0.15, 0.2, 0.2, 0.08, 0.02], // From major 6th
//         [0.3, 0.15, 0.1, 0.1, 0.15, 0.15, 0.03, 0.02], // From major 7th
//         [0.4, 0.2, 0.15, 0.1, 0.1, 0.03, 0.01, 0.01], // From octave
//     ];
//     ...
//
/// Kasm Emanator 14 - Second-Order Markov Chain with Rhythm Patterns
// #[wasm_bindgen]
// pub fn kasm_emanator_14(note: i32, offset: i32, velocity: i32, enc1_intensity: i32, enc2_complexity: i32) -> i32 {
//     post("kasm_emanator_14: Second-Order Markov Chain with Rhythm Patterns");
//
//     let root_note = (note + offset).max(0).min(127);
//     let intensity_factor = (enc1_intensity.max(50).min(127) as f64 + 50.0) / 127.0;
//     let complexity_factor = (enc2_complexity.max(40).min(127) as f64 + 40.0) / 127.0;
//
//     // Extended scale with chromatic passing tones
//     let scale_intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 17];
//     let num_states = scale_intervals.len();
//
//     // Second-order Markov chain: probability depends on last two states
//     // Simplified representation - in practice this would be a 3D matrix
//     let mut state_history = vec![0, 4]; // Start with root and major 3rd
//     let sequence_length = (16.0 + complexity_factor * 12.0) as usize;
//
//     ...
//
/// Kasm Emanator 15 - Multi-Dimensional Markov Chain with Harmonic Context
// #[wasm_bindgen]
// pub fn kasm_emanator_15(note: i32, offset: i32, velocity: i32, enc1_intensity: i32, enc2_complexity: i32) -> i32 {
//     post("kasm_emanator_15: Multi-Dimensional Markov Chain with Harmonic Context");
//
//     let root_note = (note + offset).max(0).min(127);
//     let intensity_factor = (enc1_intensity.max(50).min(127) as f64 + 50.0) / 127.0;
//     let complexity_factor = (enc2_complexity.max(40).min(127) as f64 + 40.0) / 127.0;
//
//     // Multi-dimensional state space: (pitch_class, rhythm_class, harmonic_context)
//     let pitch_classes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 17, 19, 21, 24];
//     let rhythm_classes = [300, 350, 400, 450, 500, 600, 750]; // Different note durations
//     let harmonic_contexts = ["major", "minor", "diminished", "augmented", "sus4", "sus2"];
//
//     let sequence_length = (20.0 + complexity_factor * 16.0) as usize;
//
//     // State tracking
//     let mut pitch_state = 0; // Index into pitch_classes
//     let mut rhythm_state = 2; // Index into rhythm_classes (start with 400ms)
//     let mut harmonic_state = 0; // Index into harmonic_contexts (start with major)
//     let mut phrase_position = 0; // Position within musical phrase
//
//     for step in 0..sequence_length {
//         // Multi-dimensional transition logic
//
//         // Pitch transitions influenced by harmonic context
//         let pitch_transition_weights = match harmonic_contexts[harmonic_state] {
//             "major" => [0.2, 0.05, 0.15, 0.05, 0.15, 0.1, 0.05, 0.15, 0.05, 0.03, 0.02, 0.02, 0.08, 0.05, 0.03, 0.01, 0.01, 0.01, 0.02],
//                 "minor" => [0.15, 0.05, 0.1, 0.15, 0.1, 0.15, 0.05, 0.1, 0.05, 0.05, 0.03, 0.02, 0.08, 0.05, 0.03, 0.01, 0.01, 0.01, 0.02],
//                 "diminished" => [0.1, 0.1, 0.05, 0.15, 0.05, 0.1, 0.15, 0.05, 0.1, 0.05, 0.05, 0.03, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
//                 "augmented" => [0.15, 0.05, 0.1, 0.05, 0.15, 0.05, 0.1, 0.15, 0.05, 0.05, 0.03, 0.02, 0.08, 0.05, 0.03, 0.01, 0.01, 0.01, 0.02],
//                 "sus4" => [0.2, 0.03, 0.05, 0.03, 0.2, 0.15, 0.03, 0.2, 0.03, 0.03, 0.02, 0.01, 0.1, 0.05, 0.03, 0.01, 0.01, 0.01, 0.02],
//                 "sus2" => [0.2, 0.03, 0.15, 0.03, 0.05, 0.15, 0.03, 0.2, 0.03, 0.03, 0.02, 0.01, 0.1, 0.05, 0.03, 0.01, 0.01, 0.01, 0.02],
//                 _ => [0.05; 19], // Fallback uniform distribution
//         };
//     ...
//
// Kasm Emanator 16 - Simple Chord Progression
// #[wasm_bindgen]
// pub fn kasm_emanator_16(note: i32, offset: i32, velocity: i32, enc1_intensity: i32, enc2_complexity: i32) -> i32 {
//     post("kasm_emanator_16: Simple Chord Progression");
//
//     let root_note = (note + offset).max(0).min(127);
//     let intensity_factor = (enc1_intensity.max(50).min(127) as f64 + 50.0) / 127.0;
//     let complexity_factor = (enc2_complexity.max(40).min(127) as f64 + 40.0) / 127.0;
//
//     let chord_intervals = [0, 4, 7]; // Major triad
//     for (i, &interval) in chord_intervals.iter().enumerate() {
//         let chord_note = (root_note + interval).max(0).min(127);
//         let delay = (i as f64 * 200.0 * intensity_factor) as i32;
//         let chord_velocity = (velocity as f64 * (0.8 + 0.2 * intensity_factor)) as i32;
//
//         send_note(chord_note, chord_velocity.max(30).min(127), delay, 800, -1);
//     }
//     ...
//
// Kasm Emanator 17 - Extended Chord Progression with Inversions
// #[wasm_bindgen]
// pub fn kasm_emanator_17(note: i32, offset: i32, velocity: i32, enc1_intensity: i32, enc2_complexity: i32) -> i32 {
//     post("kasm_emanator_17: Extended Chord Progression with Inversions");
//
//     let root_note = (note + offset).max(0).min(127);
//     let intensity_factor = (enc1_intensity.max(50).min(127) as f64 + 50.0) / 127.0;
//     let complexity_factor = (enc2_complexity.max(40).min(127) as f64 + 40.0) / 127.0;
//
//     let chord_intervals = [0, 4, 7, 11]; // Major 7th chord
//     for (i, &interval) in chord_intervals.iter().enumerate() {
//         let chord_note = (root_note + interval).max(0).min(127);
//         let delay = (i as f64 * 150.0 * intensity_factor) as i32;
//         let chord_velocity = (velocity as f64 * (0.7 + 0.3 * intensity_factor)) as i32;
//
//         send_note(chord_note, chord_velocity.max(30).min(127), delay, 1000, -1);
//
//         // Add inversion for complexity
//         if enc2_complexity > 80 {
//             let inversion_note = (chord_note - 12).max(0);
//             send_note(inversion_note, chord_velocity / 2, delay + 100, 800, -1);
//         }
//     }
//     ...

/*
 * Copyright (c) Pyrmont Brewery 2025
 * Author: Kevin Staunton-Lambert
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

