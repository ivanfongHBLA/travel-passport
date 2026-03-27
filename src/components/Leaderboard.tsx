import React from 'react';
import { Award, Trophy, Users, Globe, Flag, Star, Search, MapPin, Loader2, Copy, Check, X, Plus, Clock, Zap, Map as MapOutline, Landmark as Unesco, Building } from 'lucide-react';

interface LeaderboardProps {
  userEmail?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userEmail }) => {
  const mockRankings = [
    { rank: 1, name: 'Marco Polo', countries: 124, cities: 450, badges: 82, avatar: 'https://picsum.photos/seed/marco/100/100' },
    { rank: 2, name: 'Ibn Battuta', countries: 112, cities: 380, badges: 75, avatar: 'https://picsum.photos/seed/ibn/100/100' },
    { rank: 3, name: 'Amelia Earhart', countries: 85, cities: 210, badges: 68, avatar: 'https://picsum.photos/seed/amelia/100/100' },
    { rank: 4, name: 'Phileas Fogg', countries: 72, cities: 180, badges: 54, avatar: 'https://picsum.photos/seed/phileas/100/100' },
    { rank: 5, name: 'Dora Explorer', countries: 45, cities: 120, badges: 42, avatar: 'https://picsum.photos/seed/dora/100/100' },
    { rank: 12, name: 'You', countries: 12, cities: 24, badges: 8, avatar: 'https://picsum.photos/seed/you/100/100', isUser: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] cartoon-border cartoon-shadow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FFD600] rounded-xl md:rounded-2xl cartoon-border flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-[#1A1A1A]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-fredoka font-bold text-[#1A1A1A]">Global Rankings</h2>
            <p className="text-xs md:text-[#9E9E9E] font-medium">See how you stack up against world travelers.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold cartoon-shadow-sm">Global</button>
          <button className="flex-1 md:flex-none px-4 py-2 bg-white text-[#1A1A1A] rounded-xl text-xs font-bold border-2 border-[#1A1A1A] hover:bg-[#F5F5F5]">Friends</button>
        </div>
      </div>

      {/* Rankings List */}
      <div className="bg-white rounded-3xl md:rounded-[40px] cartoon-border cartoon-shadow overflow-hidden">
        <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-6 border-b-2 border-[#1A1A1A] bg-[#F5F5F5] text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-6 md:col-span-5">Traveler</div>
          <div className="col-span-2 text-center">Countries</div>
          <div className="col-span-2 text-center hidden md:block">Cities</div>
          <div className="col-span-2 text-center">Badges</div>
        </div>

        <div className="divide-y-2 divide-[#F5F5F5]">
          {mockRankings.map((player) => (
            <div 
              key={player.rank} 
              className={`grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-6 items-center transition-colors ${player.isUser ? 'bg-[#FFD600]/10' : 'hover:bg-[#F9F9F9]'}`}
            >
              <div className="col-span-2 md:col-span-1 flex justify-center">
                <span className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-fredoka font-bold cartoon-border-sm ${
                  player.rank === 1 ? 'bg-[#FFD600]' : 
                  player.rank === 2 ? 'bg-[#E5E5E5]' : 
                  player.rank === 3 ? 'bg-[#D97706] text-white' : 'bg-white'
                }`}>
                  {player.rank}
                </span>
              </div>
              <div className="col-span-6 md:col-span-5 flex items-center gap-2 md:gap-3">
                <img src={player.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl cartoon-border-sm" alt={player.name} referrerpolicy="no-referrer" />
                <div className="min-w-0">
                  <p className="font-fredoka font-bold text-[#1A1A1A] text-xs md:text-base truncate">{player.name}</p>
                  {player.isUser && <span className="text-[7px] md:text-[8px] font-bold uppercase text-[#D97706]">You</span>}
                </div>
              </div>
              <div className="col-span-2 text-center font-mono font-bold text-xs md:text-base">{player.countries}</div>
              <div className="col-span-2 text-center font-mono font-bold text-xs md:text-base hidden md:block">{player.cities}</div>
              <div className="col-span-2 text-center font-mono font-bold text-xs md:text-base">{player.badges}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Promo */}
      <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-3xl md:rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-3xl md:text-4xl">🏝️</div>
          <div>
            <h3 className="text-lg md:text-xl font-fredoka font-bold leading-tight">Summer Travel Challenge</h3>
            <p className="text-white/60 text-xs md:text-sm mt-1">Visit 5 coastal spots before August to unlock the "Island Hopper" legendary stamp!</p>
          </div>
        </div>
        <button className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#FFD600] text-[#1A1A1A] rounded-xl md:rounded-2xl font-fredoka font-bold cartoon-btn whitespace-nowrap text-sm">
          View Challenge
        </button>
      </div>
    </div>
  );
};
