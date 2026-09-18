import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Check,
  Lock,
  Zap,
  Crown,
  Gamepad2,
  Smile,
  ShieldCheck,
  Flame,
  Target,
  Volume2,
  Gift,
  Heart,
  Radio,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import { ChannelPerk, UserProfile, AlertPopupTheme } from '../types';
import { AVAILABLE_PERKS } from '../data/mockData';
import { playFollowerSound } from '../utils/audioSynth';

interface ShopViewProps {
  currentUser: UserProfile | null;
  onUnlockPerk: (perk: ChannelPerk) => boolean;
  onSetAlertTheme?: (theme: AlertPopupTheme) => void;
  activeAlertTheme?: AlertPopupTheme;
  onOpenDailyModal: () => void;
  canClaimDaily: boolean;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onBrowseStreams: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  currentUser,
  onUnlockPerk,
  onSetAlertTheme,
  activeAlertTheme = 'purple-glow',
  onOpenDailyModal,
  canClaimDaily,
  onOpenAuth,
  onBrowseStreams,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'emojis' | 'alerts' | 'streaming'>('all');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

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
        return <Smile className="w-6 h-6 text-purple-400" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-pink-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-cyan-400" />;
      case 'Crown':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-amber-500" />;
      case 'Target':
        return <Target className="w-6 h-6 text-red-400" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-purple-400" />;
    }
  };

  const handlePreviewAlert = (themeId?: AlertPopupTheme) => {
    if (themeId) {
      playFollowerSound(themeId);
    }
  };

  const handleBuy = (perk: ChannelPerk) => {
    if (!currentUser) {
      onOpenAuth('register');
      return;
    }
    const success = onUnlockPerk(perk);
    if (success) {
      setPurchaseSuccess(perk.title);
      setTimeout(() => setPurchaseSuccess(null), 3500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e0e10] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Banner / Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/80 via-indigo-950/50 to-black border border-purple-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wide uppercase">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>StreamPulse Perks & Emote Shop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Power Up Your Channel & Chat
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Use tokens earned from daily logins and stream engagement to unlock exclusive animated emotes, chiptune sound effects, neon alert themes, and stream goals.
            </p>
          </div>

          {/* User Balance Card or Guest Card */}
          <div className="bg-[#18181b]/90 border border-[#2f2f35] rounded-2xl p-4.5 sm:p-5 flex flex-col gap-3 min-w-[240px] shadow-xl backdrop-blur-md">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Your Token Balance</span>
                  <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/30">
                    Active
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono flex items-center gap-2">
                  <span>{currentUser.tokens.toLocaleString()}</span>
                  <span className="text-lg">💎</span>
                </div>
                <div className="pt-2 border-t border-[#26262c] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={onOpenDailyModal}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      canClaimDaily
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-md shadow-yellow-500/20 animate-pulse'
                        : 'bg-[#27272a] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{canClaimDaily ? 'Claim Daily Reward!' : 'Daily Streak'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-xs text-gray-300 font-medium">
                  Create your account to start earning tokens and unlocking perks!
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Create Account (+50 💎)
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="w-full py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {purchaseSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-full bg-emerald-500 text-black">
              <Check className="w-4 h-4 font-black" />
            </div>
            <span className="text-xs sm:text-sm font-semibold">
              Unlocked <strong>{purchaseSuccess}</strong>! You can now use it in your channel and chat.
            </span>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#26262c] pb-3">
        {(
          [
            { id: 'all', label: 'All Items' },
            { id: 'emojis', label: 'Chat Emote Packs' },
            { id: 'alerts', label: 'Stream Alert Themes' },
            { id: 'streaming', label: 'Broadcaster Perks & VIP' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#18181b] text-gray-400 hover:text-white hover:bg-[#27272a] border border-[#26262c]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPerks.map((perk) => {
          const isUnlocked = Boolean(currentUser?.unlockedPerks?.[perk.id]);
          const isAffordable = (currentUser?.tokens || 0) >= perk.costTokens;
          const isAlert = perk.category === 'alerts';
          const isCurrentActiveAlert = isAlert && activeAlertTheme === perk.themeId;

          return (
            <div
              key={perk.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                isUnlocked
                  ? 'bg-purple-950/20 border-purple-700/50 shadow-md shadow-purple-950/20'
                  : 'bg-[#18181b] border-[#2f2f35] hover:border-gray-600'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Icon + Category Badge */}
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[#0e0e10] border border-[#2f2f35] rounded-xl flex items-center justify-center">
                    {getPerkIcon(perk.icon)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-700/40 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-yellow-400 bg-black/60 border border-yellow-500/30 px-2.5 py-0.5 rounded-full">
                        {perk.costTokens} 💎
                      </span>
                    )}
                  </div>
                </div>

                {/* Perk Information */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{perk.title}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{perk.description}</p>
                </div>

                {/* Special Tag or Effect */}
                {perk.previewEffect && (
                  <div className="text-[11px] text-purple-300 font-mono bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-800/30 inline-block">
                    ★ {perk.previewEffect}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-[#26262c] flex items-center justify-between gap-2">
                {isAlert ? (
                  <button
                    type="button"
                    onClick={() => handlePreviewAlert(perk.themeId)}
                    className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Play sound preview"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview Sound</span>
                  </button>
                ) : (
                  <div />
                )}

                {isUnlocked ? (
                  isAlert && onSetAlertTheme && perk.themeId ? (
                    <button
                      type="button"
                      onClick={() => onSetAlertTheme(perk.themeId!)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isCurrentActiveAlert
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 hover:text-white border border-[#3f3f46]'
                      }`}
                    >
                      {isCurrentActiveAlert ? '✓ Active Theme' : 'Apply Theme'}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Inventory
                    </span>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBuy(perk)}
                    disabled={currentUser ? !isAffordable : false}
                    className={`px-4 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      !currentUser
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                        : isAffordable
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95'
                        : 'bg-[#27272a] text-gray-500 border border-[#3f3f46] cursor-not-allowed'
                    }`}
                  >
                    {!currentUser ? (
                      <>
                        <Sparkle className="w-3.5 h-3.5" />
                        <span>Sign In to Unlock</span>
                      </>
                    ) : isAffordable ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock ({perk.costTokens} 💎)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Need {perk.costTokens - (currentUser?.tokens || 0)} More 💎</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Earn More Tokens Guide */}
      <div className="bg-[#18181b] border border-[#26262c] rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>How to Earn More Stream Tokens</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0e0e10] p-4 rounded-2xl border border-[#26262c] space-y-1.5">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" /> Daily Check-In
            </div>
            <p className="text-xs text-gray-300">
              Claim up to +200 💎 tokens by maintaining a daily login streak every 24 hours.
            </p>
          </div>

          <div className="bg-[#0e0e10] p-4 rounded-2xl border border-[#26262c] space-y-1.5">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> Follow Creators
            </div>
            <p className="text-xs text-gray-300">
              Earn +25 💎 instant bonus tokens every time you discover and follow a live channel broadcaster.
            </p>
          </div>

          <div className="bg-[#0e0e10] p-4 rounded-2xl border border-[#26262c] space-y-1.5">
            <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> Go Live in Studio
            </div>
            <p className="text-xs text-gray-300">
              Broadcast your camera or interactive audio to receive real-time token donations from viewers.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onBrowseStreams}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Back to Live Streams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
