import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward,
         Volume2, VolumeX, Loader2 } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  gender: string;
  accent: string;
}

interface TTSAudioPlayerProps {
  script: string;
  contentId?: string;
  autoPlay?: boolean;
}

export const TTSAudioPlayer: React.FC<TTSAudioPlayerProps> = ({
  script,
  contentId,
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("af_bella");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load voices on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch('/api/tts/voices', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(setVoices)
      .catch(() => {});
  }, []);

  // Generate audio when voice or script changes
  const generateAudio = async (voice: string) => {
    setIsGenerating(true);
    setGenerationError(false);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: script, voice, contentId }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch {
      setGenerationError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate on mount
  useEffect(() => {
    if (script) generateAudio(selectedVoice);
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [script]);

  // Wire up audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration 
        ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    if (autoPlay) { audio.play(); setIsPlaying(true); }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Voice command listener
  useEffect(() => {
    const handleVoiceCommand = (e: any) => {
      const { action } = e.detail;
      const audio = audioRef.current;
      if (!audio) return;

      if (action === "PLAY") {
        audio.play();
        setIsPlaying(true);
      } else if (action === "PAUSE") {
        audio.pause();
        setIsPlaying(false);
      } else if (action === "SPEED_UP") {
        setPlaybackRate(p => {
          const newRate = Math.min(2.0, p + 0.25);
          audio.playbackRate = newRate;
          return newRate;
        });
      } else if (action === "SLOW_DOWN") {
        setPlaybackRate(p => {
          const newRate = Math.max(0.5, p - 0.25);
          audio.playbackRate = newRate;
          return newRate;
        });
      }
    };

    window.addEventListener("voice-command-viewer", handleVoiceCommand);
    return () => window.removeEventListener("voice-command-viewer", handleVoiceCommand);
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0,
      Math.min(audio.currentTime + seconds, audio.duration));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current)
      audioRef.current.volume = newMuted ? 0 : volume;
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    generateAudio(voiceId);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <audio ref={audioRef} preload="auto" className="hidden" />

      {/* Voice Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {voices.map(v => (
          <button
            key={v.id}
            onClick={() => handleVoiceChange(v.id)}
            disabled={isGenerating}
            className={`flex flex-col items-start px-3 py-2 rounded-lg
              border text-left transition-all text-sm
              ${selectedVoice === v.id
                ? 'border-primary bg-primary/10 font-medium'
                : 'border-border hover:bg-muted'
              }
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="font-medium">{v.name}</span>
            <span className="text-xs text-muted-foreground">
              {v.gender === 'F' ? '♀' : '♂'} {v.accent}
            </span>
          </button>
        ))}
      </div>

      {/* Generating state */}
      {isGenerating && (
        <div className="flex items-center gap-3 rounded-lg border 
                        bg-muted/50 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary 
                              shrink-0" />
          <div>
            <p className="text-sm font-medium">
              Generating audio with Kokoro TTS...
            </p>
            <p className="text-xs text-muted-foreground">
              First generation may take 20–30 seconds. 
              Subsequent requests are instant.
            </p>
          </div>
        </div>
      )}

      {/* Error fallback */}
      {generationError && !isGenerating && (
        <div className="rounded-lg border border-destructive/30 
                        bg-destructive/10 p-3 text-sm 
                        text-destructive flex items-center 
                        justify-between">
          <span>Audio generation failed.</span>
          <button
            onClick={() => generateAudio(selectedVoice)}
            className="text-xs underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Player */}
      {audioUrl && !isGenerating && (
        <div className="rounded-xl bg-[#355872] text-white 
                        p-4 shadow-lg">
          {/* Progress bar */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full mb-3 h-1 rounded-lg 
                       appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right,
                #9CD5FF 0%, #9CD5FF ${progress}%,
                #4A5568 ${progress}%, #4A5568 100%)`
            }}
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} 
              of ${formatTime(duration)}`}
          />

          <div className="flex items-center justify-between gap-3">
            {/* Time */}
            <span className="text-xs tabular-nums w-20 shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-15)}
                className="p-1.5 hover:bg-white/10 rounded-full 
                           transition"
                aria-label="Skip back 15 seconds"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 bg-[#4c84ad] hover:bg-[#5a9ad1] 
                           rounded-full transition"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying
                  ? <Pause size={22} fill="currentColor" />
                  : <Play size={22} fill="currentColor"
                          className="ml-0.5" />}
              </button>
              <button
                onClick={() => handleSkip(15)}
                className="p-1.5 hover:bg-white/10 rounded-full 
                           transition"
                aria-label="Skip forward 15 seconds"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Speed + Volume */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={playbackRate}
                onChange={(e) => handleRateChange(
                  parseFloat(e.target.value)
                )}
                className="bg-white/10 border border-white/20 
                           rounded px-1.5 py-0.5 text-xs 
                           text-white focus:outline-none"
                aria-label="Playback speed"
              >
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(r => (
                  <option key={r} value={r} className="text-black">
                    {r}x
                  </option>
                ))}
              </select>

              <button
                onClick={toggleMute}
                className="p-1 hover:bg-white/10 rounded-full 
                           transition"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted
                  ? <VolumeX size={16} />
                  : <Volume2 size={16} />}
              </button>

              <input
                type="range"
                min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded appearance-none 
                           cursor-pointer"
                style={{
                  background: `linear-gradient(to right,
                    #9CD5FF 0%,
                    #9CD5FF ${(isMuted ? 0 : volume) * 100}%,
                    #4A5568 ${(isMuted ? 0 : volume) * 100}%,
                    #4A5568 100%)`
                }}
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
