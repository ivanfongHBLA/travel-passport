import React, { useMemo } from 'react';
import { Globe, Plane, Mountain, Building2, Landmark, Compass, MapPin, Star, Award, CheckCircle2, Trees, Waves, Anchor, Sprout, Soup, Footprints, Camera, Flag, Map as MapIcon, LayoutGrid, Map as MapViewIcon, User as UserIcon, LogIn, LogOut, Search, Loader2, Copy, Check, X, Plus, Clock, Zap, Map as MapOutline, Landmark as Unesco, Building } from 'lucide-react';
import { PassportStamp } from './PassportStamp';
import { motion } from 'motion/react';

interface Place {
  name: string;
  lat: number;
  lng: number;
  category: string;
  country: string;
  countryCode: string;
  metadata?: string;
  image?: string;
  checkedIn?: boolean;
}

interface AchievementsProps {
  places: Place[];
  checkedInPlaces: Set<string>;
}

// Simple mapping for continents (ISO 3166-1 alpha-2 to Continent)
const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // Asia
  'MY': 'Asia', 'SG': 'Asia', 'TH': 'Asia', 'ID': 'Asia', 'VN': 'Asia', 'PH': 'Asia', 'CN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'IN': 'Asia', 'PK': 'Asia', 'BD': 'Asia', 'TR': 'Asia', 'SA': 'Asia', 'AE': 'Asia', 'IL': 'Asia', 'IR': 'Asia', 'IQ': 'Asia', 'AF': 'Asia', 'KH': 'Asia', 'LA': 'Asia', 'MM': 'Asia', 'NP': 'Asia', 'LK': 'Asia', 'MN': 'Asia', 'UZ': 'Asia', 'KZ': 'Asia', 'KG': 'Asia', 'TJ': 'Asia', 'TM': 'Asia', 'GE': 'Asia', 'AZ': 'Asia', 'AM': 'Asia', 'CY': 'Asia', 'LB': 'Asia', 'JO': 'Asia', 'KW': 'Asia', 'QA': 'Asia', 'BH': 'Asia', 'OM': 'Asia', 'YE': 'Asia', 'SY': 'Asia', 'PS': 'Asia', 'TW': 'Asia', 'HK': 'Asia', 'MO': 'Asia',
  // Europe
  'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'PT': 'Europe', 'NL': 'Europe', 'BE': 'Europe', 'CH': 'Europe', 'AT': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'DK': 'Europe', 'FI': 'Europe', 'IE': 'Europe', 'GR': 'Europe', 'PL': 'Europe', 'CZ': 'Europe', 'HU': 'Europe', 'RO': 'Europe', 'BG': 'Europe', 'UA': 'Europe', 'RU': 'Europe', 'BY': 'Europe', 'MD': 'Europe', 'EE': 'Europe', 'LV': 'Europe', 'LT': 'Europe', 'SK': 'Europe', 'SI': 'Europe', 'HR': 'Europe', 'BA': 'Europe', 'RS': 'Europe', 'ME': 'Europe', 'AL': 'Europe', 'MK': 'Europe', 'IS': 'Europe', 'LU': 'Europe', 'MC': 'Europe', 'LI': 'Europe', 'SM': 'Europe', 'VA': 'Europe', 'MT': 'Europe', 'AD': 'Europe',
  // North America
  'US': 'North America', 'CA': 'North America', 'MX': 'North America', 'CU': 'North America', 'JM': 'North America', 'HT': 'North America', 'DO': 'North America', 'PR': 'North America', 'GT': 'North America', 'BZ': 'North America', 'HN': 'North America', 'SV': 'North America', 'NI': 'North America', 'CR': 'North America', 'PA': 'North America', 'BS': 'North America', 'TT': 'North America', 'BB': 'North America', 'LC': 'North America', 'GD': 'North America', 'VC': 'North America', 'AG': 'North America', 'KN': 'North America', 'DM': 'North America',
  // South America
  'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America', 'PE': 'South America', 'VE': 'South America', 'EC': 'South America', 'BO': 'South America', 'PY': 'South America', 'UY': 'South America', 'GY': 'South America', 'SR': 'South America', 'FK': 'South America',
  // Africa
  'ZA': 'Africa', 'EG': 'Africa', 'NG': 'Africa', 'KE': 'Africa', 'MA': 'Africa', 'DZ': 'Africa', 'ET': 'Africa', 'GH': 'Africa', 'TZ': 'Africa', 'UG': 'Africa', 'SD': 'Africa', 'LY': 'Africa', 'TN': 'Africa', 'CI': 'Africa', 'SN': 'Africa', 'CM': 'Africa', 'AO': 'Africa', 'MZ': 'Africa', 'ZW': 'Africa', 'ZM': 'Africa', 'MW': 'Africa', 'NA': 'Africa', 'BW': 'Africa', 'LS': 'Africa', 'SZ': 'Africa', 'MU': 'Africa', 'SC': 'Africa', 'CV': 'Africa', 'ST': 'Africa', 'GQ': 'Africa', 'GA': 'Africa', 'CG': 'Africa', 'CD': 'Africa', 'RW': 'Africa', 'BI': 'Africa', 'SO': 'Africa', 'DJ': 'Africa', 'ER': 'Africa', 'SS': 'Africa', 'CF': 'Africa', 'TD': 'Africa', 'NE': 'Africa', 'ML': 'Africa', 'MR': 'Africa', 'BF': 'Africa', 'TG': 'Africa', 'BJ': 'Africa', 'SL': 'Africa', 'LR': 'Africa', 'GN': 'Africa', 'GW': 'Africa', 'GM': 'Africa',
  // Oceania
  'AU': 'Oceania', 'NZ': 'Oceania', 'PG': 'Oceania', 'FJ': 'Oceania', 'SB': 'Oceania', 'VU': 'Oceania', 'WS': 'Oceania', 'TO': 'Oceania', 'KI': 'Oceania', 'TV': 'Oceania', 'NR': 'Oceania', 'PW': 'Oceania', 'FM': 'Oceania', 'MH': 'Oceania',
  // Antarctica
  'AQ': 'Antarctica'
};

export const Achievements: React.FC<AchievementsProps> = ({ places, checkedInPlaces }) => {
  const stats = useMemo(() => {
    const checkedIn = places.filter(p => checkedInPlaces.has(p.name));
    const countries = new Set(checkedIn.map(p => p.countryCode));
    const continents = new Set(checkedIn.map(p => COUNTRY_TO_CONTINENT[p.countryCode] || 'Other'));
    const cities = checkedIn.filter(p => p.category === 'City').length;
    const unesco = checkedIn.filter(p => p.category === 'UNESCO Site').length;
    const michelin = checkedIn.filter(p => p.category === 'Michelin Restaurant').length;
    const airports = checkedIn.filter(p => p.category === 'Airport').length;
    const nature = checkedIn.filter(p => ['Park', 'Botanical Park', 'Scenery', 'Diving Site'].includes(p.category)).length;

    return {
      countryCount: countries.size,
      continentCount: continents.size,
      continents: Array.from(continents),
      cityCount: cities,
      unescoCount: unesco,
      michelinCount: michelin,
      airportCount: airports,
      natureCount: nature,
      totalCheckedIn: checkedIn.length
    };
  }, [places, checkedInPlaces]);

  const badges = [
    // 1. Country Milestones
    { id: 'c1', title: 'First Stamp', icon: Flag, color: '#1A1A1A', category: 'Milestone', threshold: 1, type: 'country', subtitle: '1 Country Visited' },
    { id: 'c3', title: 'Junior Explorer', icon: Compass, color: '#2563EB', category: 'Milestone', threshold: 3, type: 'country', subtitle: '3 Countries Visited' },
    { id: 'c5', title: 'Explorer', icon: MapIcon, color: '#059669', category: 'Milestone', threshold: 5, type: 'country', subtitle: '5 Countries Visited' },
    { id: 'c10', title: 'Adventurer', icon: Mountain, color: '#D97706', category: 'Milestone', threshold: 10, type: 'country', subtitle: '10 Countries Visited' },
    { id: 'c20', title: 'Globe Trotter', icon: Globe, color: '#7C3AED', category: 'Milestone', threshold: 20, type: 'country', subtitle: '20 Countries Visited' },
    { id: 'c50', title: 'Sky Nomad', icon: Plane, color: '#0EA5E9', category: 'Milestone', threshold: 50, type: 'country', subtitle: '50 Countries Visited' },

    // 2. Continent Achievements
    { id: 'cont_asia', title: 'Asia Trailblazer', icon: MapOutline, color: '#DC2626', category: 'Continent', type: 'continent', continent: 'Asia', subtitle: 'Explore Asia' },
    { id: 'cont_euro', title: 'European Voyager', icon: MapOutline, color: '#2563EB', category: 'Continent', type: 'continent', continent: 'Europe', subtitle: 'Explore Europe' },
    { id: 'cont_na', title: 'North America Rover', icon: MapOutline, color: '#059669', category: 'Continent', type: 'continent', continent: 'North America', subtitle: 'Explore North America' },
    { id: 'cont_global', title: 'Global Navigator', icon: Globe, color: '#FFD600', category: 'Continent', threshold: 5, type: 'continent_count', subtitle: '5 Continents Visited' },

    // 3. City Achievements
    { id: 'city_hopper', title: 'City Hopper', icon: Building2, color: '#4B5563', category: 'City', threshold: 5, type: 'city', subtitle: '5 Cities Visited' },
    { id: 'urban_explorer', title: 'Urban Explorer', icon: Building, color: '#1A1A1A', category: 'City', threshold: 15, type: 'city', subtitle: '15 Cities Visited' },

    // 4. Airport & Airline
    { id: 'first_takeoff', title: 'First Takeoff', icon: Plane, color: '#6366F1', category: 'Aviation', threshold: 1, type: 'airport', subtitle: 'First Airport Visit' },
    { id: 'terminal_hopper', title: 'Terminal Hopper', icon: Anchor, color: '#0EA5E9', category: 'Aviation', threshold: 5, type: 'airport', subtitle: '5 Airports Visited' },

    // 5. Nature & Landscape
    { id: 'mountain_wanderer', title: 'Mountain Wanderer', icon: Mountain, color: '#059669', category: 'Nature', threshold: 3, type: 'nature', subtitle: '3 Nature Spots' },
    { id: 'island_hopper', title: 'Island Hopper', icon: Waves, color: '#0891B2', category: 'Nature', threshold: 5, type: 'nature', subtitle: '5 Coastal Spots' },

    // 6. Cultural
    { id: 'heritage_seeker', title: 'Heritage Seeker', icon: Unesco, color: '#D97706', category: 'Culture', threshold: 1, type: 'unesco', subtitle: 'Visit a UNESCO Site' },
    { id: 'museum_wanderer', title: 'Museum Wanderer', icon: Landmark, color: '#7C3AED', category: 'Culture', threshold: 3, type: 'museum', subtitle: '3 Museums Visited' },

    // 8. Passport Collection
    { id: 'stamp_collector', title: 'Stamp Collector', icon: Footprints, color: '#1A1A1A', category: 'Collection', threshold: 10, type: 'total', subtitle: '10 Stamps Collected' },
    
    // Hidden Badges
    { id: 'secret_midnight', title: 'Midnight Border', icon: Clock, color: '#1E1B4B', category: 'Secret', isSecret: true, type: 'secret', subtitle: 'Cross border at midnight' },
    { id: 'secret_jetlag', title: 'Jet Lag Champion', icon: Zap, color: '#F59E0B', category: 'Secret', isSecret: true, type: 'secret', subtitle: 'Cross many time zones' },
  ];

  const checkUnlocked = (badge: any) => {
    switch (badge.type) {
      case 'country': return stats.countryCount >= badge.threshold;
      case 'continent': return stats.continents.includes(badge.continent);
      case 'continent_count': return stats.continentCount >= badge.threshold;
      case 'city': return stats.cityCount >= badge.threshold;
      case 'airport': return stats.airportCount >= badge.threshold;
      case 'nature': return stats.natureCount >= badge.threshold;
      case 'unesco': return stats.unescoCount >= badge.threshold;
      case 'total': return stats.totalCheckedIn >= badge.threshold;
      case 'secret': return false; // Mock secret logic
      default: return false;
    }
  };

  const travelPersonality = useMemo(() => {
    if (stats.totalCheckedIn === 0) return "New Voyager";
    
    const profiles = [
      { name: "Urban Explorer", score: stats.cityCount },
      { name: "Nature Seeker", score: stats.natureCount },
      { name: "Culture Hunter", score: stats.unescoCount },
      { name: "Global Nomad", score: stats.countryCount },
    ];

    const top = profiles.sort((a, b) => b.score - a.score)[0];
    return top.score > 0 ? top.name : "Curious Wanderer";
  }, [stats]);

  return (
    <div className="space-y-12">
      {/* Profile Summary */}
      <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] cartoon-border cartoon-shadow flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#FFD600] rounded-full cartoon-border flex items-center justify-center text-4xl md:text-5xl shrink-0">
          {travelPersonality === "Nature Seeker" ? '🌲' : 
           travelPersonality === "Urban Explorer" ? '🏙️' :
           travelPersonality === "Culture Hunter" ? '🏛️' : '🌍'}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-fredoka font-bold text-[#1A1A1A] mb-1 md:mb-2">{travelPersonality}</h2>
          <p className="text-xs md:text-[#9E9E9E] font-medium mb-4">Your travel personality based on your global collection.</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
            <div className="bg-[#F5F5F5] px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-[#E5E5E5]">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Countries</p>
              <p className="text-lg md:text-xl font-fredoka font-bold">{stats.countryCount}</p>
            </div>
            <div className="bg-[#F5F5F5] px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-[#E5E5E5]">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Continents</p>
              <p className="text-lg md:text-xl font-fredoka font-bold">{stats.continentCount}</p>
            </div>
            <div className="bg-[#F5F5F5] px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-[#E5E5E5]">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Stamps</p>
              <p className="text-lg md:text-xl font-fredoka font-bold">{stats.totalCheckedIn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {badges.map((badge) => (
          <PassportStamp
            key={badge.id}
            title={badge.title}
            icon={badge.icon}
            color={badge.color}
            isUnlocked={checkUnlocked(badge)}
            subtitle={badge.subtitle}
            isSecret={badge.isSecret}
            date={checkUnlocked(badge) ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
