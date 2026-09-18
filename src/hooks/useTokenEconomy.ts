import { useState, useEffect, useCallback } from 'react';
import { UserProfile, ChannelPerk } from '../types';
import { playClaimDailySound, playDonationSound } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

const ACCOUNTS_STORAGE_KEY = 'streampulse_accounts_v4';
const ACTIVE_USER_ID_KEY = 'streampulse_active_user_id_v4';

// Clear legacy keys with preset accounts
try {
  localStorage.removeItem('streampulse_accounts_v3');
  localStorage.removeItem('streampulse_active_user_id_v3');
  localStorage.removeItem('streampulse_accounts_v2');
  localStorage.removeItem('streampulse_active_user_id_v2');
  localStorage.removeItem('twitch_stream_user_profile_v1');
  localStorage.removeItem('twitch_stream_channels_v1');
} catch {}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80';

export function createCleanAccount(username: string, displayName: string, avatar?: string, bio?: string): UserProfile {
  const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  return {
    id,
    username,
    displayName: displayName || username,
    avatar: avatar || DEFAULT_AVATAR,
    bio: bio || 'Welcome to my channel!',
    tokens: 0, // Clean start: 0 tokens
    dailyStreak: 0, // Clean start: 0 streak
    lastDailyClaim: null, // Ready for Day 1 claim
    followedChannels: [], // Clean start: 0 followed channels
    pendingFollowerTokens: 0, // Clean start: 0 follower tokens
    claimedFollowerCount: 0, // Clean start: 0 followers
    isBroadcasting: false,
    unlockedPerks: {},
    createdAt: Date.now(),
  };
}

export function useTokenEconomy() {
  // Load registered accounts (starts empty if no accounts have been created)
  const [accounts, setAccounts] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  // Active user ID (starts null if not logged in)
  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_USER_ID_KEY);
      if (saved) return saved;
    } catch {}
    return null;
  });

  // Current active user object (null if not signed in)
  const user = accounts.find((a) => a.id === activeUserId) || null;

  // Persist accounts
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  // Persist active user ID
  useEffect(() => {
    try {
      if (activeUserId) {
        localStorage.setItem(ACTIVE_USER_ID_KEY, activeUserId);
      } else {
        localStorage.removeItem(ACTIVE_USER_ID_KEY);
      }
    } catch {}
  }, [activeUserId]);

  // Update current user helper
  const updateCurrentUser = useCallback(
    (updater: (prev: UserProfile) => UserProfile) => {
      if (!user) return;
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => (acc.id === user.id ? updater(acc) : acc))
      );
    },
    [user]
  );

  // Register a new account
  const registerAccount = useCallback(
    (data: { username: string; displayName: string; avatar?: string; bio?: string }): UserProfile => {
      const newAccount = createCleanAccount(data.username, data.displayName, data.avatar, data.bio);
      setAccounts((prev) => [...prev, newAccount]);
      setActiveUserId(newAccount.id);
      return newAccount;
    },
    []
  );

  // Login / Switch account
  const loginAccount = useCallback((userId: string) => {
    setActiveUserId(userId);
  }, []);

  // Logout
  const logout = useCallback(() => {
    setActiveUserId(null);
  }, []);

  // Update profile details
  const updateProfile = useCallback(
    (data: { displayName?: string; bio?: string; avatar?: string }) => {
      updateCurrentUser((prev) => ({
        ...prev,
        displayName: data.displayName ?? prev.displayName,
        bio: data.bio ?? prev.bio,
        avatar: data.avatar ?? prev.avatar,
      }));
    },
    [updateCurrentUser]
  );

  // Check if daily reward can be claimed
  const canClaimDaily = useCallback(() => {
    if (!user) return false;
    if (!user.lastDailyClaim) return true;
    const lastClaimDate = new Date(user.lastDailyClaim).toDateString();
    const todayDate = new Date().toDateString();
    return lastClaimDate !== todayDate;
  }, [user]);

  // Calculate daily reward amount based on streak (Day 1: 100, Day 2: 125, etc.)
  const getDailyRewardAmount = useCallback(() => {
    if (!user) return 100;
    const base = 100;
    const streakBonus = Math.min(user.dailyStreak, 6) * 25;
    return base + streakBonus;
  }, [user]);

  // Claim Daily Reward
  const claimDailyReward = useCallback(() => {
    if (!user) return 0;
    const amount = getDailyRewardAmount();
    const newStreak = user.dailyStreak + 1;

    updateCurrentUser((prev) => ({
      ...prev,
      tokens: prev.tokens + amount,
      dailyStreak: newStreak,
      lastDailyClaim: new Date().toISOString(),
    }));

    playClaimDailySound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.25 },
      colors: ['#9146FF', '#00F0FF', '#FFD700', '#FF007F'],
    });

    return amount;
  }, [getDailyRewardAmount, updateCurrentUser, user]);

  // Force reset daily claim for testing/demo
  const resetDailyClaimTimer = useCallback(() => {
    updateCurrentUser((prev) => ({
      ...prev,
      lastDailyClaim: null,
    }));
  }, [updateCurrentUser]);

  // Claim Follower Bounty
  const claimFollowerBounty = useCallback(() => {
    if (!user || user.pendingFollowerTokens <= 0) return 0;
    const bounty = user.pendingFollowerTokens;

    updateCurrentUser((prev) => ({
      ...prev,
      tokens: prev.tokens + bounty,
      pendingFollowerTokens: 0,
      claimedFollowerCount: prev.claimedFollowerCount + Math.floor(bounty / 25),
    }));

    playClaimDailySound();
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#00FF88', '#9146FF', '#FFD700'],
    });

    return bounty;
  }, [updateCurrentUser, user]);

  // Donate tokens
  const donateTokens = useCallback(
    (amount: number, channelId: string): boolean => {
      if (!user || user.tokens < amount) {
        return false;
      }

      updateCurrentUser((prev) => ({
        ...prev,
        tokens: prev.tokens - amount,
      }));

      playDonationSound(amount);
      confetti({
        particleCount: Math.min(amount, 120),
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFB800', '#FFA500', '#9146FF'],
      });

      return true;
    },
    [updateCurrentUser, user]
  );

  // Unlock channel perk
  const unlockPerk = useCallback(
    (perk: ChannelPerk): boolean => {
      if (!user || user.tokens < perk.costTokens || user.unlockedPerks[perk.id]) {
        return false;
      }

      updateCurrentUser((prev) => ({
        ...prev,
        tokens: prev.tokens - perk.costTokens,
        unlockedPerks: {
          ...prev.unlockedPerks,
          [perk.id]: true,
        },
      }));

      playClaimDailySound();
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#9146FF', '#00F0FF', '#FF007F'],
      });

      return true;
    },
    [updateCurrentUser, user]
  );

  // Toggle follow channel
  const toggleFollowChannel = useCallback(
    (channelId: string) => {
      if (!user) return;
      updateCurrentUser((prev) => {
        const isFollowing = prev.followedChannels.includes(channelId);
        const newFollowed = isFollowing
          ? prev.followedChannels.filter((id) => id !== channelId)
          : [...prev.followedChannels, channelId];
        return {
          ...prev,
          followedChannels: newFollowed,
        };
      });
    },
    [updateCurrentUser, user]
  );

  // Credit follower bounty to your channel
  const addFollowerToYou = useCallback(
    (followerName: string = 'Viewer') => {
      updateCurrentUser((prev) => ({
        ...prev,
        pendingFollowerTokens: prev.pendingFollowerTokens + 25,
      }));
    },
    [updateCurrentUser]
  );

  return {
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
  };
}
