// Audio engine (008 R5 / US4) — Web Audio inside the worker.
//
// 8 SoundChannels, each owning:
//   - a GainNode (volume; the fade ramps target this)
//   - a PannerNode (pan −100..100 → pan value −1..1)
//   - a source node connected gain→panner→destination on `play(member)`
//
// `play(member)` decodes the member's inline bytes via `decodeAudioData` and
// connects the buffer source. Decode failure leaves the channel idle without
// throwing (C4). `fadeIn(n)`/`fadeOut(n)` ramp the gain over n ticks, driven
// by the event-loop idle path calling `ch.tick(1)` per frame.

export function createAudioEngine(audioContext) {
  const channels = [];
  for (let i = 1; i <= 8; i++) {
    const gainNode = audioContext.createGain();
    const panner = audioContext.createPanner();
    gainNode.connect(panner);
    panner.connect(audioContext.destination);
    const channel = {
      number: i,
      gainNode,
      panner,
      isPlaying: false,
      buffer: null,
      source: null,
      fadeState: "idle",
      fadeTotal: 0,
      fadeElapsed: 0,

      async play(member) {
        try {
          const bytes = member?.payload?.bytes;
          if (!bytes) {
            channel.isPlaying = false;
            return;
          }
          const buffer = await audioContext.decodeAudioData(bytes);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(gainNode);
          source.start();
          channel.source = source;
          channel.buffer = buffer;
          channel.isPlaying = true;
        } catch {
          channel.isPlaying = false;
          channel.buffer = null;
        }
      },

      pause() {
        channel.source?.stop?.();
        channel.isPlaying = false;
      },

      setVolume(v) {
        const vol = Math.max(0, Math.min(1, Number(v) || 0));
        channel.gainNode.gain.setValueAtTime(vol, audioContext.currentTime ?? 0);
      },

      setPan(pan) {
        const p = Math.max(-100, Math.min(100, Number(pan) || 0));
        channel.panner.pan.value = p / 100;
      },

      fadeIn(ticks) {
        channel.fadeState = "in";
        channel.fadeTotal = Math.max(1, Math.trunc(Number(ticks) || 1));
        channel.fadeElapsed = 0;
      },

      fadeOut(ticks) {
        channel.fadeState = "out";
        channel.fadeTotal = Math.max(1, Math.trunc(Number(ticks) || 1));
        channel.fadeElapsed = 0;
      },

      tick() {
        if (channel.fadeState === "idle") return;
        channel.fadeElapsed += 1;
        const progress = Math.min(1, channel.fadeElapsed / channel.fadeTotal);
        const target = channel.fadeState === "in" ? progress : 1 - progress;
        channel.gainNode.gain.linearRampToValueAtTime(target, audioContext.currentTime ?? progress);
        if (progress >= 1) {
          channel.fadeState = "idle";
          channel.gainNode.gain.setValueAtTime(target, audioContext.currentTime ?? 1);
        }
      },
    };
    channels.push(channel);
  }

  return { channels };
}