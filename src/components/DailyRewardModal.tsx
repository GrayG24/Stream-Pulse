import React from 'react';
import { Gift, Calendar, Sparkles, Check, Clock, RotateCcw, X } from 'lucide-react';
import { UserProfile } from '../types';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  canClaim: boolean;
  rewardAmount: number;
  onClaim: () => void;
  onResetTimer: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  canClaim,
  rewardAmount,
  onClaim,
  onResetTimer,
}) => {
  if (!isOpen) return null;

  // If can claim today, the target day is (dailyStreak % 7) + 1
  // If already claimed today, the completed days count is (dailyStreak % 7)
  const completedDays = canClaim ? currentUser.dailyStreak % 7 : (currentUser.dailyStreak % 7) || (currentUser.dailyStreak > 0 ? 7 : 0);
  const activeDay = canClaim ? (currentUser.dailyStreak % 7) + 1 : completedDays;

  const days = [
    { day: 1, tokens: 100, label: 'Day 1' },
    { day: 2, tokens: 125, label: 'Day 2' },
    { day: 3, tokens: 150, label: 'Day 3' },
    { day: 4, tokens: 175, label: 'Day 4' },
    { day: 5, tokens: 200, label: 'Day 5' },
    { day: 6, tokens: 225, label: 'Day 6' },
    { day: 7, tokens: 300, label: 'Day 7 (MEGA)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#18181b] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-purple-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Daily Login Rewards
          </h2>
          <p className="text-xs text-gray-300 max-w-sm mx-auto">
            Log in daily to claim free stream tokens. Use your tokens to donate to streamers or unlock custom channel emojis and alerts!
          </p>
        </div>

        {/* Streak Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
          {days.map((item) => {
            const isCompleted = item.day <= completedDays && (!canClaim || item.day < activeDay);
            const isToday = canClaim && item.day === activeDay;

            return (
              <div
                key={item.day}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isToday
                    ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/50 scale-105 shadow-md shadow-purple-900/50'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                    : 'bg-[#1f1f23] border-[#2f2f35] text-gray-400 opacity-80'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase">{item.label}</span>
                <span className="text-xl my-1 select-none">
                  {isCompleted ? '✅' : item.day === 7 ? '🎁' : '💎'}
                </span>
                <span className="text-xs font-bold font-mono text-yellow-400">
                  +{item.tokens}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Balance & Action */}
        <div className="bg-[#0e0e10] p-4 rounded-2xl border border-[#2f2f35] flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Current Token Balance</div>
            <div className="text-xl font-black text-yellow-400 font-mono flex items-center gap-1.5">
              <span>{currentUser.tokens} 💎</span>
            </div>
          </div>

          <div>
            {canClaim ? (
              <button
                onClick={() => {
                  onClaim();
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 font-bold text-sm text-white rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim +{rewardAmount} Tokens</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-800">
                <Check className="w-4 h-4" />
                <span>Claimed Today!</span>
              </div>
            )}
          </div>
        </div>

        {/* Reset Timer for testing */}
        {!canClaim && (
          <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              Next daily reward in 24 hours
            </span>
            <button
              onClick={onResetTimer}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Daily Timer (Demo)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
