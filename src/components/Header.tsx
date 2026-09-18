import React, { useState, useRef, useEffect } from 'react';
import { Radio, Search, Gift, Sparkles, Video, User, Compass, Heart, LogIn, UserPlus, LogOut, ChevronDown, Settings, ShoppingBag } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeView: 'watch' | 'studio' | 'shop';
  onSelectView: (view: 'watch' | 'studio' | 'shop') => void;
  onOpenDailyModal: () => void;
  onOpenStore: () => void;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  canClaimDaily: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  onSelectView,
  onOpenDailyModal,
  onOpenStore,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  canClaimDaily,
  searchQuery,
  onSearchChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-[#18181b] border-b border-[#26262c] px-4 flex items-center justify-between gap-4 select-none z-30 shrink-0">
      {/* Left Section: Brand & Nav */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => onSelectView('watch')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-black text-lg tracking-tight text-white flex items-center gap-1">
            Stream<span className="text-purple-400">Pulse</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => onSelectView('watch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'watch'
                ? 'bg-purple-600/20 text-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-[#1f1f23]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Browse Streams</span>
          </button>

          <button
            onClick={() => onSelectView('shop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'shop'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-gray-400 hover:text-yellow-300 hover:bg-[#1f1f23]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-yellow-400" />
            <span>Shop</span>
            <span className="text-[9px] bg-yellow-500/20 text-yellow-400 font-bold px-1.5 py-0.2 rounded-full border border-yellow-500/30">
              Perks
            </span>
          </button>

          <button
            onClick={() => onSelectView('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'studio'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-[#1f1f23]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Go Live (Studio)</span>
          </button>
        </nav>
      </div>

      {/* Middle Section: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md items-center bg-[#0e0e10] rounded-xl border border-[#2f2f35] px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/50">
        <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search live streams, categories, tags..."
          className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Right Section: Tokens, Daily Reward, Go Live, Profile */}
      <div className="flex items-center gap-2.5">
        {currentUser ? (
          <>
            {/* Token Balance Pill */}
            <button
              onClick={onOpenStore}
              className="flex items-center gap-1.5 bg-[#0e0e10] hover:bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-500/60 px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-400 transition-all cursor-pointer shadow-sm"
              title="Channel Perks Store"
            >
              <span className="text-sm">💎</span>
              <span className="font-mono">{currentUser.tokens}</span>
              <span className="hidden xl:inline text-[10px] text-gray-400 font-normal">Tokens</span>
            </button>

            {/* Daily Reward Button */}
            <button
              onClick={onOpenDailyModal}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                canClaimDaily
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95'
                  : 'bg-[#1f1f23] text-gray-400 hover:text-white border border-[#2f2f35]'
              }`}
              title="Daily Login Reward"
            >
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Daily Reward</span>
              {canClaimDaily && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-[#18181b] animate-bounce" />
              )}
            </button>

            {/* Go Live Button */}
            {activeView !== 'studio' && (
              <button
                onClick={() => onSelectView('studio')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Go Live</span>
              </button>
            )}

            {/* User Dropdown */}
            <div className="relative pl-1 border-l border-[#26262c]" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#27272a] transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full ring-2 ring-purple-500/50 object-cover"
                />
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#18181b] border border-[#2f2f35] rounded-2xl shadow-2xl py-2 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-100">
                  <div className="px-3 py-2 border-b border-[#26262c]">
                    <div className="text-xs font-bold truncate text-white">{currentUser.displayName}</div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">@{currentUser.username}</div>
                    <div className="mt-1 text-[11px] font-mono text-yellow-400 font-bold">
                      {currentUser.tokens} 💎 Tokens
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-[#27272a] flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>View & Edit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenStore();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-[#27272a] flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Perks & Feature Store</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuth('login');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-[#27272a] flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Switch / Add Account</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#26262c]">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:text-red-300 hover:bg-[#27272a] flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Guest Buttons */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-[#1f1f23] hover:bg-[#27272a] rounded-xl border border-[#2f2f35] transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
