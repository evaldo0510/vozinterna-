class NatureAudio {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private nodes: any[] = [];

  public start() {
    if (this.isRunning) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // 1. modulated organic forest wind wind (filtered noise)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      const windLfo = this.ctx.createOscillator();
      windLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime); // extremely slow modulation
      const windLfoGain = this.ctx.createGain();
      windLfoGain.gain.setValueAtTime(110, this.ctx.currentTime);

      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      noiseNode.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ctx.destination);

      windLfo.start();
      noiseNode.start();
      this.nodes.push(windLfo, windLfoGain, noiseNode, windFilter, windGain);

      // 2. High-frequency ambient crickets chirp pulses in the distance
      const interval = setInterval(() => {
        if (!this.ctx || this.ctx.state === 'suspended') return;
        const now = this.ctx.currentTime;
        if (Math.random() > 0.35) {
          const chirpOsc = this.ctx.createOscillator();
          chirpOsc.type = 'sine';
          chirpOsc.frequency.setValueAtTime(3850 + Math.random() * 300, now);

          const chirpGain = this.ctx.createGain();
          chirpGain.gain.setValueAtTime(0, now);

          chirpOsc.connect(chirpGain);
          chirpGain.connect(this.ctx.destination);

          let time = now;
          for (let j = 0; j < 4; j++) {
            chirpGain.gain.setValueAtTime(0, time);
            chirpGain.gain.linearRampToValueAtTime(0.007, time + 0.015);
            chirpGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
            time += 0.1;
          }

          chirpOsc.start(now);
          chirpOsc.stop(time + 0.05);
        }
      }, 1600);

      this.nodes.push({ stop: () => clearInterval(interval) });
      this.isRunning = true;
    } catch (err) {
      console.warn("Immersive Nature audio start failed:", err);
    }
  }

  public stop() {
    this.nodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') {
          node.stop();
        } else if (typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch (err) {}
    });
    this.nodes = [];
    this.isRunning = false;
    this.ctx = null;
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const natureAudioPlayer = new NatureAudio();
