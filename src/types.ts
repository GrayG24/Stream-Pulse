export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  password?: string;
  createdAt?: number;
  tokens: number;
  dailyStreak: number;
  lastDailyClaim: string | null; // ISO string
  followedChannels: string[]; // channel IDs
  pendingFollowerTokens: number; // Tokens earned from viewers who followed your channel
  claimedFollowerCount: number;
  isBroadcasting: boolean;
  unlockedPerks: Record<string, boolean>; // perkId -> true
}

export interface CustomEmoji {
  id: string;
  name: string;
  symbol: string;
  url?: string;
  channelId?: string;
  isUnlocked?: boolean;
}

export type AlertPopupTheme = 'purple-glow' | 'cyberpunk-glitch' | 'retro-8bit' | 'golden-crown' | 'fire-hype';

export interface ChannelPerk {
  id: string;
  title: string;
  description: string;
  costTokens: number;
  category: 'emojis' | 'alerts' | 'streaming' | 'badges';
  icon: string;
  previewEffect?: string;
  themeId?: AlertPopupTheme;
  customEmojiPayload?: CustomEmoji;
}

export interface Channel {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  bannerUrl: string;
  isLive: boolean;
  title: string;
  category: string;
  tags: string[];
  viewers: number;
  followers: number;
  bio: string;
  streamStartTime?: number;
  activeAlertTheme: AlertPopupTheme;
  unlockedPerkIds: string[];
  customEmojis: CustomEmoji[];
  lowLatencyMode: boolean;
  streamResolution: '1080p60' | '720p60' | '720p30' | '480p';
}

export interface ChatBadge {
  id: string;
  name: string;
  color: string;
  iconType: 'crown' | 'shield' | 'star' | 'diamond' | 'bot' | 'streamer';
}

export interface ChatMessage {
  id: string;
  channelId: string;
  user: {
    id: string;
    name: string;
    color: string;
    badges: ChatBadge[];
  };
  message: string;
  timestamp: number;
  type: 'chat' | 'donation' | 'follow' | 'system' | 'perk_unlock';
  donationAmount?: number;
  emotes?: string[];
}

export interface StreamAlert {
  id: string;
  type: 'follow' | 'donation' | 'sub';
  username: string;
  amount?: number;
  message?: string;
  timestamp: number;
  theme: AlertPopupTheme;
}

export interface StreamTelemetry {
  latencyMs: number;
  fps: number;
  bitrateKbps: number;
  resolution: string;
  droppedFramesPercent: number;
  hardwareOptimized: boolean;
  audioLevels: number; // 0 to 100
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  leftPercent: number;
  createdAt: number;
}
