/* ------------------------------------------------------------------ *
 *  Encode the rendered demo song to MP3.
 *
 *  The sandbox has no ffmpeg/lame binary, so the encoder runs in Node via
 *  lamejs (a pure-JS LAME port). Tooling only — the MP3 it writes is what
 *  ships.
 *
 *    node tools/encode-demo-audio.mjs /tmp/faimess-demo.wav \
 *         src/assets/audio/faimess-demo.mp3 [kbps]
 * ------------------------------------------------------------------ */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import lamejs from "@breezystack/lamejs";

const [src, dest, kbpsArg] = process.argv.slice(2);
if (!src || !dest) {
  console.error("usage: node tools/encode-demo-audio.mjs <in.wav> <out.mp3> [kbps]");
  process.exit(1);
}

const wav = readFileSync(src);
if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") {
  throw new Error(`${src} is not a RIFF/WAVE file`);
}

let channels = 1;
let sampleRate = 44100;
let bits = 16;
let dataStart = 44;
let dataLength = wav.length - 44;

for (let p = 12; p + 8 <= wav.length; ) {
  const id = wav.toString("ascii", p, p + 4);
  const size = wav.readUInt32LE(p + 4);
  if (id === "fmt ") {
    channels = wav.readUInt16LE(p + 10);
    sampleRate = wav.readUInt32LE(p + 12);
    bits = wav.readUInt16LE(p + 22);
  } else if (id === "data") {
    dataStart = p + 8;
    dataLength = Math.min(size, wav.length - dataStart);
    break;
  }
  p += 8 + size + (size % 2);
}

if (bits !== 16) throw new Error(`expected 16-bit PCM, got ${bits}-bit`);
if (channels !== 1) throw new Error(`expected mono, got ${channels} channels`);

const bytes = wav.subarray(dataStart, dataStart + dataLength);
const samples = new Int16Array(bytes.length >> 1);
for (let i = 0; i < samples.length; i += 1) samples[i] = bytes.readInt16LE(i * 2);

const kbps = Number(kbpsArg ?? 80);
const encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
const parts = [];

for (let i = 0; i < samples.length; i += 1152) {
  const block = encoder.encodeBuffer(samples.subarray(i, i + 1152));
  if (block.length) parts.push(Buffer.from(block));
}
const tail = encoder.flush();
if (tail.length) parts.push(Buffer.from(tail));

mkdirSync(dirname(dest), { recursive: true });
const mp3 = Buffer.concat(parts);
writeFileSync(dest, mp3);

const seconds = samples.length / sampleRate;
console.log(
  `${dest} — ${seconds.toFixed(1)}s mono @ ${kbps}kbps, ${(mp3.length / 1048576).toFixed(2)}MB`,
);
