#!/usr/bin/env python3
"""Render the demo song FAIMESS ships with.

The sandbox has no way to fetch a licensed master, so the player's "real
audio" is synthesised here: an 84 BPM lo-fi instrumental in A minor, long
enough (2:40) to cover the lyric timelines in src/data/lyrics.ts.

    python3 -m venv /tmp/fontenv
    /tmp/fontenv/bin/pip install numpy
    /tmp/fontenv/bin/python tools/make-demo-audio.py /tmp/faimess-demo.wav
    node tools/encode-demo-audio.mjs /tmp/faimess-demo.wav src/assets/audio/faimess-demo.mp3

Replace the MP3 with a licensed track before this is anything but a demo —
see docs/audio.md.
"""

import sys
import wave

import numpy as np

SR = 44100
BPM = 84.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
BARS = 56
DUR = BARS * BAR
N = int(DUR * SR)
rng = np.random.default_rng(20251004)

mix = np.zeros(N + SR)


def midi(note: int) -> float:
    return 440.0 * 2 ** ((note - 69) / 12)


def add(start: float, length: float, sig: np.ndarray) -> None:
    i = int(start * SR)
    if i >= N:
        return
    end = min(i + len(sig), len(mix))
    mix[i:end] += sig[: end - i]


def envelope(t: np.ndarray, length: float, attack: float, decay: float, sustain: float, release: float):
    env = np.clip(t / max(attack, 1e-4), 0.0, 1.0)
    env *= sustain + (1.0 - sustain) * np.exp(-t / max(decay, 1e-4))
    tail = t > length
    if tail.any() and release > 0:
        env[tail] *= np.clip(1.0 - (t[tail] - length) / release, 0.0, 1.0)
    return env


def tone(start, length, freq, gain, *, attack=0.02, decay=0.35, sustain=0.5, release=0.25, bright=0.3, vib=0.0):
    """A soft, slightly detuned additive voice — pad, bass or lead."""
    n = int((length + release) * SR)
    t = np.arange(n) / SR
    vib_mod = 1.0 + vib * np.sin(2 * np.pi * 4.6 * t)
    sig = (
        np.sin(2 * np.pi * freq * t * vib_mod)
        + bright * np.sin(2 * np.pi * freq * 2.0 * t)
        + bright * 0.35 * np.sin(2 * np.pi * freq * 3.0 * t)
        + 0.5 * bright * np.sin(2 * np.pi * freq * 1.004 * t)
    )
    sig *= envelope(t, length, attack, decay, sustain, release)
    add(start, length, gain * sig)


def noise_burst(start, length, gain, decay, lowpass=0.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = rng.normal(0, 1, n) * np.exp(-t / decay)
    if lowpass:  # one-pole low pass, to keep the hiss soft
        out = np.zeros(n)
        acc = 0.0
        for i in range(n):
            acc += lowpass * (sig[i] - acc)
            out[i] = acc
        sig = sig - out  # high-passed remainder
    add(start, length, gain * sig)


def kick(start, gain=0.9):
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    freq = 46 + 95 * np.exp(-t / 0.028)
    phase = np.cumsum(2 * np.pi * freq / SR)
    add(start, 0.42, gain * np.sin(phase) * np.exp(-t / 0.22))


def snare(start, gain=0.32):
    noise_burst(start, 0.24, gain, 0.085, lowpass=0.35)
    tone(start, 0.09, 196, gain * 0.5, attack=0.001, decay=0.03, sustain=0.05, release=0.05, bright=0.1)


def hat(start, gain=0.09, open=False):
    noise_burst(start, 0.22 if open else 0.07, gain, 0.075 if open else 0.016)


# ---------------------------------------------------------------- harmony
# A minor, one chord a bar: Am7 · Fmaj7 · Cmaj7 · G6
CHORDS = [
    ([57, 60, 64, 67], 45),  # Am7  (A3 C4 E4 G4)  bass A2
    ([53, 57, 60, 64], 41),  # Fmaj7             bass F2
    ([55, 60, 64, 67], 36),  # Cmaj7             bass C2
    ([55, 59, 62, 64], 43),  # G6                bass G2
]
SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76]  # A C D E G A C D E


def section(bar: int) -> str:
    if bar < 4:
        return "intro"
    if bar < 20:
        return "verse"
    if bar < 36:
        return "chorus"
    if bar < 44:
        return "break"
    return "outro"


for bar in range(BARS):
    part = section(bar)
    start = bar * BAR
    notes, bass = CHORDS[bar % 4]

    # pad — the chord, held for the bar, two voices for width
    for k, note in enumerate(notes):
        gain = 0.085 if part != "chorus" else 0.1
        tone(start, BAR * 0.96, midi(note), gain, attack=0.28, decay=1.4, sustain=0.55, release=0.7, bright=0.22, vib=0.0012)
        tone(start + 0.01, BAR * 0.94, midi(note) * 1.0035, gain * 0.5, attack=0.4, decay=1.6, sustain=0.5, release=0.8, bright=0.16)

    # bass — root on the beat, a fifth on the off-beat
    if part != "break":
        for b, offset in enumerate([0.0, 1.0, 2.0, 3.0]):
            tone(start + offset * BEAT, 0.42 if b % 2 == 0 else 0.3, midi(bass - 12), 0.34 if b == 0 else 0.24,
                 attack=0.005, decay=0.16, sustain=0.25, release=0.12, bright=0.35)
    else:
        tone(start, BAR * 0.9, midi(bass - 12), 0.3, attack=0.4, decay=2.0, sustain=0.45, release=0.9, bright=0.3)

    # drums
    if part in ("verse", "chorus", "outro"):
        kick(start, 0.95 if part == "chorus" else 0.8)
        kick(start + 2 * BEAT, 0.9 if part == "chorus" else 0.72)
        if part == "chorus" and bar % 2 == 1:
            kick(start + 3.5 * BEAT, 0.6)
        snare(start + BEAT, 0.3)
        snare(start + 3 * BEAT, 0.32)
        for e in range(8):
            hat(start + e * BEAT / 2, 0.055 if e % 2 else 0.085, open=(part == "chorus" and e == 7))

    # lead — a pentatonic motif, varied per section
    if part in ("verse", "chorus", "break", "outro"):
        steps = 8 if part in ("verse", "chorus") else 4
        for s in range(steps):
            if part == "break" and s % 2:
                continue
            if rng.random() < (0.32 if part == "verse" else 0.5):
                note = SCALE[int(rng.integers(0, len(SCALE)))]
                when = start + s * BEAT / 2
                gain = 0.13 if part == "chorus" else 0.1
                tone(when, BEAT * 0.42, midi(note), gain, attack=0.012, decay=0.22, sustain=0.3, release=0.28, bright=0.4, vib=0.002)
                if part == "chorus":  # a fifth above, softly
                    tone(when + 0.02, BEAT * 0.4, midi(note + 7), gain * 0.45, attack=0.02, decay=0.22, sustain=0.3, release=0.3, bright=0.35)

    # vinyl hiss under everything
    noise_burst(start, BAR, 0.0055, 6.0, lowpass=0.12)

# ------------------------------------------------------------------ master
mix = mix[:N]

# one-pole low pass to soften the top, then a gentle high shelf cut
out = np.zeros(N)
acc = 0.0
alpha = 0.42
for i in range(N):
    acc += alpha * (mix[i] - acc)
    out[i] = acc
mix = 0.55 * mix + 0.45 * out

# soft clip and normalise
mix = np.tanh(mix * 1.25)
peak = np.max(np.abs(mix)) or 1.0
mix *= 0.89 / peak

# fades
fade_in = int(1.6 * SR)
fade_out = int(5.0 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in) ** 1.6
mix[-fade_out:] *= np.linspace(1, 0, fade_out) ** 1.4

pcm = (mix * 32767).astype("<i2")

target = sys.argv[1] if len(sys.argv) > 1 else "/tmp/faimess-demo.wav"
with wave.open(target, "wb") as f:
    f.setnchannels(1)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())

print(f"{target} — {DUR:.1f}s, peak {np.max(np.abs(mix)):.2f}, rms {np.sqrt(np.mean(mix**2)):.3f}")
