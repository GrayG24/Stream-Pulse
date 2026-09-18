import React, { useRef, useState, useEffect } from 'react';
import { Channel, StreamAlert, FloatingReaction } from '../types';
import { StreamOverlay } from './StreamOverlay';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Heart,
  Gift,
  Settings,
  Users,
  ShieldCheck,
  Flame,
  Sparkles,
  Video,
  Radio,
  User,
} from 'lucide-react';

interface StreamPlayerProps {
  channel: Channel | null;
  isFollowing: boolean;
  isOwner: boolean;
  onToggleFollow: () => void;
  onOpenDonate: () => void;
  onOpenStudio?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onViewProfile?: (channel: Channel) => void;
  activeAlert: StreamAlert | null;
  floatingReactions: FloatingReaction[];
  onSendReaction: (emoji: string) => void;
  streamMediaStream?: MediaStream | null;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  channel,
  isFollowing,
  isOwner,
  onToggleFollow,
  onOpenDonate,
  onOpenStudio,
  onOpenAuth,
  onViewProfile,
  activeAlert,
  floatingReactions,
  onSendReaction,
  streamMediaStream,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resolution, setResolution] = useState<'1080p60' | '720p60' | '480p' | '360p'>('720p60');
  const [showSettings, setShowSettings] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Uptime counter active when channel is live
  useEffect(() => {
    if (!channel || !channel.isLive) {
      setUptimeSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [channel?.isLive]);

  const formatUptime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Attach local media stream if owner is broadcasting
  useEffect(() => {
    if (isOwner && videoRef.current && streamMediaStream) {
      videoRef.current.srcObject = streamMediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isOwner, streamMediaStream]);

  // Dynamic canvas visualizer for live streams without direct media stream
  useEffect(() => {
    if (!channel || !channel.isLive) return;
    if (isOwner && streamMediaStream) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      if (!isPlaying) {
        animId = requestAnimationFrame(render);
        return;
      }
      t += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // Dark futuristic streaming background
      ctx.fillStyle = '#08080c';
      ctx.fillRect(0, 0, width, height);

      const catLower = (channel.category || '').toLowerCase();
      if (catLower.includes('retro')) {
        drawRetroSpeedrunScene(ctx, width, height, t);
      } else if (catLower.includes('software') || catLower.includes('dev')) {
        drawCodeMatrixScene(ctx, width, height, t);
      } else if (catLower.includes('music') || catLower.includes('lofi')) {
        drawSynthwaveScene(ctx, width, height, t);
      } else {
        drawArcadeEsportScene(ctx, width, height, t);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [channel?.id, channel?.category, channel?.isLive, isOwner, isPlaying, streamMediaStream]);

  // If no channel exists, show a welcoming onboarding slate
  if (!channel) {
    return (
      <div className="flex flex-col w-full h-full bg-[#0e0e10] text-white">
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden select-none border-b border-[#26262c]">
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#18181b] via-[#0e0e10] to-black p-6 text-center select-none relative overflow-hidden">
            <div className="absolute w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center max-w-lg space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-600/30">
                <Radio className="w-8 h-8 text-white animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-800/40">
                  Interactive Live Streaming
                </span>
                <h2 className="text-2xl font-black text-white">Welcome to StreamPulse</h2>
                <p className="text-xs text-gray-400 max-w-md">
                  No channels are live right now. Create your own account to launch a live stream, chat in real time, and claim daily tokens!
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenAuth?.('register')}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Your Account</span>
                </button>
                <button
                  onClick={() => onOpenAuth?.('login')}
                  className="px-5 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 text-xs font-semibold rounded-xl border border-[#3f3f46] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#18181b] border-b border-[#26262c] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">Start Your Broadcasting Journey</h3>
            <p className="text-xs text-gray-400">Zero latency, built-in animated emotes, real-time audio alerts, and token rewards.</p>
          </div>
          <button
            onClick={() => onOpenAuth?.('register')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl text-white shadow-md shadow-purple-600/30 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const hasStreamGoalUnlocked = channel.unlockedPerkIds.includes('perk_stream_goal');

  return (
    <div className="flex flex-col w-full h-full bg-[#0e0e10] text-white">
      {/* Video / Stream Stage Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group select-none shadow-2xl border-b border-[#26262c]"
      >
        {!channel.isLive ? (
          /* Offline Channel Slate */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#18181b] via-[#0e0e10] to-black p-6 text-center select-none relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-md space-y-4">
              <div className="relative">
                <img
                  src={channel.avatar}
                  alt={channel.displayName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#27272a] shadow-2xl"
                />
                <span className="absolute bottom-0 right-0 bg-[#3f3f46] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#18181b]">
                  OFFLINE
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">{channel.displayName} is Offline</h3>
                <p className="text-xs text-gray-400">
                  {channel.bio || 'This broadcaster is not currently live. Follow the channel or check back soon!'}
                </p>
              </div>

              {isOwner ? (
                <button
                  onClick={onOpenStudio}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Open Studio & Go Live</span>
                </button>
              ) : (
                <button
                  onClick={onToggleFollow}
                  className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    isFollowing
                      ? 'bg-[#27272a] text-gray-300 hover:text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isFollowing ? 'Following Channel' : 'Follow to get notified (+25 💎)'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Live Stream Container */
          <>
            {/* If local broadcaster stream is active */}
            {isOwner && streamMediaStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted || isOwner}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />
            )}

            {/* Stream Overlay HUD (Alerts, Reactions, Goal) */}
            <StreamOverlay
              activeAlert={activeAlert}
              floatingReactions={floatingReactions}
              showGoalBar={hasStreamGoalUnlocked}
              tokenGoal={{ current: 625, target: 1000, title: 'Follower Milestone Goal' }}
              lowLatencyMode={channel.lowLatencyMode}
            />

            {/* Floating Quick Reaction Buttons in Corner */}
            <div className="absolute bottom-16 right-4 flex flex-col gap-2 z-30 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {(['🔥', '💎', '💜', '🎉'] as const).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSendReaction(emoji)}
                  className="w-9 h-9 rounded-full bg-black/70 hover:bg-purple-600/80 border border-white/20 flex items-center justify-center text-lg hover:scale-125 transition-all shadow-lg cursor-pointer"
                  title={`Send ${emoji} reaction`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Player Controls Bar (Bottom) */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 hover:text-purple-400 text-white transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause Stream' : 'Play Stream'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 hover:text-purple-400 text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1 accent-purple-500 bg-gray-600 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Live Indicator & Uptime */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/20 text-xs text-gray-300 font-mono">
                  <span className="flex items-center gap-1 text-red-400 font-bold tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    LIVE
                  </span>
                  <span>{formatUptime(uptimeSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Resolution Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-black/60 hover:bg-white/20 rounded border border-white/15 text-gray-200 cursor-pointer"
                    title="Stream Settings"
                  >
                    <Settings className="w-3.5 h-3.5 text-purple-400" />
                    <span>{resolution}</span>
                  </button>

                  {showSettings && (
                    <div className="absolute bottom-9 right-0 bg-[#18181b] border border-[#3f3f46] rounded-lg shadow-xl p-2 w-32 space-y-1 text-xs">
                      <div className="text-[10px] uppercase font-semibold text-gray-400 px-2 py-0.5">
                        Quality
                      </div>
                      {(['1080p60', '720p60', '480p', '360p'] as const).map((res) => (
                        <button
                          key={res}
                          onClick={() => {
                            setResolution(res);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded transition-colors ${
                            resolution === res
                              ? 'bg-purple-600 text-white font-bold'
                              : 'text-gray-300 hover:bg-[#27272a]'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-purple-400 text-white transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Channel Information & Actions Bar */}
      <div className="p-4 bg-[#18181b] border-b border-[#26262c]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Streamer Avatar & Metadata */}
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => onViewProfile?.(channel)}
              className="relative group cursor-pointer text-left"
              title={`View ${channel.displayName}'s Profile`}
            >
              <img
                src={channel.avatar}
                alt={channel.displayName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500 p-0.5 bg-[#0e0e10] group-hover:ring-purple-400 group-hover:scale-105 transition-all"
              />
              <span
                className={`absolute bottom-0 right-0 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${
                  channel.isLive ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-200'
                }`}
              >
                {channel.isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewProfile?.(channel)}
                  className="text-base font-bold text-white flex items-center gap-1.5 hover:text-purple-300 transition-colors cursor-pointer text-left"
                  title={`View ${channel.displayName}'s Profile`}
                >
                  <span>{channel.displayName}</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                </button>
                <span className="text-xs text-purple-400 font-medium bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                  {channel.category}
                </span>
              </div>
              <h2 className="text-sm text-gray-200 font-medium line-clamp-1 max-w-xl">
                {channel.title}
              </h2>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {channel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-[#27272a] text-gray-300 hover:text-white px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons: Follow, Donate & View Profile */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {/* View Profile Button */}
            <button
              type="button"
              onClick={() => onViewProfile?.(channel)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 hover:text-white border border-[#3f3f46] transition-colors cursor-pointer"
              title="View Creator Profile"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Profile</span>
            </button>

            {/* Follow Button */}
            {!isOwner && (
              <button
                onClick={onToggleFollow}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-[#27272a] hover:bg-red-500/20 text-gray-200 hover:text-red-400 border border-[#3f3f46]'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFollowing ? 'Following' : 'Follow (+25 💎)'}</span>
              </button>
            )}

            {/* Donate Tokens Button */}
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-yellow-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Gift className="w-4 h-4 text-black" />
              <span>Donate Tokens</span>
            </button>

            {/* Viewers Pill */}
            <div className="flex items-center gap-1.5 bg-[#0e0e10] border border-[#27272a] px-3 py-2 rounded-xl text-xs text-red-400 font-bold font-mono">
              <Users className="w-3.5 h-3.5" />
              <span>{channel.isLive ? channel.viewers.toLocaleString() : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Streamer Bio & Channel Perks Highlights */}
        <div className="mt-4 pt-3 border-t border-[#26262c] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-400">
          <p className="line-clamp-2 max-w-2xl">{channel.bio}</p>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/30">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Alert Theme:{' '}
              <strong className="capitalize text-white">
                {channel.activeAlertTheme.replace('-', ' ')}
              </strong>
            </span>
            <span className="flex items-center gap-1 text-yellow-300 bg-yellow-950/30 px-2 py-1 rounded border border-yellow-800/30">
              <Flame className="w-3 h-3 text-yellow-400" />
              {channel.followers.toLocaleString()} Followers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Canvas Generators for stream scenes
function drawRetroSpeedrunScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.75);
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.75);

  const charX = w * 0.2 + ((Math.sin(t) + 1) * 0.5) * (w * 0.6);
  const charY = h * 0.45 + Math.sin(t * 3) * 30;

  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(charX - 16, charY - 16, 32, 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('SPEEDRUN WORLD RECORD ATTEMPT', w * 0.15, h * 0.18);
  ctx.fillStyle = '#00F0FF';
  ctx.font = '16px monospace';
  ctx.fillText(`SPLIT: +0.02s [PACING EXCELLENT]`, w * 0.15, h * 0.23);
}

function drawCodeMatrixScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
  ctx.strokeStyle = '#30363d';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);

  // Top window tabs
  ctx.fillStyle = '#161b22';
  ctx.fillRect(w * 0.08, h * 0.08, w * 0.84, 32);
  ctx.fillStyle = '#ff5f56';
  ctx.beginPath();
  ctx.arc(w * 0.1 + 10, h * 0.08 + 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath();
  ctx.arc(w * 0.1 + 26, h * 0.08 + 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27c93f';
  ctx.beginPath();
  ctx.arc(w * 0.1 + 42, h * 0.08 + 16, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '14px monospace';
  ctx.fillStyle = '#8b949e';
  ctx.fillText('engine.rs - Live WebRTC Streaming Architecture', w * 0.1 + 65, h * 0.08 + 20);

  // Code lines
  const lines = [
    'async fn stream_ingest_pipeline(rx: MediaStream) -> Result<BroadcastHandle> {',
    '    let encoder = HardwareVideoEncoder::new(EncodingPreset::UltraLowLatency)?;',
    '    let mut stream_muxer = H264RtpPacker::new(packet_clock_rate: 90000);',
    '    println!("Broadcasting WebRTC data at sub-150ms glass-to-glass latency...");',
    '    loop {',
    '        match rx.recv().await {',
    '            Some(frame) => encoder.compress_and_dispatch(&frame, &stream_muxer).await?,',
    '            None => break,',
    '        }',
    '    }',
    '    Ok(BroadcastHandle::Active)',
    '}',
  ];

  ctx.fillStyle = '#58a6ff';
  lines.forEach((line, i) => {
    const y = h * 0.18 + i * 26;
    if (y < h * 0.85) {
      if (line.includes('async fn') || line.includes('let mut')) ctx.fillStyle = '#ff7b72';
      else if (line.includes('println!') || line.includes('match')) ctx.fillStyle = '#d2a8ff';
      else if (line.includes('BroadcastHandle')) ctx.fillStyle = '#79c0ff';
      else ctx.fillStyle = '#c9d1d9';
      ctx.fillText(line, w * 0.12, y);
    }
  });

  const cursorBlink = Math.sin(t * 5) > 0;
  if (cursorBlink) {
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(w * 0.12 + 250, h * 0.18 + lines.length * 26 - 15, 10, 18);
  }
}

function drawSynthwaveScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0f051d');
  grad.addColorStop(0.5, '#3b0764');
  grad.addColorStop(0.7, '#831843');
  grad.addColorStop(1, '#05010a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Synthwave Sun
  const sunX = w * 0.5;
  const sunY = h * 0.45;
  const sunR = h * 0.22;
  const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sunGrad.addColorStop(0, '#fde047');
  sunGrad.addColorStop(0.5, '#f43f5e');
  sunGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Sun horizontal blinds
  ctx.fillStyle = '#0f051d';
  for (let i = 0; i < 7; i++) {
    const blindY = sunY + i * 11;
    ctx.fillRect(sunX - sunR, blindY, sunR * 2, 3 + i * 0.8);
  }

  // Perspective 3D Grid
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.5;
  const horizon = h * 0.6;
  for (let x = -w; x < w * 2; x += 80) {
    ctx.beginPath();
    ctx.moveTo(w / 2, horizon);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  const offset = (t * 40) % 30;
  for (let y = horizon; y < h; y += 30) {
    const curY = y + offset;
    if (curY < h) {
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(w, curY);
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LO-FI CHILL BEATS & LIVE SYNTHWAVE', w / 2, h * 0.2);
}

function drawArcadeEsportScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2);
  grad.addColorStop(0, '#181829');
  grad.addColorStop(1, '#08080f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Geometric pulses
  for (let i = 0; i < 3; i++) {
    const r = ((t * 80 + i * 120) % (w * 0.4)) + 50;
    ctx.strokeStyle = `rgba(147, 51, 234, ${Math.max(0, 1 - r / (w * 0.4))})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIVE INTERACTIVE STREAM', w / 2, h / 2 - 20);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#22c55e';
  ctx.fillText('● LOW-LATENCY REAL-TIME STREAM ACTIVE', w / 2, h / 2 + 20);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '13px sans-serif';
  ctx.fillText('Engage with chat, donate tokens, and claim token bounties!', w / 2, h / 2 + 50);
}
