import React, { useState } from 'react';
import { Sparkles, X, UserPlus, LogIn, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarUploader } from './AvatarUploader';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserProfile[];
  onRegister: (data: { username: string; displayName: string; avatar: string; bio?: string }) => UserProfile | null;
  onLogin: (userId: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onRegister,
  onLogin,
  initialMode = 'register',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const trimmedDisplay = displayName.trim() || trimmedUser;

    if (!trimmedUser || trimmedUser.length < 3) {
      setError('Username must be at least 3 alphanumeric characters (letters, numbers, underscores).');
      return;
    }

    if (accounts.some((a) => a.username.toLowerCase() === trimmedUser)) {
      setError('An account with this username already exists. Please log in or pick another username.');
      return;
    }

    if (!avatar.trim()) {
      setError('Please upload your custom profile picture to complete account creation.');
      return;
    }

    const created = onRegister({
      username: trimmedUser,
      displayName: trimmedDisplay,
      avatar: avatar.trim(),
      bio: bio.trim() || 'Welcome to my official live stream channel!',
    });

    if (created) {
      onClose();
    }
  };

  const handleLoginSubmit = (userId: string) => {
    onLogin(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#18181b] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            {mode === 'register' ? (
              <UserPlus className="w-6 h-6 text-white" />
            ) : (
              <LogIn className="w-6 h-6 text-white" />
            )}
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === 'register' ? 'Create Your Stream Account' : 'Sign In to StreamPulse'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'register'
              ? 'Start fresh with your own broadcast channel, 0 tokens, and claim your Day 1 reward!'
              : 'Choose an account or sign in to continue streaming and chatting.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0e0e10] rounded-xl border border-[#26262c]">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In ({accounts.length})
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Avatar Upload (No presets to choose from) */}
            <AvatarUploader
              avatar={avatar}
              onChange={setAvatar}
              label="Profile Picture (Upload your own)"
              required
            />

            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300 block">
                Username (Unique handle)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. nova_gamer"
                className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300 block">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. NovaGamer"
                className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300 block">
                Channel Bio (Optional)
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Streaming games, coding, and good vibes!"
                className="w-full bg-[#0e0e10] border border-[#2f2f35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-extrabold text-xs text-white rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Fresh Account</span>
            </button>
          </form>
        ) : (
          /* Sign In View */
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-gray-400">No registered accounts on this device yet.</p>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-purple-400 hover:underline font-semibold cursor-pointer"
                >
                  Create your first account →
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div className="text-[11px] font-semibold text-gray-400">Select Account:</div>
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleLoginSubmit(acc.id)}
                    className="w-full flex items-center justify-between p-2.5 bg-[#0e0e10] hover:bg-[#202026] border border-[#26262c] hover:border-purple-500/50 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.displayName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                          {acc.displayName}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">@{acc.username}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-yellow-400">
                        {acc.tokens} 💎
                      </div>
                      <div className="text-[9px] text-gray-500">Day {Math.min(acc.dailyStreak + 1, 7)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
