import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import { Channel, ChatMessage, StreamAlert, FloatingReaction, AlertPopupTheme, ChannelPerk, CustomEmoji, UserProfile } from './types';
import { createDefaultChannel } from './data/mockData';
import { useTokenEconomy } from './hooks/useTokenEconomy';
import { useWebSocket } from './hooks/useWebSocket';
import { playDonationSound, playFollowerSound } from './utils/audioSynth';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StreamPlayer } from './components/StreamPlayer';
import { StreamChat } from './components/StreamChat';
import { BroadcasterStudio } from './components/BroadcasterStudio';
import { DailyRewardModal } from './components/DailyRewardModal';
import { DonateModal } from './components/DonateModal';
import { PerksStoreModal } from './components/PerksStoreModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { CreatorProfileModal } from './components/CreatorProfileModal';
import { ShopView } from './components/ShopView';

export default function App() {
  const {
    accounts,
    user,
    activeUserId,
    registerAccount,
    loginAccount,
    logout,
    updateProfile,
    canClaimDaily,
    getDailyRewardAmount,
    claimDailyReward,
    resetDailyClaimTimer,
    claimFollowerBounty,
    donateTokens,
    unlockPerk,
    toggleFollowChannel,
    addFollowerToYou,
  } = useTokenEconomy();

  // Channel overrides map for live state, custom themes, followers, etc.
  const [channelOverrides, setChannelOverrides] = useState<
    Record<
      string,
      {
        isLive?: boolean;
        title?: string;
        category?: string;
        viewers?: number;
        followersDelta?: number;
        activeAlertTheme?: AlertPopupTheme;
      }
    >
  >({});

  // Dynamic channels built from registered accounts
  const channels: Channel[] = useMemo(() => {
    return accounts.map((acc) => {
      const base = createDefaultChannel(acc);
      const override = channelOverrides[acc.id] || {};
      return {
        ...base,
        isLive: override.isLive !== undefined ? override.isLive : base.isLive,
        title: override.title || base.title,
        category: override.category || base.category,
        viewers: override.viewers !== undefined ? override.viewers : base.viewers,
        followers: base.followers + (override.followersDelta || 0),
        activeAlertTheme: override.activeAlertTheme || base.activeAlertTheme,
      };
    });
  }, [accounts, channelOverrides]);

  // Active channel selection
  const [activeChannelId, setActiveChannelId] = useState<string | null>(() => {
    return user?.id || accounts[0]?.id || null;
  });

  // Ensure active channel ID is valid
  useEffect(() => {
    if (channels.length > 0) {
      if (!activeChannelId || !channels.some((c) => c.id === activeChannelId)) {
        const userChannel = user ? channels.find((c) => c.id === user.id) : null;
        setActiveChannelId(userChannel ? userChannel.id : channels[0].id);
      }
    } else {
      setActiveChannelId(null);
    }
  }, [channels, activeChannelId, user]);

  const [activeView, setActiveView] = useState<'watch' | 'studio' | 'shop'>('watch');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isPerksStoreOpen, setIsPerksStoreOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingCreator, setViewingCreator] = useState<Channel | UserProfile | null>(null);
  const [isCreatorProfileOpen, setIsCreatorProfileOpen] = useState(false);

  // Live media stream from BroadcasterStudio
  const [broadcasterMediaStream, setBroadcasterMediaStream] = useState<MediaStream | null>(null);
  const [activeAlert, setActiveAlert] = useState<StreamAlert | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Find active channel (null if no accounts or channels exist yet)
  const activeChannel: Channel | null = useMemo(() => {
    if (!activeChannelId) return channels[0] || null;
    return channels.find((c) => c.id === activeChannelId) || channels[0] || null;
  }, [channels, activeChannelId]);

  const isOwner = !!user && !!activeChannel && activeChannel.id === user.id;

  // Compute unlocked emojis for current channel/user
  const unlockedEmojis = useMemo(() => {
    const list: CustomEmoji[] = [...(activeChannel?.customEmojis || [])];
    if (user?.unlockedPerks['perk_emotes_1']) {
      if (!list.some((e) => e.name === 'PogSpark')) {
        list.push({ id: 'unlocked_spark', name: 'PogSpark', symbol: '⚡' });
      }
      if (!list.some((e) => e.name === 'CatVibes')) {
        list.push({ id: 'unlocked_cat', name: 'CatVibes', symbol: '🐱' });
      }
    }
    if (user?.unlockedPerks['perk_emotes_2']) {
      if (!list.some((e) => e.name === 'LaserAlien')) {
        list.push({ id: 'unlocked_alien', name: 'LaserAlien', symbol: '👾' });
      }
      if (!list.some((e) => e.name === 'RocketBoost')) {
        list.push({ id: 'unlocked_rocket', name: 'RocketBoost', symbol: '🚀' });
      }
      if (!list.some((e) => e.name === 'TrophyGold')) {
        list.push({ id: 'unlocked_trophy', name: 'TrophyGold', symbol: '🏆' });
      }
    }
    return list;
  }, [activeChannel?.customEmojis, user?.unlockedPerks]);

  // Alert Auto-Dismiss
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  // Floating Reaction Auto-Cleanup
  useEffect(() => {
    if (floatingReactions.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingReactions((prev) => prev.slice(1));
    }, 2400);
    return () => clearTimeout(timer);
  }, [floatingReactions]);

  // Real-time WebSocket handlers
  const handleIncomingChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleIncomingFollow = useCallback(
    (data: { followerName: string; theme: string; rewardTokens: number }) => {
      playFollowerSound(data.theme);
      setActiveAlert({
        id: 'alert_follow_' + Date.now(),
        type: 'follow',
        username: data.followerName,
        timestamp: Date.now(),
        theme: (data.theme as AlertPopupTheme) || 'purple-glow',
      });

      // If followed channel is user's own channel, credit bounty!
      if (user && activeChannelId === user.id) {
        addFollowerToYou(data.followerName);
      }
    },
    [user, activeChannelId, addFollowerToYou]
  );

  const handleIncomingDonate = useCallback(
    (data: { donorName: string; amount: number; message?: string; theme: string }) => {
      playDonationSound(data.amount);
      setActiveAlert({
        id: 'alert_donate_' + Date.now(),
        type: 'donation',
        username: data.donorName,
        amount: data.amount,
        message: data.message,
        timestamp: Date.now(),
        theme: (data.theme as AlertPopupTheme) || 'golden-crown',
      });
    },
    []
  );

  const handleIncomingReaction = useCallback((data: { emoji: string; userId: string }) => {
    const reactionItem: FloatingReaction = {
      id: 'reaction_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      emoji: data.emoji,
      leftPercent: Math.floor(Math.random() * 60) + 20,
      createdAt: Date.now(),
    };
    setFloatingReactions((prev) => [...prev.slice(-12), reactionItem]);
  }, []);

  const handleIncomingLiveState = useCallback(
    (data: { isLive: boolean; title?: string; category?: string }) => {
      if (!activeChannelId) return;
      setChannelOverrides((prev) => ({
        ...prev,
        [activeChannelId]: {
          ...prev[activeChannelId],
          isLive: data.isLive,
          title: data.title,
          category: data.category,
        },
      }));
    },
    [activeChannelId]
  );

  // Initialize WebSocket connection for the active channel
  const {
    isConnected,
    latency,
    sendChatMessage,
    sendReaction,
    sendFollow,
    sendDonate,
    sendLiveState,
  } = useWebSocket({
    channelId: activeChannel?.id || 'lobby',
    userId: user?.id || 'guest',
    username: user?.displayName || 'Guest',
    onChatMessage: handleIncomingChatMessage,
    onFollow: handleIncomingFollow,
    onDonate: handleIncomingDonate,
    onReaction: handleIncomingReaction,
    onLiveState: handleIncomingLiveState,
  });

  // Reset chat messages when changing channels
  useEffect(() => {
    setChatMessages([]);
  }, [activeChannel?.id]);

  // Send message handler
  const handleSendMessage = (text: string) => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    const userBadges = [];
    if (activeChannel && activeChannel.id === user.id) {
      userBadges.push({ id: 'streamer', name: 'Broadcaster', color: '#9146ff', iconType: 'streamer' as const });
    }
    if (user.unlockedPerks['perk_vip_badge']) {
      userBadges.push({ id: 'vip', name: 'VIP', color: '#00F0FF', iconType: 'diamond' as const });
    }

    sendChatMessage(text, {
      id: user.id,
      name: user.displayName,
      color: '#a855f7',
      badges: userBadges,
    });
  };

  // Follow / Unfollow handler
  const handleToggleFollowChannelId = useCallback((channelId: string) => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    const targetChannel = channels.find((c) => c.id === channelId);
    const isCurrentlyFollowing = user.followedChannels.includes(channelId);
    toggleFollowChannel(channelId);

    if (!isCurrentlyFollowing) {
      const theme = targetChannel?.activeAlertTheme || 'purple-glow';
      sendFollow(user.displayName, theme);
      setChannelOverrides((prev) => ({
        ...prev,
        [channelId]: {
          ...prev[channelId],
          followersDelta: (prev[channelId]?.followersDelta || 0) + 1,
        },
      }));
    }
  }, [user, channels, toggleFollowChannel, sendFollow]);

  const handleToggleFollow = () => {
    if (!activeChannel) return;
    handleToggleFollowChannelId(activeChannel.id);
  };

  const handleViewProfile = useCallback((target: Channel | UserProfile | { id: string; name: string }) => {
    if ('id' in target && !('displayName' in target)) {
      const foundCh = channels.find((c) => c.id === target.id || c.name === target.name);
      const foundAcc = accounts.find((a) => a.id === target.id || a.username === target.name);
      if (foundCh) {
        setViewingCreator(foundCh);
      } else if (foundAcc) {
        setViewingCreator(foundAcc);
      } else {
        setViewingCreator({
          id: target.id,
          username: target.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: target.name,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
          tokens: 0,
          dailyStreak: 1,
          lastDailyClaim: null,
          followedChannels: [],
          pendingFollowerTokens: 0,
          claimedFollowerCount: 0,
          isBroadcasting: false,
          unlockedPerks: {},
        });
      }
    } else {
      setViewingCreator(target as Channel | UserProfile);
    }
    setIsCreatorProfileOpen(true);
  }, [channels, accounts]);

  // Donate tokens handler
  const handleDonate = (amount: number, message: string): boolean => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    if (!activeChannel) return false;

    const success = donateTokens(amount, activeChannel.id);
    if (success) {
      sendDonate(user.displayName, amount, message, activeChannel.activeAlertTheme);
    }
    return success;
  };

  // Channel Perks Unlock handler
  const handleUnlockPerk = (perk: ChannelPerk): boolean => {
    if (!user) return false;
    const success = unlockPerk(perk);
    if (success && perk.themeId) {
      setChannelOverrides((prev) => ({
        ...prev,
        [user.id]: {
          ...prev[user.id],
          activeAlertTheme: perk.themeId!,
        },
      }));
    }
    return success;
  };

  const handleSetAlertTheme = (theme: AlertPopupTheme) => {
    if (!user) return;
    setChannelOverrides((prev) => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        activeAlertTheme: theme,
      },
    }));
  };

  // Broadcaster Studio: Start Broadcast
  const handleStartBroadcast = (title: string, category: string, stream: MediaStream | null) => {
    if (!user) return;
    setBroadcasterMediaStream(stream);
    setChannelOverrides((prev) => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        isLive: true,
        title,
        category,
        viewers: 1, // Real initial viewer (the broadcaster)
      },
    }));
    sendLiveState(true, title, category);
    setActiveChannelId(user.id);
    setActiveView('watch');
  };

  // Broadcaster Studio: Stop Broadcast
  const handleStopBroadcast = () => {
    if (!user) return;
    if (broadcasterMediaStream) {
      broadcasterMediaStream.getTracks().forEach((t) => t.stop());
      setBroadcasterMediaStream(null);
    }
    setChannelOverrides((prev) => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        isLive: false,
        viewers: 0,
      },
    }));
    sendLiveState(false);
  };

  // Filtered channels for search
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const q = searchQuery.toLowerCase();
    return channels.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [channels, searchQuery]);

  const isUserLive = !!user && !!channelOverrides[user.id]?.isLive;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e0e10] text-white overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        currentUser={user}
        activeView={activeView}
        onSelectView={(v) => {
          if (v === 'studio' && !user) {
            setAuthModalMode('register');
            setIsAuthModalOpen(true);
            return;
          }
          setActiveView(v);
        }}
        onOpenDailyModal={() => setIsDailyModalOpen(true)}
        onOpenStore={() => setIsPerksStoreOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'register');
          setIsAuthModalOpen(true);
        }}
        onLogout={logout}
        canClaimDaily={canClaimDaily()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Guest Welcome Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-950/80 via-[#181528] to-[#12111d] border-b border-purple-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-purple-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span>
              <strong className="text-white">Browsing as Guest:</strong> Create your own account to launch your live stream channel, claim daily token rewards, and chat with viewers!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors cursor-pointer text-xs"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          channels={filteredChannels}
          activeChannelId={activeChannel ? activeChannel.id : null}
          onSelectChannel={(ch) => {
            setActiveChannelId(ch.id);
            setActiveView('watch');
          }}
          onViewProfile={handleViewProfile}
          followedChannelIds={user?.followedChannels || []}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isUserLive={isUserLive}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'register');
            setIsAuthModalOpen(true);
          }}
        />

        {/* Center Content Area */}
        {activeView === 'watch' ? (
          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#0e0e10]">
            {/* Stream Video Player Column */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <StreamPlayer
                channel={activeChannel}
                isFollowing={user && activeChannel ? user.followedChannels.includes(activeChannel.id) : false}
                isOwner={isOwner}
                onToggleFollow={handleToggleFollow}
                onOpenDonate={() => {
                  if (!user) {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsDonateModalOpen(true);
                }}
                onOpenStudio={() => setActiveView('studio')}
                onViewProfile={handleViewProfile}
                activeAlert={activeAlert}
                floatingReactions={floatingReactions}
                onSendReaction={sendReaction}
                streamMediaStream={broadcasterMediaStream}
                onOpenAuth={(mode) => {
                  setAuthModalMode(mode || 'register');
                  setIsAuthModalOpen(true);
                }}
              />
            </div>

            {/* Live Chat Column */}
            <div className="w-full lg:w-80 xl:w-96 h-80 lg:h-full shrink-0">
              <StreamChat
                channelId={activeChannel ? activeChannel.id : ''}
                channelName={activeChannel ? activeChannel.displayName : 'StreamPulse'}
                messages={chatMessages}
                currentUser={user}
                unlockedEmojis={unlockedEmojis}
                isConnected={isConnected}
                latency={latency}
                onSendMessage={handleSendMessage}
                onOpenDonate={() => {
                  if (!user) {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsDonateModalOpen(true);
                }}
                onOpenStore={() => setIsPerksStoreOpen(true)}
                onOpenAuth={(mode) => {
                  setAuthModalMode(mode || 'register');
                  setIsAuthModalOpen(true);
                }}
                onSendReaction={sendReaction}
                onViewUserProfile={handleViewProfile}
              />
            </div>
          </main>
        ) : activeView === 'studio' ? (
          /* Broadcaster Studio (Go Live) */
          <main className="flex-1 flex flex-col overflow-hidden">
            {user ? (
              <BroadcasterStudio
                currentUser={user}
                isLive={isUserLive}
                onStartBroadcast={handleStartBroadcast}
                onStopBroadcast={handleStopBroadcast}
                onClaimFollowerBounty={claimFollowerBounty}
                onOpenStore={() => setIsPerksStoreOpen(true)}
                onFollowerSimulate={() => {
                  addFollowerToYou('Viewer');
                  sendFollow('Viewer', activeChannel?.activeAlertTheme || 'purple-glow');
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div className="space-y-4 max-w-sm">
                  <h3 className="text-lg font-bold">Sign In Required</h3>
                  <p className="text-xs text-gray-400">
                    You need to sign in or create an account before launching your live broadcast studio.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </main>
        ) : (
          /* Shop Tab View */
          <main className="flex-1 flex flex-col overflow-hidden">
            <ShopView
              currentUser={user}
              onUnlockPerk={handleUnlockPerk}
              onSetAlertTheme={handleSetAlertTheme}
              activeAlertTheme={activeChannel?.activeAlertTheme || 'purple-glow'}
              onOpenDailyModal={() => setIsDailyModalOpen(true)}
              canClaimDaily={canClaimDaily()}
              onOpenAuth={(mode) => {
                setAuthModalMode(mode || 'register');
                setIsAuthModalOpen(true);
              }}
              onBrowseStreams={() => setActiveView('watch')}
            />
          </main>
        )}
      </div>

      {/* Account System: Sign In / Create Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        accounts={accounts}
        initialMode={authModalMode}
        onRegister={(data) => {
          const newAcc = registerAccount(data);
          setActiveChannelId(newAcc.id);
          return newAcc;
        }}
        onLogin={(userId) => {
          loginAccount(userId);
          setActiveChannelId(userId);
        }}
      />

      {/* Account System: Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={user}
          onUpdateProfile={updateProfile}
          onSwitchAccount={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onLogout={logout}
          onOpenDailyModal={() => setIsDailyModalOpen(true)}
          onOpenStore={() => setIsPerksStoreOpen(true)}
        />
      )}

      {/* Creator Profile Modal (View Broadcaster / Chatter Profile) */}
      <CreatorProfileModal
        isOpen={isCreatorProfileOpen}
        onClose={() => setIsCreatorProfileOpen(false)}
        creator={viewingCreator}
        currentUserId={user ? user.id : null}
        isFollowing={
          !!user && !!viewingCreator && user.followedChannels.includes(viewingCreator.id)
        }
        onToggleFollow={() => {
          if (viewingCreator) {
            handleToggleFollowChannelId(viewingCreator.id);
          }
        }}
        onOpenDonate={() => {
          if (!user) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
            return;
          }
          if (viewingCreator && 'tags' in viewingCreator) {
            setActiveChannelId(viewingCreator.id);
          }
          setIsDonateModalOpen(true);
        }}
        onWatchStream={() => {
          if (viewingCreator && 'tags' in viewingCreator) {
            setActiveChannelId(viewingCreator.id);
            setActiveView('watch');
          }
        }}
        onEditProfile={() => {
          setIsProfileModalOpen(true);
        }}
      />

      {/* Daily Reward Modal */}
      {user && (
        <DailyRewardModal
          isOpen={isDailyModalOpen}
          onClose={() => setIsDailyModalOpen(false)}
          currentUser={user}
          canClaim={canClaimDaily()}
          rewardAmount={getDailyRewardAmount()}
          onClaim={claimDailyReward}
          onResetTimer={resetDailyClaimTimer}
        />
      )}

      {/* Donate Tokens Modal */}
      {user && activeChannel && (
        <DonateModal
          isOpen={isDonateModalOpen}
          onClose={() => setIsDonateModalOpen(false)}
          channel={activeChannel}
          currentUser={user}
          onDonate={handleDonate}
          onOpenDailyModal={() => setIsDailyModalOpen(true)}
        />
      )}

      {/* Perks & Features Store Modal */}
      {user && (
        <PerksStoreModal
          isOpen={isPerksStoreOpen}
          onClose={() => setIsPerksStoreOpen(false)}
          currentUser={user}
          onUnlockPerk={handleUnlockPerk}
          onSetAlertTheme={handleSetAlertTheme}
          activeAlertTheme={activeChannel?.activeAlertTheme || 'purple-glow'}
        />
      )}
    </div>
  );
}
