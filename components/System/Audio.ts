
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export class AudioController {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  private bossInterval: any = null;

  constructor() {
    // Lazy initialization
  }

  init() {
    if (!this.ctx) {
      // Support for standard and webkit prefixed AudioContext
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7; // Loud master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  stopBossAmbience() {
      if (this.bossInterval) {
          clearInterval(this.bossInterval);
          this.bossInterval = null;
      }
  }

  startBossAmbience(type: 'KALIN' | 'STILYAN' | 'NIKOLAI') {
      this.stopBossAmbience();
      this.init();
      
      // Safety check
      if (!this.ctx) return;

      const playSound = () => {
          if (this.ctx?.state === 'suspended') this.ctx.resume();
          
          if (type === 'KALIN') this.playBark();
          else if (type === 'STILYAN') this.playHorse();
          else this.playMeow();
      };

      playSound(); // Play immediately
      
      // Set interval based on animal type for natural pacing
      // Dog barks frequently, Horse/Cat less often
      const interval = type === 'KALIN' ? 2000 : (type === 'STILYAN' ? 3500 : 3000);
      
      this.bossInterval = setInterval(playSound, interval);
  }

  playGemCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playLetterCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99]; 
    
    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = f;
        
        const start = t + (i * 0.04);
        const dur = 0.3;

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.start(start);
        osc.stop(start + dur);
    });
  }

  playJump(isDouble = false) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isDouble ? 400 : 200;
    const endFreq = isDouble ? 800 : 450;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playDamage() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Simple noise burst for damage
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 0.3);
  }

  // --- SIMPLIFIED & LOUD BOSS SOUNDS ---

  playMeow() {
    // Basic Cat: High Sine wave sliding down
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine'; // Pure tone
    
    // Meee-ooo-w
    osc.frequency.setValueAtTime(800, t); 
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.2); // Up
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.6); // Down

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.1); 
    gain.gain.linearRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  playBark() {
    // Basic Dog: Low Square wave pulse
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square'; // Buzz/Rough sound
    
    // WOOF (Quick pitch drop)
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15); 

    gain.gain.setValueAtTime(1.0, t); // Loud
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playHorse() {
    // Basic Horse: Sawtooth with Vibrato
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth'; // Bright/Harsh
    
    // Whinny pitch drop
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.8);

    // Create Vibrato manually via frequency automation points or LFO
    // Simple LFO approach
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 15; // Fast shake
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200; // Pitch depth

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.1);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.8);
    lfo.stop(t + 0.8);
  }
}

export const audio = new AudioController();
