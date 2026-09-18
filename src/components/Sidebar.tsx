import React from 'react';
import { Channel } from '../types';
import { Radio, Users, ChevronLeft, ChevronRight, Cpu, Sparkles, Heart } from 'lucide-react';

interface SidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (channel: Channel) => void;
  onViewProfile?: (channel: Channel) => void;
  followedChannelIds: string[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isUserLive: boolean;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  onViewProfile,
  followedChannelIds,
  isCollapsed,
  onToggleCollapse,
  isUserLive,
  onOpenAuth,
}) => {
  const followedChannels = channels.filter((c) => followedChannelIds.includes(c.id));
  const liveChannels = channels.filter((c) => c.isLive);
  const otherChannels = channels.filter((c) => !followedChannelIds.includes(c.id));

  return (
    <aside
      className={`bg-[#18181b] border-r border-[#26262c] flex flex-col transition-all duration-200 select-none shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="p-3 flex items-center justify-between border-b border-[#26262c]">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            Channels
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-[#27272a] text-gray-400 hover:text-white transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Channel Lists */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {/* Followed Channels Section (if any followed) */}
        {followedChannels.length > 0 && (
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Followed Channels
                </span>
                <span>{followedChannels.length}</span>
              </div>
            )}

            <div className="space-y-0.5 px-2">
              {followedChannels.map((channel) => {
                const isActive = channel.id === activeChannelId;
                return (
                  <button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    title={`${channel.displayName} - ${channel.category}`}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-gray-300 hover:bg-[#1f1f23] hover:text-white'
                    }`}
                  >
                    <div
                      className="relative shrink-0"
                      onClick={(e) => {
                        if (onViewProfile) {
                          e.stopPropagation();
                          onViewProfile(channel);
                        }
                      }}
                      title="View creator profile"
                    >
                      <img
                        src={channel.avatar}
                        alt={channel.displayName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 hover:ring-2 hover:ring-purple-400 transition-all hover:scale-105"
                      />
                      {channel.isLive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#18181b]" />
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate group-hover:text-purple-400">
                            {channel.displayName}
                          </span>
                          {channel.isLive && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                              {channel.viewers.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 truncate block">
                          {channel.category}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Channels / Channels List */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>{liveChannels.length > 0 ? 'Live Now' : 'All Channels'}</span>
              <span className="text-[10px] text-purple-400 font-mono">
                {liveChannels.length} live
              </span>
            </div>
          )}

          <div className="space-y-0.5 px-2">
            {channels.length === 0 ? (
              !isCollapsed && (
                <div className="px-3 py-6 text-center space-y-2">
                  <p className="text-xs text-gray-500">No channels yet</p>
                  <button
                    onClick={() => onOpenAuth?.('register')}
                    className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    + Create Channel
                  </button>
                </div>
              )
            ) : (
              channels.map((channel) => {
                const isActive = channel.id === activeChannelId;
                return (
                  <button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    title={`${channel.displayName} - ${channel.category}`}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-gray-300 hover:bg-[#1f1f23] hover:text-white'
                    }`}
                  >
                    <div
                      className="relative shrink-0"
                      onClick={(e) => {
                        if (onViewProfile) {
                          e.stopPropagation();
                          onViewProfile(channel);
                        }
                      }}
                      title="View creator profile"
                    >
                      <img
                        src={channel.avatar}
                        alt={channel.displayName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 hover:ring-2 hover:ring-purple-400 transition-all hover:scale-105"
                      />
                      {channel.isLive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#18181b]" />
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate group-hover:text-purple-400">
                            {channel.displayName}
                          </span>
                          {channel.isLive ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                              {channel.viewers.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">Offline</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 truncate block">
                          {channel.category}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Hardware Latency Status Badge (Bottom) */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#26262c] bg-[#141416]">
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Hardware Accelerated</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Low-latency WebRTC and adaptive VP9 encoding active.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
