import React, { useState } from 'react';
import { Sparkles, Check, Lock, X, Zap, Crown, Gamepad2, Smile, ShieldCheck, Flame, Target } from 'lucide-react';
import { ChannelPerk, UserProfile, AlertPopupTheme } from '../types';
import { AVAILABLE_PERKS } from '../data/mockData';
import { playFollowerSound } from '../utils/audioSynth';

interface PerksStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUnlockPerk: (perk: ChannelPerk) => boolean;
  onSetAlertTheme?: (theme: AlertPopupTheme) => void;
  activeAlertTheme?: AlertPopupTheme;
}

export const PerksStoreModal: React.FC<PerksStoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUnlockPerk,
  onSetAlertTheme,
  activeAlertTheme = 'purple-glow',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'all' | 'emojis' | 'alerts' | 'streaming'>('all');

  const filteredPerks = AVAILABLE_PERKS.filter((perk) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'emojis') return perk.category === 'emojis';
    if (activeTab === 'alerts') return perk.category === 'alerts';
    if (activeTab === 'streaming') return perk.category === 'streaming' || perk.category === 'badges';
    return true;
  });

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smile':
        return <Smile className="w-5 h-5 text-purple-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Target':
        return <Target className="w-5 h-5 text-red-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-purple-400" />;
    }
  };

  const handlePreviewAlert = (themeId?: AlertPopupTheme) => {
    if (themeId) {
      playFollowerSound(themeId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#18181b] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26262c]">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Channel Perks & Feature Store
            </h2>
            <p className="text-xs text-gray-300">
              Spend your earned tokens to unlock custom chat emojis, alert themes, and stream HUD upgrades.
            </p>
          </div>

          {/* Current Balance Pill */}
          <div className="bg-[#0e0e10] border border-yellow-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-xs text-gray-400">Tokens:</span>
            <span className="text-sm font-bold text-yellow-400 font-mono">
              {currentUser.tokens} 💎
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: 'All Upgrades' },
              { id: 'emojis', label: 'Custom Chat Emojis' },
              { id: 'alerts', label: 'Follower Alert Themes' },
              { id: 'streaming', label: 'Stream Engines & HUD' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1f1f23] text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Perks Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredPerks.map((perk) => {
            const isUnlocked = !!currentUser.unlockedPerks[perk.id];
            const canAfford = currentUser.tokens >= perk.costTokens;
            const isCurrentTheme = perk.themeId && activeAlertTheme === perk.themeId;

            return (
              <div
                key={perk.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-purple-950/20 border-purple-500/40'
                    : 'bg-[#1f1f23] border-[#2f2f35] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#2f2f35] shrink-0">
                    {getPerkIcon(perk.icon)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{perk.title}</h4>
                      {perk.previewEffect && (
                        <span className="text-[10px] bg-[#0e0e10] text-purple-300 px-2 py-0.5 rounded-full border border-purple-800/40 font-mono">
                          {perk.previewEffect}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 max-w-md">{perk.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {/* Sound Preview for Alerts */}
                  {perk.themeId && (
                    <button
                      onClick={() => handlePreviewAlert(perk.themeId)}
                      className="px-2.5 py-1.5 text-xs text-purple-300 hover:text-white bg-[#0e0e10] hover:bg-[#27272a] rounded-xl border border-white/10 transition-colors cursor-pointer"
                      title="Test Audio"
                    >
                      🔊 Test Sound
                    </button>
                  )}

                  {isUnlocked ? (
                    perk.themeId && onSetAlertTheme ? (
                      <button
                        onClick={() => onSetAlertTheme(perk.themeId!)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isCurrentTheme
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#27272a] text-gray-300 hover:text-white'
                        }`}
                      >
                        {isCurrentTheme ? '✓ Active Theme' : 'Apply Theme'}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
                        <Check className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => onUnlockPerk(perk)}
                      disabled={!canAfford}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock for {perk.costTokens} 💎</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#26262c] text-center text-xs text-gray-400">
          💡 Earn tokens daily or get +25 tokens each time a viewer follows your channel!
        </div>
      </div>
    </div>
  );
};
