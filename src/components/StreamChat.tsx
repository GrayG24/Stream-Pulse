import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CustomEmoji, UserProfile } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { BUILT_IN_EMOJIS } from '../data/mockData';
import {
  Send,
  Smile,
  Gift,
  Crown,
  Shield,
  Star,
  Diamond,
  Bot,
  Flame,
  Radio,
  Sparkles,
} from 'lucide-react';

interface StreamChatProps {
  channelId: string;
  channelName: string;
  messages: ChatMessage[];
  currentUser: UserProfile | null;
  unlockedEmojis: CustomEmoji[];
  isConnected: boolean;
  latency: number;
  onSendMessage: (text: string) => void;
  onOpenDonate: () => void;
  onOpenStore: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onSendReaction: (emoji: string) => void;
  onViewUserProfile?: (user: { id: string; name: string }) => void;
}

export const StreamChat: React.FC<StreamChatProps> = ({
  channelId,
  channelName,
  messages,
  currentUser,
  unlockedEmojis,
  isConnected,
  latency,
  onSendMessage,
  onOpenDonate,
  onOpenStore,
  onOpenAuth,
  onSendReaction,
  onViewUserProfile,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onOpenAuth?.('register');
      return;
    }
    if (!inputText.trim()) return;

    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    setShouldAutoScroll(true);
  };

  const handleSelectEmoji = (emojiCode: string) => {
    setInputText((prev) => `${prev} ${emojiCode} `);
  };

  // Helper to replace text emote codes with visual badges
  const renderMessageContent = (text: string) => {
    const allEmojis = [...BUILT_IN_EMOJIS, ...unlockedEmojis];
    const emojiMap: Record<string, string> = {};
    allEmojis.forEach((em) => {
      emojiMap[`:${em.name}:`] = em.symbol;
    });

    const parts = text.split(/(\:[a-zA-Z0-9_]+\:)/g);
    return parts.map((part, index) => {
      if (emojiMap[part]) {
        return (
          <span
            key={index}
            title={part}
            className="inline-flex items-center text-lg mx-0.5 align-middle select-none hover:scale-125 transition-transform"
          >
            {emojiMap[part]}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b] border-l border-[#26262c] text-white select-none">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-[#26262c] flex items-center justify-between bg-[#18181b]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Stream Chat
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0e0e10] border border-[#27272a] text-[10px] text-gray-300 font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>{isConnected ? `${latency}ms` : 'Connecting...'}</span>
          </div>
        </div>

        {/* User Token Pill in Chat */}
        {currentUser && (
          <button
            onClick={onOpenDonate}
            className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1 rounded-full text-xs font-bold text-yellow-300 transition-colors cursor-pointer"
            title="Cheer Tokens"
          >
            <Gift className="w-3.5 h-3.5 text-yellow-400" />
            <span>{currentUser.tokens} 💎</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs select-text font-sans scroll-smooth"
      >
        <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-900/30 text-center text-[11px] text-purple-300 mb-2">
          👋 Welcome to the live chat! Remember to be kind and follow community rules.
        </div>

        {messages.map((msg) => {
          const isDonation = msg.type === 'donation';
          const isFollow = msg.type === 'follow';

          if (isDonation) {
            return (
              <div
                key={msg.id}
                className="bg-gradient-to-r from-amber-950/80 via-yellow-950/40 to-black/80 border border-yellow-500/50 rounded-xl p-2.5 shadow-md shadow-yellow-950/30 space-y-1 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => onViewUserProfile?.(msg.user)}
                    className="flex items-center gap-1 font-bold text-yellow-300 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{msg.user.name}</span>
                  </button>
                  <span className="font-extrabold text-yellow-400 bg-black/50 px-2 py-0.5 rounded-full border border-yellow-500/30 font-mono">
                    +{msg.donationAmount} 💎 DONATION
                  </span>
                </div>
                {msg.message && (
                  <p className="text-gray-100 text-xs font-medium pl-1">
                    {renderMessageContent(msg.message)}
                  </p>
                )}
              </div>
            );
          }

          if (isFollow) {
            return (
              <div
                key={msg.id}
                className="bg-purple-950/40 border border-purple-800/40 rounded-lg p-2 text-center text-purple-200 text-[11px]"
              >
                {msg.message}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="leading-relaxed hover:bg-[#1f1f23]/60 -mx-1 px-1.5 py-0.5 rounded transition-colors group"
            >
              {/* Badges */}
              <span className="inline-flex items-center gap-1 mr-1.5 align-middle">
                {msg.user.badges.map((badge) => (
                  <span
                    key={badge.id}
                    title={badge.name}
                    className="p-0.5 rounded bg-[#27272a] inline-flex items-center justify-center text-white"
                  >
                    {badge.iconType === 'crown' || badge.iconType === 'streamer' ? (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    ) : badge.iconType === 'shield' ? (
                      <Shield className="w-3 h-3 text-emerald-400" />
                    ) : badge.iconType === 'star' ? (
                      <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
                    ) : badge.iconType === 'diamond' ? (
                      <Diamond className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Bot className="w-3 h-3 text-gray-400" />
                    )}
                  </span>
                ))}
              </span>

              {/* Username */}
              <button
                type="button"
                onClick={() => onViewUserProfile?.(msg.user)}
                className="font-bold mr-1.5 hover:underline cursor-pointer inline text-left"
                style={{ color: msg.user.color || '#a855f7' }}
              >
                {msg.user.name}:
              </button>

              {/* Message Content with Emotes */}
              <span className="text-gray-200 break-words">
                {renderMessageContent(msg.message)}
              </span>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Reaction Bar */}
      <div className="px-3 py-1.5 bg-[#141416] border-t border-[#26262c] flex items-center justify-between">
        <span className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-500" /> Quick Reactions
        </span>
        <div className="flex items-center gap-1">
          {(['🔥', '💎', '💜', '🎉'] as const).map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth?.('register');
                  return;
                }
                onSendReaction(emoji);
              }}
              className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer select-none"
              title={currentUser ? `React with ${emoji}` : 'Sign in to react'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Box */}
      <div className="p-3 border-t border-[#26262c] bg-[#18181b] relative">
        {!currentUser ? (
          <div className="bg-[#0e0e10] rounded-xl border border-[#2f2f35] p-3 text-center space-y-2">
            <p className="text-xs text-gray-400">Sign in or create your account to chat and donate tokens.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('register')}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {showEmojiPicker && (
              <EmojiPicker
                unlockedEmojis={unlockedEmojis}
                onSelectEmoji={handleSelectEmoji}
                onOpenStore={() => {
                  setShowEmojiPicker(false);
                  onOpenStore();
                }}
              />
            )}

            <form onSubmit={handleSend} className="space-y-2">
              <div className="relative flex items-center bg-[#0e0e10] rounded-xl border border-[#2f2f35] focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Send a message..."
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none pr-20"
                />

                {/* Emote & Cheer Shortcuts */}
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      showEmojiPicker
                        ? 'text-purple-400 bg-purple-950/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Emotes"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenDonate}
                    className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Donate Tokens"
                  >
                    <Gift className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-1.5 bg-purple-600 disabled:opacity-40 hover:bg-purple-500 text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
                    title="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
                <span>Press Enter to chat</span>
                <button
                  type="button"
                  onClick={onOpenStore}
                  className="text-purple-400 hover:underline cursor-pointer"
                >
                  Get Custom Emotes
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
