
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
      this.masterGain.gain.value = 0.5; 
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
      
      if (!this.ctx) return;

      const playSound = () => {
          if (this.ctx?.state === 'suspended') this.ctx.resume();
          
          if (type === 'KALIN') this.playBark();
          else if (type === 'STILYAN') this.playHorse();
          else this.playMeow();
      };

      // Play immediately
      playSound();
      
      // Loop interval varies by boss personality
      // Dog: Frequent barks (2s)
      // Horse: Occasional neighs (3.5s)
      // Cat: Meows (3s)
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

    gain.gain.setValueAtTime(0.3, t);
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

        gain.gain.setValueAtTime(0.2, start);
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

    osc.type = 'square'; // Changed to square for "8-bit jump" sound
    const startFreq = isDouble ? 300 : 150;
    const endFreq = isDouble ? 600 : 300;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(endFreq, t + 0.1);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playDamage() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 0.3);
  }

  // --- RETRO BOSS SOUNDS (LOUD & SIMPLE) ---

  playMeow() {
    // CAT: High pitch sine wave sliding up then down
    // Sounds like: "WEEE-oooo"
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Triangle wave is distinct but not too harsh
    osc.type = 'triangle'; 
    
    // Pitch: Start mid, go high, go low
    osc.frequency.setValueAtTime(400, t); 
    osc.frequency.linearRampToValueAtTime(800, t + 0.3); // Me...
    osc.frequency.linearRampToValueAtTime(300, t + 0.6); // ...ow

    // Volume
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.1); 
    gain.gain.linearRampToValueAtTime(0.5, t + 0.4); 
    gain.gain.linearRampToValueAtTime(0, t + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  playBark() {
    // DOG: Rough low square wave
    // Sounds like: "ROWF"
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Square wave cuts through the mix
    osc.type = 'square'; 
    
    // Pitch: Start mid-low, drop fast
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15); 

    // Volume: Short and punchy
    gain.gain.setValueAtTime(0.4, t); 
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playHorse() {
    // HORSE: Sawtooth wave with heavy vibrato
    // Sounds like: "IIIIH-hi-hi-hi"
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Sawtooth is very buzzy/bright
    osc.type = 'sawtooth'; 
    
    // Pitch: High sliding down
    osc.frequency.setValueAtTime(1000, t);
    osc.frequency.linearRampToValueAtTime(500, t + 0.8);

    // Vibrato (The shake)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 15; // Speed of shake
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 150; // Depth of shake

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Volume
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.8);
    lfo.stop(t + 0.8);
  }
}

export const audio = new AudioController();
