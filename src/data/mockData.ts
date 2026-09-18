import { Channel, ChannelPerk, CustomEmoji, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user_default',
  username: 'streamer',
  displayName: 'Streamer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  bio: 'Welcome to my channel!',
  tokens: 0, // Clean start: 0 tokens
  dailyStreak: 0, // Clean start: 0 streak
  lastDailyClaim: null, // Ready for Day 1 claim
  followedChannels: [], // Clean start: 0 followed channels
  pendingFollowerTokens: 0, // Clean start: 0 accumulated follower tokens
  claimedFollowerCount: 0, // Clean start: 0 followers
  isBroadcasting: false,
  unlockedPerks: {},
};

export const BUILT_IN_EMOJIS: CustomEmoji[] = [
  { id: 'pog', name: 'PogChamp', symbol: '😲' },
  { id: 'kappa', name: 'Kappa', symbol: '😏' },
  { id: 'lul', name: 'LUL', symbol: '🤣' },
  { id: 'monkas', name: 'MonkaS', symbol: '😰' },
  { id: 'heart', name: 'HeartLove', symbol: '💜' },
  { id: 'fire', name: 'FireFlame', symbol: '🔥' },
  { id: 'diamond', name: 'DiamondHands', symbol: '💎' },
  { id: 'crown', name: 'CrownRoyalty', symbol: '👑' },
  { id: 'gg', name: 'GoodGame', symbol: '🎮' },
  { id: 'hype', name: 'HypeTrain', symbol: '🚂' },
];

export const AVAILABLE_PERKS: ChannelPerk[] = [
  {
    id: 'perk_emotes_1',
    title: 'Custom Chat Emoji Pack (Vol. 1)',
    description: 'Unlocks exclusive high-hype channel emotes: :PogSpark: ⚡ and :CatVibes: 🐱 for your stream chat!',
    costTokens: 150,
    category: 'emojis',
    icon: 'Smile',
    previewEffect: '2 Animated Emotes',
  },
  {
    id: 'perk_emotes_2',
    title: 'Neon Gamer Emoji Pack (Vol. 2)',
    description: 'Unlocks ultra rare :LaserAlien: 👾, :RocketBoost: 🚀, and :TrophyGold: 🏆 chat badges.',
    costTokens: 300,
    category: 'emojis',
    icon: 'Sparkles',
    previewEffect: '3 Rare Emotes',
  },
  {
    id: 'perk_alert_retro',
    title: 'Retro 8-Bit Pixel Alert',
    description: 'Replaces standard notifications with arcade-style 8-bit popup and custom chiptune synth!',
    costTokens: 200,
    category: 'alerts',
    icon: 'Gamepad2',
    themeId: 'retro-8bit',
    previewEffect: 'Arcade Follower Popup',
  },
  {
    id: 'perk_alert_cyberpunk',
    title: 'Cyberpunk Neon Glitch Alert',
    description: 'High-octane neon glitch alert banner with laser sweep audio for new followers and tips.',
    costTokens: 350,
    category: 'alerts',
    icon: 'Zap',
    themeId: 'cyberpunk-glitch',
    previewEffect: 'Neon Glitch Banner',
  },
  {
    id: 'perk_alert_golden',
    title: 'Golden Royal Crown Alert',
    description: 'Regal golden banner with royal fanfare sound and gold confetti blast on follow & donate.',
    costTokens: 500,
    category: 'alerts',
    icon: 'Crown',
    themeId: 'golden-crown',
    previewEffect: 'Gold Confetti & Fanfare',
  },
  {
    id: 'perk_low_latency',
    title: 'Ultra Low-Latency Boost',
    description: 'Hardware-optimized sub-150ms real-time streaming pipeline for instant chat interaction.',
    costTokens: 250,
    category: 'streaming',
    icon: 'Flame',
    previewEffect: 'Sub-150ms Glass-to-Glass',
  },
  {
    id: 'perk_stream_goal',
    title: 'Interactive Token & Follower Goal',
    description: 'Adds an interactive on-stream HUD goal bar that updates live when viewers follow or tip tokens.',
    costTokens: 300,
    category: 'streaming',
    icon: 'Target',
    previewEffect: 'Live Stream Overlay Goal',
  },
  {
    id: 'perk_vip_badge',
    title: 'Custom Channel VIP Badge',
    description: 'Grants customized diamond badges next to usernames in your chat room.',
    costTokens: 350,
    category: 'badges',
    icon: 'ShieldCheck',
    previewEffect: 'Special Chat Badge',
  },
];

// Clean initial channels: empty of fake streams, contains only the user's newly created channel
export const createDefaultChannel = (user: UserProfile): Channel => ({
  id: user.id,
  name: user.username,
  displayName: user.displayName,
  avatar: user.avatar,
  bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  isLive: false,
  title: `${user.displayName}'s Live Broadcast`,
  category: 'Just Chatting',
  tags: ['Interactive', 'LowLatency', 'Live'],
  viewers: 0,
  followers: 0,
  bio: user.bio || 'Welcome to my official live stream! Real-time chat, low latency broadcast, and token rewards.',
  activeAlertTheme: 'purple-glow',
  unlockedPerkIds: [],
  customEmojis: [],
  lowLatencyMode: true,
  streamResolution: '720p60',
});
