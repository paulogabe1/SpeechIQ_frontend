import { useEffect, useState } from "react";

// Deliberately much higher than what's shown at 1x zoom (WaveformSeeker decimates
// down to ~250 displayed bars by default). This is the "raw" resolution backing
// the multi-resolution zoom scheme — WaveformSeeker combines several of these raw
// peaks into each bar when zoomed out, and shows progressively fewer raw peaks per
// bar as you zoom in, down to this exact resolution at max zoom (8x * 250 = 2000).
const SEEK_WAVEFORM_BARS = 2000;

/**
 * Decodes an audio Blob/File via Web Audio to get a real duration (MediaRecorder's
 * webm/ogg blobs report Infinity via <audio>.duration until forced, and that
 * workaround is unreliable — see PracticeSession) and a fixed-resolution waveform
 * (peak amplitude per bucket across the whole clip), for use as a seek scrubber.
 */
export function useAudioWaveform(source: Blob | File | null | undefined) {
  const [duration, setDuration] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);

  useEffect(() => {
    if (!source) {
      setDuration(0);
      setSamples([]);
      return;
    }

    let cancelled = false;
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    source
      .arrayBuffer()
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        if (cancelled) return;
        setDuration(decoded.duration);

        const channelData = decoded.getChannelData(0);
        const blockSize = Math.max(1, Math.floor(channelData.length / SEEK_WAVEFORM_BARS));
        const bars = new Array(SEEK_WAVEFORM_BARS);
        for (let i = 0; i < SEEK_WAVEFORM_BARS; i++) {
          const start = i * blockSize;
          let peak = 0;
          for (let j = start; j < start + blockSize && j < channelData.length; j++) {
            const abs = Math.abs(channelData[j]);
            if (abs > peak) peak = abs;
          }
          bars[i] = peak;
        }

        // Normalize against the loudest bucket in the clip so quiet recordings
        // (low mic gain, soft speaker) still fill the bar height — otherwise every
        // bar renders tiny regardless of the actual visual scale available.
        const maxPeak = Math.max(...bars, 1e-6);
        setSamples(bars.map((v) => Math.min(1, v / maxPeak)));
      })
      .catch(() => {
        // Ignore — caller falls back to the <audio> element's own duration, and the
        // seek waveform simply stays empty.
      })
      .finally(() => ctx.close());

    return () => {
      cancelled = true;
    };
  }, [source]);

  return { duration, samples };
}
