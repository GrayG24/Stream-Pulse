import React from 'react';
import { CustomEmoji } from '../types';
import { BUILT_IN_EMOJIS } from '../data/mockData';
import { Sparkles, Lock } from 'lucide-react';

interface EmojiPickerProps {
  unlockedEmojis: CustomEmoji[];
  onSelectEmoji: (emojiCode: string) => void;
  onOpenStore?: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  unlockedEmojis,
  onSelectEmoji,
  onOpenStore,
}) => {
  return (
    <div className="absolute bottom-14 right-2 w-72 bg-[#18181b] border border-[#2f2f35] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2f2f35]">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Chat Emotes
        </span>
        <span className="text-[11px] text-purple-400 font-mono">
          {BUILT_IN_EMOJIS.length + unlockedEmojis.length} Available
        </span>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {/* Channel Exclusive Emotes */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" /> Channel Perks Emotes
            </span>
            {unlockedEmojis.length === 0 && (
              <button
                onClick={onOpenStore}
                className="text-[10px] text-yellow-400 hover:underline cursor-pointer"
              >
                Unlock in Store
              </button>
            )}
          </div>

          {unlockedEmojis.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5">
              {unlockedEmojis.map((emoji) => (
                <button
                  key={emoji.id}
                  onClick={() => onSelectEmoji(`:${emoji.name}:`)}
                  title={`:${emoji.name}:`}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#1f1f23] hover:bg-purple-600/30 hover:border-purple-500 border border-transparent transition-all group cursor-pointer"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {emoji.symbol}
                  </span>
                  <span className="text-[9px] text-gray-400 truncate max-w-full mt-1 group-hover:text-purple-300">
                    {emoji.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-[#1f1f23]/60 rounded-lg p-2.5 border border-dashed border-[#3a3a44] text-center">
              <p className="text-[11px] text-gray-400">No channel perks emotes unlocked yet.</p>
              <button
                onClick={onOpenStore}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200 bg-purple-900/40 hover:bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700/50 cursor-pointer"
              >
                <Lock className="w-3 h-3" /> Unlock With Tokens
              </button>
            </div>
          )}
        </div>

        {/* Global Standard Emotes */}
        <div>
          <div className="text-[11px] font-medium text-gray-400 mb-1.5">Standard Emotes</div>
          <div className="grid grid-cols-5 gap-1.5">
            {BUILT_IN_EMOJIS.map((emoji) => (
              <button
                key={emoji.id}
                onClick={() => onSelectEmoji(`:${emoji.name}:`)}
                title={`:${emoji.name}:`}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#1f1f23] hover:bg-[#26262c] hover:scale-110 transition-all cursor-pointer"
              >
                <span className="text-xl">{emoji.symbol}</span>
                <span className="text-[8px] text-gray-400 truncate max-w-full">
                  {emoji.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
