import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StreamAlert, FloatingReaction, AlertPopupTheme } from '../types';
import { Crown, Zap, Sparkles, Heart, Flame, Gamepad2, Gift } from 'lucide-react';

interface StreamOverlayProps {
  activeAlert: StreamAlert | null;
  floatingReactions: FloatingReaction[];
  showGoalBar?: boolean;
  tokenGoal?: { current: number; target: number; title: string };
  lowLatencyMode?: boolean;
}

export const StreamOverlay: React.FC<StreamOverlayProps> = ({
  activeAlert,
  floatingReactions,
  showGoalBar = false,
  tokenGoal = { current: 0, target: 500, title: 'Stream Setup & Audio Rig Upgrade' },
  lowLatencyMode = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Top Left: Low Latency Indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
            Live
          </span>
          {lowLatencyMode && (
            <span className="text-gray-300 text-[10px] pl-1 border-l border-white/20 font-mono">
              ⚡ Ultra-Low Latency (~110ms)
            </span>
          )}
        </div>
      </div>

      {/* Top Right: Interactive Goal HUD (if unlocked) */}
      {showGoalBar && (
        <div className="absolute top-3 right-3 w-64 bg-black/75 backdrop-blur-md border border-purple-500/30 rounded-xl p-2.5 shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-purple-300 flex items-center gap-1 text-[11px] truncate">
              <Gift className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              {tokenGoal.title}
            </span>
            <span className="text-[10px] font-mono text-yellow-400 font-bold shrink-0">
              {tokenGoal.current} / {tokenGoal.target} 💎
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (tokenGoal.current / tokenGoal.target) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Center: Stream Alerts (Followers & Donations) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex justify-center">
        <AnimatePresence mode="wait">
          {activeAlert && (
            <AlertPopup key={activeAlert.id} alert={activeAlert} />
          )}
        </AnimatePresence>
      </div>

      {/* Right Side: Floating Reactions */}
      <div className="absolute inset-y-0 right-4 w-28 pointer-events-none">
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 0, y: 300, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -50, scale: [0.5, 1.3, 1.1, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              style={{ left: `${reaction.leftPercent}%` }}
              className="absolute bottom-16 text-3xl filter drop-shadow-md select-none"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface AlertPopupProps {
  alert: StreamAlert;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ alert }) => {
  const isDonation = alert.type === 'donation';
  const theme = alert.theme || 'purple-glow';

  if (theme === 'retro-8bit') {
    return (
      <motion.div
        initial={{ y: -50, scale: 0.7, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -40, scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 14 }}
        className="bg-black/90 border-4 border-emerald-400 p-4 rounded-none shadow-[0_0_25px_rgba(16,185,129,0.7)] text-center font-mono"
      >
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 tracking-widest uppercase mb-1">
          <Gamepad2 className="w-4 h-4 animate-bounce" />
          {isDonation ? '★ TOKEN CHEER ★' : '★ NEW CHALLENGER JOINED ★'}
        </div>
        <div className="text-xl font-black text-white tracking-wider">
          {alert.username}
        </div>
        {isDonation && (
          <div className="text-yellow-400 font-bold text-base mt-1">
            +{alert.amount} TOKENS DONATED!
          </div>
        )}
        {alert.message && (
          <div className="text-emerald-200 text-xs mt-1.5 italic bg-emerald-950/60 p-1.5 border border-emerald-800">
            "{alert.message}"
          </div>
        )}
      </motion.div>
    );
  }

  if (theme === 'cyberpunk-glitch') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotate: 2 }}
        className="relative bg-gradient-to-r from-cyan-950/90 via-black/95 to-fuchsia-950/90 border-2 border-cyan-400 p-4 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.8)] text-center font-mono overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse" />
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest mb-0.5">
          <Zap className="w-4 h-4 text-fuchsia-400 animate-pulse" />
          {isDonation ? 'CYBER DONATION' : 'NEW SUBSCRIBER PROTOCOL'}
        </div>
        <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300">
          {alert.username}
        </div>
        {isDonation && (
          <div className="text-fuchsia-300 font-bold text-sm mt-1">
            ⚡ {alert.amount} Tokens Uplinked
          </div>
        )}
        {alert.message && (
          <div className="text-cyan-100 text-xs mt-1 font-sans bg-black/50 px-2 py-1 rounded border border-cyan-800/60">
            {alert.message}
          </div>
        )}
      </motion.div>
    );
  }

  if (theme === 'golden-crown') {
    return (
      <motion.div
        initial={{ y: -40, scale: 0.8, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -30, scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-amber-950/95 via-stone-900/95 to-black/95 border-2 border-yellow-400 p-4 rounded-2xl shadow-[0_0_35px_rgba(251,191,36,0.6)] text-center"
      >
        <div className="w-10 h-10 mx-auto -mt-6 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200">
          <Crown className="w-6 h-6 text-black" />
        </div>
        <div className="text-xs font-bold text-yellow-300 uppercase tracking-widest mt-1">
          {isDonation ? 'Royal Token Tribute' : 'Royal Follower Crowned'}
        </div>
        <div className="text-xl font-bold text-white tracking-wide">
          {alert.username}
        </div>
        {isDonation && (
          <div className="text-yellow-400 font-extrabold text-base mt-0.5">
            💎 {alert.amount} Tokens Donated!
          </div>
        )}
        {alert.message && (
          <p className="text-amber-100 text-xs mt-1.5 italic">
            "{alert.message}"
          </p>
        )}
      </motion.div>
    );
  }

  // Default: Purple Glow (Twitch-inspired classic)
  return (
    <motion.div
      initial={{ y: -30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -20, opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="bg-[#18181b]/95 border-2 border-purple-500 px-5 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(145,70,255,0.6)] backdrop-blur-md text-center"
    >
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
        {isDonation ? (
          <>
            <Gift className="w-4 h-4 text-yellow-400 animate-bounce" />
            <span>Token Donation Alert</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>New Channel Follower!</span>
          </>
        )}
      </div>
      <div className="text-lg font-bold text-white">
        {alert.username}
      </div>
      {isDonation && (
        <div className="text-yellow-400 font-bold text-sm mt-0.5">
          Donated {alert.amount} Tokens!
        </div>
      )}
      {alert.message && (
        <p className="text-gray-200 text-xs mt-1 italic">
          "{alert.message}"
        </p>
      )}
    </motion.div>
  );
};
