import React, { useState } from 'react';
import { Gift, Sparkles, X, AlertCircle } from 'lucide-react';
import { Channel, UserProfile } from '../types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  currentUser: UserProfile;
  onDonate: (amount: number, message: string) => boolean;
  onOpenDailyModal: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  channel,
  currentUser,
  onDonate,
  onOpenDailyModal,
}) => {
  if (!isOpen) return null;

  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationMessage, setDonationMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { amount: 10, label: 'Bronze Spark', emoji: '🥉' },
    { amount: 50, label: 'Silver Gem', emoji: '🥈' },
    { amount: 100, label: 'Gold Donation', emoji: '🥇' },
    { amount: 500, label: 'Diamond Blast', emoji: '💎' },
    { amount: 1000, label: 'Hype Titan', emoji: '👑' },
  ];

  const currentAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentAmount <= 0) {
      setError('Please select or enter a valid amount of tokens.');
      return;
    }

    if (currentUser.tokens < currentAmount) {
      setError(`Insufficient tokens! You have ${currentUser.tokens} 💎 tokens.`);
      return;
    }

    const success = onDonate(currentAmount, donationMessage);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#18181b] border border-yellow-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Gift className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-xl font-black text-white">
            Donate Tokens to {channel.displayName}
          </h3>
          <p className="text-xs text-gray-300">
            Support the creator! Your donation will trigger an on-screen visual alert and highlight your message in live chat.
          </p>
        </div>

        {/* Preset Amounts */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400">Choose Preset Donation</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(preset.amount);
                  setCustomAmount('');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedAmount === preset.amount && !customAmount
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 scale-105 shadow-md shadow-yellow-900/30'
                    : 'bg-[#1f1f23] border-[#2f2f35] text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-base">{preset.emoji}</span>
                <span className="text-xs font-bold font-mono text-white">
                  {preset.amount}
                </span>
                <span className="text-[9px] text-gray-400 truncate max-w-full">
                  💎 Tokens
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Or Custom Token Amount</label>
          <input
            type="number"
            min={1}
            max={currentUser.tokens}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter custom amount..."
            className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono"
          />
        </div>

        {/* Donation Message */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Donation Message (Optional)</label>
          <input
            type="text"
            maxLength={120}
            value={donationMessage}
            onChange={(e) => setDonationMessage(e.target.value)}
            placeholder="Awesome stream! Keep it up! 💜"
            className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Wallet Balance & Submit */}
        <div className="pt-2 border-t border-[#26262c] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400">Your Balance</div>
            <div className="text-sm font-bold text-yellow-400 font-mono">
              {currentUser.tokens} 💎 Tokens
            </div>
            {currentUser.tokens < currentAmount && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDailyModal();
                }}
                className="text-[10px] text-purple-400 hover:underline cursor-pointer"
              >
                + Claim Free Daily Tokens
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={currentAmount <= 0}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Donate {currentAmount} Tokens</span>
          </button>
        </div>
      </div>
    </div>
  );
};
