import React, { useState } from 'react';
import {
  X,
  Heart,
  Gift,
  Share2,
  Users,
  Radio,
  Sparkles,
  Flame,
  Check,
  ShieldCheck,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { Channel, UserProfile } from '../types';

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Channel | UserProfile | null;
  currentUserId: string | null;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onOpenDonate: () => void;
  onWatchStream?: () => void;
  onEditProfile?: () => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  isOpen,
  onClose,
  creator,
  currentUserId,
  isFollowing,
  onToggleFollow,
  onOpenDonate,
  onWatchStream,
  onEditProfile,
}) => {
  if (!isOpen || !creator) return null;

  const [copied, setCopied] = useState(false);

  // Normalize channel vs user profile
  const isChannel = 'tags' in creator;
  const channel = isChannel ? (creator as Channel) : null;
  const displayName = creator.displayName;
  const username = isChannel ? channel!.name : (creator as UserProfile).username;
  const avatar = creator.avatar;
  const bio = isChannel ? channel!.bio : (creator as UserProfile).bio || 'StreamPulse creator and community member.';
  const isLive = isChannel ? channel!.isLive : false;
  const isSelf = currentUserId === creator.id;
  const followersCount = isChannel
    ? channel!.followers
    : (creator as UserProfile).claimedFollowerCount || 0;

  const handleShare = () => {
    const url = `${window.location.origin}/#${username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#18181b] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner Graphic Header */}
        <div className="h-32 w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 relative overflow-hidden shrink-0">
          {channel?.bannerUrl ? (
            <img
              src={channel.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]" />
          )}

          {/* Status Badge in Banner */}
          <div className="absolute top-3 left-4 flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-red-600/90 text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Live Now
              </span>
            ) : (
              <span className="bg-[#18181b]/80 border border-white/10 text-gray-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 pt-0 space-y-5 overflow-y-auto">
          {/* Avatar & Key Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 relative z-10">
            <div className="flex items-end gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt={displayName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80';
                  }}
                  className={`w-24 h-24 rounded-2xl object-cover ring-4 ${
                    isLive ? 'ring-red-500' : 'ring-[#18181b]'
                  } shadow-2xl bg-[#0e0e10]`}
                />
                {isLive && (
                  <div className="absolute -bottom-2 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                    Live
                  </div>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-black text-white truncate">{displayName}</h2>
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                </div>
                <p className="text-xs text-gray-400 font-mono">@{username}</p>
                {channel?.category && (
                  <span className="inline-block mt-1 text-[11px] text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full font-medium">
                    {channel.category}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isSelf ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditProfile?.();
                  }}
                  className="px-3.5 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onToggleFollow}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                      isFollowing
                        ? 'bg-[#27272a] hover:bg-red-500/20 text-gray-200 hover:text-red-400 border border-[#3f3f46]'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 hover:scale-105'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{isFollowing ? 'Following' : 'Follow (+25 💎)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDonate();
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-bold rounded-xl shadow-md shadow-yellow-500/20 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Donate</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="p-2 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Share Profile"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {copied && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Creator profile link copied to clipboard!</span>
            </div>
          )}

          {/* Watch Stream CTA if live */}
          {isLive && onWatchStream && (
            <div className="bg-gradient-to-r from-purple-950/80 to-[#18181b] border border-purple-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Now Streaming Live</span>
                </div>
                <p className="text-xs text-white font-medium line-clamp-1">{channel?.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span>{channel?.viewers.toLocaleString()} watching now</span>
                  <span>•</span>
                  <span>{channel?.category}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onWatchStream();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/40 flex items-center gap-1.5 shrink-0 hover:scale-105 transition-all cursor-pointer"
              >
                <span>Watch Stream</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#0e0e10] border border-[#26262c] p-3 rounded-2xl text-center">
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-purple-400" />
                <span>Followers</span>
              </div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {followersCount.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#0e0e10] border border-[#26262c] p-3 rounded-2xl text-center">
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Alert Theme</span>
              </div>
              <div className="text-xs font-bold text-pink-300 capitalize truncate mt-1">
                {channel?.activeAlertTheme.replace('-', ' ') || 'Purple Glow'}
              </div>
            </div>

            <div className="bg-[#0e0e10] border border-[#26262c] p-3 rounded-2xl text-center">
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Status</span>
              </div>
              <div className="text-xs font-bold text-amber-300 mt-1">
                {isLive ? 'Broadcasting' : 'Available'}
              </div>
            </div>
          </div>

          {/* About & Bio */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Creator</h3>
            <div className="bg-[#0e0e10] border border-[#26262c] p-3.5 rounded-2xl text-xs text-gray-200 leading-relaxed">
              {bio}
            </div>
          </div>

          {/* Channel Tags */}
          {channel?.tags && channel.tags.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stream Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {channel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-[#27272a] text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Channel Custom Emotes */}
          {channel?.customEmojis && channel.customEmojis.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channel Emotes</h3>
              <div className="flex items-center gap-2 p-2 bg-[#0e0e10] rounded-xl border border-[#26262c] overflow-x-auto">
                {channel.customEmojis.map((emoji) => (
                  <div
                    key={emoji.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#18181b] rounded-lg text-xs"
                    title={emoji.name}
                  >
                    <span className="text-base">{emoji.symbol}</span>
                    <span className="text-gray-300 font-mono text-[10px]">:{emoji.name}:</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
