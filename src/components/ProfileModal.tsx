import React, { useState } from 'react';
import { User, Edit3, Check, X, LogOut, Users, Sparkles, Shield, Gift } from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarUploader } from './AvatarUploader';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateProfile: (data: { displayName?: string; bio?: string; avatar?: string }) => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onOpenDailyModal: () => void;
  onOpenStore: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onSwitchAccount,
  onLogout,
  onOpenDailyModal,
  onOpenStore,
}) => {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const handleSave = () => {
    onUpdateProfile({
      displayName: displayName.trim() || currentUser.displayName,
      bio: bio.trim(),
      avatar,
    });
    setIsEditing(false);
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

        {/* Profile Card Top */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={isEditing ? avatar : currentUser.avatar}
              alt={currentUser.displayName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500 shadow-lg"
            />
            {isEditing && (
              <span className="absolute bottom-0 right-0 bg-purple-600 p-1 rounded-full text-white shadow">
                <Edit3 className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white truncate">
                {isEditing ? displayName : currentUser.displayName}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono">@{currentUser.username}</p>
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">
              {isEditing ? bio : currentUser.bio || 'Broadcaster & viewer on StreamPulse'}
            </p>
          </div>
        </div>

        {/* Edit Mode Inputs */}
        {isEditing && (
          <div className="space-y-3 bg-[#0e0e10] p-3.5 rounded-2xl border border-[#26262c]">
            <AvatarUploader
              avatar={avatar}
              onChange={setAvatar}
              label="Change Avatar (Upload your own)"
            />

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#18181b] border border-[#2f2f35] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Bio</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#18181b] border border-[#2f2f35] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            onClick={() => {
              onClose();
              onOpenStore();
            }}
            className="p-2.5 bg-[#0e0e10] border border-yellow-500/20 hover:border-yellow-500/50 rounded-2xl cursor-pointer transition-all hover:scale-102"
          >
            <div className="text-[10px] text-gray-400">Token Balance</div>
            <div className="text-sm font-black font-mono text-yellow-400 mt-0.5">
              {currentUser.tokens} 💎
            </div>
          </div>

          <div
            onClick={() => {
              onClose();
              onOpenDailyModal();
            }}
            className="p-2.5 bg-[#0e0e10] border border-purple-500/20 hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all hover:scale-102"
          >
            <div className="text-[10px] text-gray-400">Daily Streak</div>
            <div className="text-sm font-black text-purple-300 mt-0.5">
              Day {currentUser.dailyStreak} 🔥
            </div>
          </div>

          <div className="p-2.5 bg-[#0e0e10] border border-[#26262c] rounded-2xl">
            <div className="text-[10px] text-gray-400">Following</div>
            <div className="text-sm font-black text-white mt-0.5">
              {currentUser.followedChannels.length}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="pt-2 border-t border-[#26262c] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchAccount();
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
