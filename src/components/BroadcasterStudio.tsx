import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChannelPerk, AlertPopupTheme } from '../types';
import {
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Sparkles,
  Zap,
  BatteryCharging,
  Sliders,
  Gift,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Activity,
  Award,
} from 'lucide-react';

interface BroadcasterStudioProps {
  currentUser: UserProfile;
  isLive: boolean;
  onStartBroadcast: (streamTitle: string, category: string, stream: MediaStream | null) => void;
  onStopBroadcast: () => void;
  onClaimFollowerBounty: () => void;
  onOpenStore: () => void;
  onFollowerSimulate: () => void;
}

export const BroadcasterStudio: React.FC<BroadcasterStudioProps> = ({
  currentUser,
  isLive,
  onStartBroadcast,
  onStopBroadcast,
  onClaimFollowerBounty,
  onOpenStore,
  onFollowerSimulate,
}) => {
  const [streamTitle, setStreamTitle] = useState('My Live Stream • Real-Time Chat Active!');
  const [category, setCategory] = useState('Just Chatting');
  const [sourceType, setSourceType] = useState<'camera' | 'screen' | 'virtual'>('camera');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [ecoMode, setEcoMode] = useState(true); // Power-saving / low bandwidth profile
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const virtualCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize media stream (Camera/Mic or Screen)
  const initMediaStream = async (type: 'camera' | 'screen') => {
    setCameraError(null);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      let stream: MediaStream;
      if (type === 'camera') {
        const constraints: MediaStreamConstraints = {
          video: ecoMode
            ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
          audio: true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }

      mediaStreamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      // Hook up Audio Analyser for VU-meter
      setupAudioMeter(stream);
    } catch (err: any) {
      console.warn('Could not acquire hardware camera/mic:', err);
      setCameraError(
        'Physical camera/mic not detected or permission denied. Switched to Virtual Studio Mode so you can still broadcast flawlessly!'
      );
      setSourceType('virtual');
    }
  };

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch {
      // ignore
    }
  };

  // Initial load
  useEffect(() => {
    if (sourceType === 'camera') {
      initMediaStream('camera');
    } else if (sourceType === 'screen') {
      initMediaStream('screen');
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [sourceType, ecoMode]);

  // Virtual Canvas Studio Animation (Fallback / Simulation)
  useEffect(() => {
    if (sourceType !== 'virtual') return;

    const canvas = virtualCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      // Synthwave Cyberpunk Broadcast Graphic
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0a14');
      grad.addColorStop(0.6, '#2e1065');
      grad.addColorStop(1, '#050508');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Neon grid
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.6);
        ctx.lineTo(x + (x - w / 2) * 0.8, h);
        ctx.stroke();
      }

      // Studio Live Avatar Badge
      ctx.fillStyle = '#18181b';
      ctx.fillRect(w * 0.35, h * 0.2, w * 0.3, h * 0.45);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.strokeRect(w * 0.35, h * 0.2, w * 0.3, h * 0.45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentUser.displayName, w * 0.5, h * 0.38);

      ctx.font = '14px monospace';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('● VIRTUAL BROADCAST ENCODER READY', w * 0.5, h * 0.45);

      // Simulated Audio Bars
      for (let i = 0; i < 18; i++) {
        const barH = 10 + Math.sin(t * 3 + i) * 30 + Math.cos(t * 2) * 15;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(w * 0.38 + i * 16, h * 0.58 - barH, 12, barH);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sourceType, currentUser.displayName]);

  // Handle Mute Mic
  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  // Handle Camera Disable
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOff;
      });
    }
    setIsCameraOff(!isCameraOff);
  };

  const handleStart = () => {
    onStartBroadcast(streamTitle, category, mediaStreamRef.current);
  };

  return (
    <div className="flex-1 bg-[#0e0e10] overflow-y-auto p-4 md:p-6 text-white space-y-6">
      {/* Studio Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] p-5 rounded-2xl border border-[#26262c]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-xl font-bold text-white">Live Broadcaster Studio</h1>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Ready to Broadcast
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Hardware-accelerated WebRTC low-latency streaming pipeline with interactive real-time token events.
          </p>
        </div>

        {/* Go Live Button */}
        <div className="flex items-center gap-3">
          {isLive ? (
            <button
              onClick={onStopBroadcast}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>End Live Stream</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl shadow-lg shadow-purple-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Go Live Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stream Video Preview & Device Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Preview Box */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-[#26262c] shadow-2xl flex items-center justify-center">
            {sourceType === 'virtual' ? (
              <canvas
                ref={virtualCanvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Live Indicator Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                  isLive
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-black/70 text-gray-300 border border-white/10'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLive ? 'bg-white' : 'bg-yellow-400'
                  }`}
                />
                {isLive ? 'BROADCASTING LIVE' : 'PREVIEW MODE'}
              </span>

              {ecoMode && (
                <span className="bg-purple-950/80 border border-purple-800/50 text-purple-300 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" />
                  Eco Mode 720p30
                </span>
              )}
            </div>

            {/* Audio Meter overlay */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center gap-3">
              <span className="text-xs text-gray-300 flex items-center gap-1 shrink-0 font-medium">
                {isMicMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                )}
                Mic Level:
              </span>
              <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden flex gap-0.5">
                {[...Array(20)].map((_, i) => {
                  const active = (audioLevel / 100) * 20 >= i;
                  const color = i > 15 ? 'bg-red-500' : i > 10 ? 'bg-yellow-400' : 'bg-emerald-400';
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded-sm transition-all duration-75 ${
                        active ? color : 'bg-gray-700/50'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-gray-400 shrink-0">
                {isMicMuted ? 'Muted' : `${audioLevel}%`}
              </span>
            </div>
          </div>

          {cameraError && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Device and Mode Selection Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Camera Source */}
            <button
              onClick={() => {
                setSourceType('camera');
                initMediaStream('camera');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                sourceType === 'camera'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md'
                  : 'bg-[#18181b] border-[#26262c] text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="text-xs font-semibold">Webcam</span>
            </button>

            {/* Screen Share Source */}
            <button
              onClick={() => {
                setSourceType('screen');
                initMediaStream('screen');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                sourceType === 'screen'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md'
                  : 'bg-[#18181b] border-[#26262c] text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-xs font-semibold">Screen Share</span>
            </button>

            {/* Virtual Synth Studio */}
            <button
              onClick={() => setSourceType('virtual')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                sourceType === 'virtual'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md'
                  : 'bg-[#18181b] border-[#26262c] text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-semibold">Virtual Studio</span>
            </button>

            {/* Mute Mic Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                isMicMuted
                  ? 'bg-red-950/60 border-red-500 text-red-300'
                  : 'bg-[#18181b] border-[#26262c] text-gray-300 hover:text-white'
              }`}
            >
              {isMicMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5" />}
              <span className="text-xs font-semibold">{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>
          </div>

          {/* Hardware Profile Options */}
          <div className="bg-[#18181b] p-4 rounded-xl border border-[#26262c] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                Stream Encoding Profile
              </span>
              <span className="text-[11px] text-purple-400 font-mono">
                {ecoMode ? '720p 30FPS (Eco Mode)' : '1080p 60FPS (Ultra)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Optimize video encoding for CPU & battery conservation:</span>
              <button
                onClick={() => setEcoMode(!ecoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  ecoMode ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ecoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Token Rewards, Stream Metadata, Channel Perks */}
        <div className="space-y-4">
          {/* Creator Token Bounty Card */}
          <div className="bg-gradient-to-br from-purple-950/70 via-[#18181b] to-black p-5 rounded-2xl border border-purple-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-yellow-400" />
                Follower Token Bounties
              </span>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-semibold">
                +25 💎 / Follower
              </span>
            </div>

            <p className="text-xs text-gray-300">
              When viewers follow your channel, tokens accumulate in your bounty pool for you to claim!
            </p>

            <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-yellow-400 font-mono">
                  {currentUser.pendingFollowerTokens} 💎
                </div>
                <div className="text-[11px] text-gray-400">Pending Claimable Tokens</div>
              </div>

              <button
                onClick={onClaimFollowerBounty}
                disabled={currentUser.pendingFollowerTokens <= 0}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-400 disabled:opacity-40 hover:from-yellow-400 hover:to-amber-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Claim Bounty
              </button>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-1">
              <button
                onClick={onFollowerSimulate}
                className="w-full text-center text-xs text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
              >
                + Test Simulate New Follower Event
              </button>
            </div>
          </div>

          {/* Stream Information Inputs */}
          <div className="bg-[#18181b] p-4 rounded-2xl border border-[#26262c] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Stream Information
            </span>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-400">Stream Title</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Just Chatting">Just Chatting</option>
                <option value="Action Gaming">Action Gaming</option>
                <option value="Retro Gaming">Retro Gaming</option>
                <option value="Software & Game Dev">Software & Game Dev</option>
                <option value="Music & Lofi">Music & Lofi</option>
              </select>
            </div>
          </div>

          {/* Channel Perks Quick Store Banner */}
          <div className="bg-[#18181b] p-4 rounded-2xl border border-[#26262c] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Channel Perks Store
              </span>
              <button
                onClick={onOpenStore}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
              >
                Open Store →
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Spend your tokens to unlock custom chat emojis, animated follower alert themes, and low-latency engines!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
