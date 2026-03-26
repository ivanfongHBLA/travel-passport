import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { MapPin, Search, Loader2, Copy, Check, Globe, Utensils, Landmark, TreePine, Building2, Landmark as Unesco, Map as MapIcon, LayoutGrid, Map as MapViewIcon, Star, Award, CheckCircle2, Image as ImageIcon, X, Camera, Flag, Mountain, Trees, Waves, Plane, Anchor, Sprout, Soup, Footprints, Plus, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { extractTravelData, TravelData, Place } from './services/geminiService';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, db, collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, where, deleteDoc, User, handleFirestoreError, OperationType } from './firebase';

interface LocalPlace extends Place {
  checkedIn?: boolean;
  ownerUid?: string;
  updatedAt?: string;
}

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for special categories (Stamping Style)
const createCustomIcon = (color: string, isChecked: boolean, svgContent: string) => {
  const stampColor = color;
  const rotation = Math.random() * 16 - 8;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: transparent;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid ${stampColor};
        border-radius: 10px;
        transform: rotate(${rotation}deg);
        opacity: ${isChecked ? '0.95' : '0.45'};
        filter: ${isChecked ? 'contrast(1.4) brightness(0.8)' : 'contrast(0.8) brightness(1.1) grayscale(0.2)'};
        position: relative;
        color: ${stampColor};
        box-shadow: 2px 2px 0px ${stampColor}22;
      ">
        ${svgContent.replace(/stroke="[^"]*"/g, `stroke="currentColor"`).replace(/fill="[^"]*"/g, 'fill="none"')}
        <div style="
          position: absolute;
          inset: 0;
          opacity: ${isChecked ? '0.2' : '0.1'};
          pointer-events: none;
          background-image: radial-gradient(${stampColor} 1px, transparent 0);
          background-size: 4px 4px;
        "></div>
        ${isChecked ? `<div style="position: absolute; top: -10px; right: -10px; background: ${stampColor}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: bold;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

const FlagIcon = (flagCode: string, isChecked: boolean) => {
  const stampColor = '#1A1A1A';
  const rotation = Math.random() * 12 - 6;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: transparent;
        width: 42px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid ${stampColor};
        border-radius: 6px;
        transform: rotate(${rotation}deg);
        opacity: ${isChecked ? '0.95' : '0.45'};
        filter: ${isChecked ? 'contrast(1.2) brightness(0.9)' : 'contrast(0.9) brightness(1.1) grayscale(0.4)'};
        position: relative;
        box-shadow: 2px 2px 0px ${stampColor}22;
      ">
        <img src="https://flagcdn.com/w80/${flagCode.toLowerCase()}.png" 
             style="width: 30px; height: auto; border-radius: 2px; filter: contrast(1.2) saturate(${isChecked ? '1' : '0.4'});" 
             referrerpolicy="no-referrer" />
        <div style="
          position: absolute;
          inset: 0;
          opacity: 0.1;
          pointer-events: none;
          background-image: radial-gradient(${stampColor} 1px, transparent 0);
          background-size: 3px 3px;
        "></div>
        ${isChecked ? `<div style="position: absolute; top: -10px; right: -10px; background: ${stampColor}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
      </div>
    `,
    iconSize: [46, 36],
    iconAnchor: [23, 18],
  });
};

const MichelinIcon = (isChecked: boolean) => {
  const stampColor = '#DC2626';
  const rotation = Math.random() * 20 - 10;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: transparent;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 5px solid ${stampColor};
        border-radius: 12px;
        transform: rotate(${rotation}deg);
        opacity: ${isChecked ? '0.95' : '0.45'};
        filter: ${isChecked ? 'contrast(1.4) brightness(0.8)' : 'contrast(0.9) brightness(1.1) grayscale(0.3)'};
        position: relative;
        color: ${stampColor};
        box-shadow: 2px 2px 0px ${stampColor}22;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div style="
          position: absolute;
          inset: 0;
          opacity: 0.2;
          pointer-events: none;
          background-image: radial-gradient(${stampColor} 1px, transparent 0);
          background-size: 5px 5px;
        "></div>
        ${isChecked ? `<div style="position: absolute; top: -10px; right: -10px; background: ${stampColor}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const UnescoIcon = (isChecked: boolean) => {
  const stampColor = '#2563EB';
  const rotation = Math.random() * 16 - 8;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: transparent;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 5px solid ${stampColor};
        border-radius: 50%;
        transform: rotate(${rotation}deg);
        opacity: ${isChecked ? '0.95' : '0.45'};
        filter: ${isChecked ? 'contrast(1.4) brightness(0.8)' : 'contrast(0.9) brightness(1.1) grayscale(0.3)'};
        position: relative;
        color: ${stampColor};
        box-shadow: 2px 2px 0px ${stampColor}22;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 18 0"/><path d="m5 21 0-7"/><path d="m9 21 0-7"/><path d="m15 21 0-7"/><path d="m19 21 0-7"/><path d="m3 7 9-4 9 4"/><path d="m3 10 18 0"/></svg>
        <div style="
          position: absolute;
          inset: 0;
          opacity: 0.15;
          pointer-events: none;
          background-image: radial-gradient(${stampColor} 1px, transparent 0);
          background-size: 4px 4px;
        "></div>
        ${isChecked ? `<div style="position: absolute; top: -10px; right: -10px; background: ${stampColor}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const PhotoIcon = (imageUrl: string, isChecked: boolean) => {
  const stampColor = isChecked ? '#059669' : '#1A1A1A';
  const rotation = Math.random() * 12 - 6;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: white;
        width: 52px;
        height: 52px;
        padding: 4px;
        border: 4px solid ${stampColor};
        border-radius: 8px;
        transform: rotate(${rotation}deg);
        opacity: ${isChecked ? '1' : '0.6'};
        filter: ${isChecked ? 'contrast(1.1) brightness(0.95)' : 'contrast(0.9) brightness(1.1) grayscale(0.2)'};
        position: relative;
        box-shadow: 4px 4px 0px ${stampColor}22;
      ">
        <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
        <div style="
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-image: radial-gradient(${stampColor} 1px, transparent 0);
          background-size: 4px 4px;
        "></div>
        ${isChecked ? `<div style="position: absolute; top: -10px; right: -10px; background: ${stampColor}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white; display: flex; align-items: center; justify-content: center; z-index: 20; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [inputText, setInputText] = useState(() => {
    return localStorage.getItem('inputText') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<TravelData | null>(null);
  const [persistentPlaces, setPersistentPlaces] = useState<LocalPlace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(() => {
    return (localStorage.getItem('viewMode') as 'grid' | 'map') || 'grid';
  });
  const [checkedInPlaces, setCheckedInPlaces] = useState<Set<string>>(new Set());
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('activeCategories');
    const categories = ['Country', 'City', 'Architecture', 'Park', 'Scenery', 'Michelin Restaurant', 'UNESCO Site', 'Diving Site', 'Museum', 'Airport', 'Port', 'Botanical Park', 'Food', 'Jogging Spot', 'Other'];
    return saved ? new Set(JSON.parse(saved)) : new Set(categories);
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync Data from Firestore
  useEffect(() => {
    if (!isAuthReady || !user) {
      setPersistentPlaces([]);
      setCheckedInPlaces(new Set());
      return;
    }

    const placesRef = collection(db, `users/${user.uid}/places`);
    const unsubscribe = onSnapshot(placesRef, (snapshot) => {
      const places: LocalPlace[] = [];
      const checkedIn = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data() as LocalPlace;
        places.push(data);
        if (data.checkedIn) {
          checkedIn.add(data.name);
        }
      });
      setPersistentPlaces(places);
      setCheckedInPlaces(checkedIn);
    }, (err) => {
      // Ignore initial permission errors if rules are still deploying
      if (err.code !== 'permission-denied') {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}/places`);
      }
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Initialize user doc
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => auth.signOut();

  useEffect(() => {
    localStorage.setItem('inputText', inputText);
  }, [inputText]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (extractedData) {
      localStorage.setItem('extractedData', JSON.stringify(extractedData));
    } else {
      localStorage.removeItem('extractedData');
    }
  }, [extractedData]);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await extractTravelData(inputText);
      setExtractedData(data);
      if (data.places.length > 0) {
        setViewMode('map');
      }
    } catch (err) {
      setError('Failed to extract travel data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckIn = async (place: LocalPlace) => {
    if (!user) {
      setError('Please login to save your progress!');
      return;
    }

    const isCheckingIn = !checkedInPlaces.has(place.name);
    const placeId = place.name.replace(/[^a-zA-Z0-9]/g, '_');
    const placeRef = doc(db, `users/${user.uid}/places`, placeId);

    try {
      await setDoc(placeRef, {
        ...place,
        checkedIn: isCheckingIn,
        ownerUid: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/places/${placeId}`);
    }
  };

  const handleImageUpload = async (placeName: string, e: ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const placeId = placeName.replace(/[^a-zA-Z0-9]/g, '_');
      const placeRef = doc(db, `users/${user.uid}/places`, placeId);
      
      try {
        await setDoc(placeRef, { image: base64String }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/places/${placeId}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = async (placeName: string) => {
    if (!user) return;
    const placeId = placeName.replace(/[^a-zA-Z0-9]/g, '_');
    const placeRef = doc(db, `users/${user.uid}/places`, placeId);
    
    try {
      await setDoc(placeRef, { image: null }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/places/${placeId}`);
    }
  };

  const copyToClipboard = () => {
    if (!extractedData) return;
    const dataToCopy = {
      ...extractedData,
      places: extractedData.places.map(p => ({
        ...p,
        checkedIn: checkedInPlaces.has(p.name)
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasData = extractedData && extractedData.places.length > 0;

  // Combine current extraction with persistent checked-in places
  const allMapPlaces = useMemo(() => {
    const currentPlaces = extractedData?.places || [];
    const map = new Map<string, LocalPlace>();
    
    // Add persistent places first
    persistentPlaces.forEach(p => map.set(p.name, p));
    // Current extraction overrides persistent if same name
    currentPlaces.forEach(p => map.set(p.name, p));
    
    return Array.from(map.values()).filter(p => activeCategories.has(p.category));
  }, [extractedData, persistentPlaces, activeCategories]);

  const toggleCategory = (category: string) => {
    const newActive = new Set(activeCategories);
    if (newActive.has(category)) {
      newActive.delete(category);
    } else {
      newActive.add(category);
    }
    setActiveCategories(newActive);
  };

  const CATEGORY_CONFIG: Record<string, { icon: any, color: string }> = {
    'Country': { icon: Flag, color: '#1A1A1A' },
    'City': { icon: Globe, color: '#4B5563' },
    'Architecture': { icon: Building2, color: '#7C3AED' },
    'Park': { icon: Trees, color: '#059669' },
    'Scenery': { icon: Mountain, color: '#2563EB' },
    'Michelin Restaurant': { icon: Star, color: '#DC2626' },
    'UNESCO Site': { icon: Unesco, color: '#2563EB' },
    'Diving Site': { icon: Waves, color: '#0891B2' },
    'Museum': { icon: Landmark, color: '#D97706' },
    'Airport': { icon: Plane, color: '#6366F1' },
    'Port': { icon: Anchor, color: '#0EA5E9' },
    'Botanical Park': { icon: Sprout, color: '#10B981' },
    'Food': { icon: Soup, color: '#F59E0B' },
    'Jogging Spot': { icon: Footprints, color: '#EC4899' },
    'Other': { icon: MapIcon, color: '#1A1A1A' },
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-[#1A1A1A]">
      {/* Header */}
      <header className="py-8 px-6 bg-[#FFD600] border-b-4 border-[#1A1A1A] cartoon-shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl cartoon-border flex items-center justify-center rotate-[-3deg] cartoon-shadow-sm">
              <Globe className="w-8 h-8 text-[#1A1A1A]" />
            </div>
            <div>
              <h1 className="text-4xl font-fredoka font-bold tracking-tight text-[#1A1A1A]">Travel Passport</h1>
              <p className="text-sm font-medium opacity-80">Your sticker book of global adventures!</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl cartoon-border cartoon-shadow-sm">
                <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl cartoon-border" alt="Profile" referrerpolicy="no-referrer" />
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-[#1A1A1A] leading-tight">{user.displayName}</p>
                  <button onClick={handleLogout} className="text-[10px] font-bold text-[#DC2626] uppercase hover:underline">Logout</button>
                </div>
                <button onClick={handleLogout} className="sm:hidden text-[#DC2626]"><LogOut className="w-5 h-5" /></button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl font-fredoka font-bold text-sm cartoon-border cartoon-shadow-sm hover:translate-y-[-2px] transition-all active:translate-y-[2px] active:shadow-none"
              >
                <LogIn className="w-4 h-4" />
                Login with Google
              </button>
            )}
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl cartoon-border cartoon-shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-fredoka font-bold text-sm transition-all ${
                  viewMode === 'grid' ? 'bg-[#FFD600] text-[#1A1A1A] cartoon-border' : 'text-[#9E9E9E] hover:bg-[#F5F5F5]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Collection
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-fredoka font-bold text-sm transition-all ${
                  viewMode === 'map' ? 'bg-[#FFD600] text-[#1A1A1A] cartoon-border' : 'text-[#9E9E9E] hover:bg-[#F5F5F5]'
                }`}
              >
                <MapViewIcon className="w-4 h-4" />
                Map View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filters */}
      <div className="bg-white border-b-2 border-[#1A1A1A] py-4 sticky top-[116px] z-40 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E] whitespace-nowrap">Filter:</span>
            <button
              onClick={() => setActiveCategories(new Set(Object.keys(CATEGORY_CONFIG)))}
              className="text-[10px] font-bold uppercase tracking-tighter text-[#1A1A1A] hover:underline whitespace-nowrap"
            >
              All
            </button>
            <span className="text-[10px] text-[#E5E5E5]">|</span>
            <button
              onClick={() => setActiveCategories(new Set())}
              className="text-[10px] font-bold uppercase tracking-tighter text-[#1A1A1A] hover:underline whitespace-nowrap"
            >
              None
            </button>
          </div>
          {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
            const isActive = activeCategories.has(cat);
            const Icon = config.icon;
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-fredoka font-bold transition-all whitespace-nowrap cartoon-border-sm ${
                  isActive 
                    ? 'bg-white shadow-sm' 
                    : 'bg-[#F5F5F5] text-[#9E9E9E] opacity-60 grayscale'
                }`}
                style={{ 
                  borderColor: isActive ? config.color : '#E5E5E5',
                  color: isActive ? config.color : '#9E9E9E'
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[40px] cartoon-border cartoon-shadow rotate-[-1deg]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center cartoon-border">
                  <Search className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <h2 className="text-xl font-fredoka font-bold">Log Your Journey</h2>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Where have you been? (e.g., 'I visited Tokyo, the Eiffel Tower, and ate at Noma in Copenhagen')"
                    className="w-full h-48 p-6 bg-[#F9F9F9] rounded-3xl cartoon-border focus:ring-4 focus:ring-[#FFD600]/30 focus:outline-none text-sm font-medium resize-none placeholder:text-[#9E9E9E]"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-mono text-[#9E9E9E]">
                    Gemini AI Powered
                  </div>
                </div>
                
                <button
                  onClick={handleExtract}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full py-5 bg-[#FFD600] text-[#1A1A1A] rounded-3xl font-fredoka font-bold text-lg cartoon-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Stamping Passport...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-6 h-6" />
                      Add to Passport
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-500 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-8 min-h-[600px]">
            <AnimatePresence mode="wait">
              {!extractedData && !isLoading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-[#E5E5E5]"
                >
                  <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                    <Globe className="text-[#9E9E9E] w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ready to Extract</h3>
                  <p className="text-[#9E9E9E] text-sm max-w-xs">
                    Paste your travel text on the left and click extract to see structured data and map visualization.
                  </p>
                </motion.div>
              ) : isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-[#E5E5E5]"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#F5F5F5] border-t-[#1A1A1A] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#1A1A1A]" />
                    </div>
                  </div>
                  <p className="mt-6 text-sm font-medium text-[#1A1A1A] animate-pulse">
                    Geocoding and Standardizing...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9E9E9E]">
                      {viewMode === 'grid' ? 'Extracted Entities' : 'Map Visualization'}
                    </h2>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-xs font-medium text-[#9E9E9E] hover:text-[#1A1A1A] transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>

                  <div className="flex-1 bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-sm">
                    {viewMode === 'map' ? (
                      <div className="w-full h-full min-h-[500px] relative z-0">
                        <MapContainer
                          center={[extractedData.center.lat, extractedData.center.lng]}
                          zoom={4}
                          scrollWheelZoom={true}
                          className="w-full h-full"
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                          />
                          <ChangeView center={[extractedData.center.lat, extractedData.center.lng]} />
                          {allMapPlaces.map((place, idx) => {
                            const isChecked = checkedInPlaces.has(place.name);
                            let markerIcon: any;
                            
                            if (place.image) {
                              markerIcon = PhotoIcon(place.image, isChecked);
                            } else if (place.category === 'Michelin Restaurant') {
                              markerIcon = MichelinIcon(isChecked);
                            } else if (place.category === 'UNESCO Site') {
                              markerIcon = UnescoIcon(isChecked);
                            } else if (place.category === 'Country') {
                              markerIcon = FlagIcon(place.countryCode, isChecked);
                            } else {
                              let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
                              let color = '#1A1A1A';

                              if (place.category === 'City') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';
                                color = '#4B5563';
                              } else if (place.category === 'Architecture') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>';
                                color = '#7C3AED';
                              } else if (place.category === 'Park') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 2.2 1 4.2 2.5 5.5l-.5 4.5h12l-.5-4.5c1.5-1.3 2.5-3.3 2.5-5.5Z"/><path d="M12 10v10"/></svg>';
                                color = '#059669';
                              } else if (place.category === 'Scenery') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>';
                                color = '#2563EB';
                              } else if (place.category === 'Diving Site') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>';
                                color = '#0891B2';
                              } else if (place.category === 'Museum') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 18 0"/><path d="m5 21 0-7"/><path d="m9 21 0-7"/><path d="m15 21 0-7"/><path d="m19 21 0-7"/><path d="m3 7 9-4 9 4"/><path d="m3 10 18 0"/></svg>';
                                color = '#D97706';
                              } else if (place.category === 'Airport') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
                                color = '#6366F1';
                              } else if (place.category === 'Port') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="m5 12-2-2 10-10 10 10-2 2"/><path d="M2 17h20"/><path d="M10 16v4a2 2 0 0 0 4 0v-4"/></svg>';
                                color = '#0EA5E9';
                              } else if (place.category === 'Botanical Park') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-4"/><path d="M12 18c-3.5 0-6-2.5-6-6s2.5-6 6-6 6 2.5 6 6-2.5 6-6 6Z"/><path d="M12 12c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3Z"/><path d="M12 12c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3Z"/></svg>';
                                color = '#10B981';
                              } else if (place.category === 'Food') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 21h10"/><path d="M12 7c1-2 3-3 5-2"/><path d="M12 7c-1-2-3-3-5-2"/><path d="M12 7V3"/></svg>';
                                color = '#F59E0B';
                              } else if (place.category === 'Jogging Spot') {
                                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 5.88 9 8.5 9s4.5 2.5 4.5 4.62V16"/><path d="M1.5 13c.5-1 1.5-2 3-2s3 1 3.5 2"/><path d="M16 13c.5-1 1.5-2 3-2s3 1 3.5 2"/><path d="M12 16h10"/><path d="M2 16h10"/><path d="M12 9V5"/><path d="M9 5h6"/></svg>';
                                color = '#EC4899';
                              }

                              markerIcon = createCustomIcon(color, isChecked, svg);
                            }

                            return (
                              <Marker key={idx} position={[place.lat, place.lng]} icon={markerIcon}>
                                <Popup>
                                  <div className="p-2 min-w-[150px]">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <h4 className="font-bold text-sm leading-tight">{place.name}</h4>
                                      {isChecked && (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                        place.category === 'Michelin Restaurant' ? 'bg-red-50 text-red-600' :
                                        place.category === 'UNESCO Site' ? 'bg-blue-50 text-blue-600' :
                                        'bg-[#F5F5F5] text-[#9E9E9E]'
                                      }`}>
                                        {place.category}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <img 
                                          src={`https://flagcdn.com/w20/${place.countryCode.toLowerCase()}.png`} 
                                          alt={place.country}
                                          className="w-3 h-2.5 object-cover rounded-[1px] shadow-sm"
                                          referrerPolicy="no-referrer"
                                        />
                                        <span className="text-[10px] text-[#9E9E9E] font-medium">
                                          {place.country}
                                        </span>
                                      </div>
                                    </div>
                                    {place.metadata && (
                                      <p className="text-[10px] bg-[#F5F5F5] p-1.5 rounded mb-3 text-[#666]">{place.metadata}</p>
                                    )}
                                    
                                    {isChecked && (
                                      <div className="mb-3">
                                        {place.image ? (
                                          <div className="relative group">
                                            <img 
                                              src={place.image} 
                                              alt="Memory" 
                                              className="w-full h-24 object-cover rounded-lg shadow-sm"
                                            />
                                            <button 
                                              onClick={() => removeImage(place.name)}
                                              className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <X className="w-2 h-2 text-red-500" />
                                            </button>
                                          </div>
                                        ) : (
                                          <label className="flex items-center justify-center gap-2 py-2 border border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F9F9F9] transition-all">
                                            <input 
                                              type="file" 
                                              className="hidden" 
                                              accept="image/*"
                                              onChange={(e) => handleImageUpload(place.name, e)}
                                            />
                                            <Camera className="w-3 h-3 text-[#9E9E9E]" />
                                            <span className="text-[9px] text-[#9E9E9E]">Add Memory</span>
                                          </label>
                                        )}
                                      </div>
                                    )}

                                    <button
                                      onClick={() => toggleCheckIn(place)}
                                      className={`w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                                        isChecked
                                          ? 'bg-green-50 text-green-600 border border-green-100'
                                          : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                                      }`}
                                    >
                                      {isChecked ? 'Checked In' : 'Check In'}
                                    </button>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          })}
                        </MapContainer>
                      </div>
                    ) : (
                      <div className="p-6 overflow-y-auto max-h-[600px] space-y-8">
                        {/* Countries Summary */}
                        <div className="bg-[#F9F9F9] p-6 rounded-3xl border border-[#E5E5E5]">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold tracking-tight">Countries Visited</h3>
                            <span className="text-[10px] font-mono bg-white border border-[#E5E5E5] px-2 py-0.5 rounded text-[#9E9E9E]">
                              {new Set(allMapPlaces.filter(p => checkedInPlaces.has(p.name)).map(p => p.countryCode)).size} Total
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {(Array.from(new Set(allMapPlaces.filter(p => checkedInPlaces.has(p.name)).map(p => JSON.stringify({ code: p.countryCode, name: p.country })))) as string[])
                              .map(s => JSON.parse(s) as { code: string, name: string })
                              .map((country, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-all">
                                  <img 
                                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} 
                                    alt={country.name}
                                    className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-xs font-semibold">{country.name}</span>
                                </div>
                              ))}
                            {checkedInPlaces.size === 0 && (
                              <p className="text-xs text-[#9E9E9E] italic">Check in to places to see your country collection grow!</p>
                            )}
                          </div>
                        </div>

                        {/* Visited Places Summary */}
                        {checkedInPlaces.size > 0 && (
                          <div className="bg-green-50/30 p-6 rounded-3xl border border-green-100">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-sm font-bold tracking-tight text-green-800">Places Visited</h3>
                              <span className="text-[10px] font-mono bg-white border border-green-200 px-2 py-0.5 rounded text-green-600">
                                {checkedInPlaces.size} Total
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {allMapPlaces.filter(p => checkedInPlaces.has(p.name)).map((place, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-green-100 shadow-sm text-[11px] font-medium text-green-700">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  {place.name}
                                  <span className="text-[9px] opacity-50">• {place.category}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DataCard icon={Flag} title="Countries" items={allMapPlaces.filter(p => p.category === 'Country')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} />
                          <DataCard icon={Globe} title="Cities" items={allMapPlaces.filter(p => p.category === 'City')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} />
                          <DataCard icon={Building2} title="Architecture" items={allMapPlaces.filter(p => p.category === 'Architecture')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} />
                          <DataCard icon={Trees} title="Parks" items={allMapPlaces.filter(p => p.category === 'Park')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="blue" />
                          <DataCard icon={Mountain} title="Scenery" items={allMapPlaces.filter(p => p.category === 'Scenery')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="blue" />
                          <DataCard icon={Utensils} title="Michelin Restaurants" items={allMapPlaces.filter(p => p.category === 'Michelin Restaurant')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="red" />
                          <DataCard icon={Unesco} title="UNESCO Sites" items={allMapPlaces.filter(p => p.category === 'UNESCO Site')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="blue" />
                          <DataCard icon={Waves} title="Diving Sites" items={allMapPlaces.filter(p => p.category === 'Diving Site')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="blue" />
                          <DataCard icon={Plane} title="Airports" items={allMapPlaces.filter(p => p.category === 'Airport')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="blue" />
                          <DataCard icon={Anchor} title="Ports" items={allMapPlaces.filter(p => p.category === 'Port')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="blue" />
                          <DataCard icon={Sprout} title="Botanical Parks" items={allMapPlaces.filter(p => p.category === 'Botanical Park')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="green" />
                          <DataCard icon={Soup} title="Food Spots" items={allMapPlaces.filter(p => p.category === 'Food')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="orange" />
                          <DataCard icon={Footprints} title="Jogging Spots" items={allMapPlaces.filter(p => p.category === 'Jogging Spot')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} color="pink" />
                          <DataCard icon={Landmark} title="Museums" items={allMapPlaces.filter(p => p.category === 'Museum')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} />
                          <DataCard icon={MapIcon} title="Other Notable Places" items={allMapPlaces.filter(p => p.category === 'Other')} checkedIn={checkedInPlaces} onToggle={toggleCheckIn} onImageUpload={handleImageUpload} onRemoveImage={removeImage} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9E9E9E]">
            Powered by WaterWoodStudioIpoh
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-medium text-[#9E9E9E] hover:text-[#1A1A1A]">Documentation</a>
            <a href="#" className="text-xs font-medium text-[#9E9E9E] hover:text-[#1A1A1A]">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DataCard({ icon: Icon, title, items, checkedIn, onToggle, onImageUpload, onRemoveImage, color }: { icon: any, title: string, items: Place[], checkedIn: Set<string>, onToggle: (place: Place) => void, onImageUpload: (name: string, e: ChangeEvent<HTMLInputElement>) => void, onRemoveImage: (name: string) => void, color?: 'red' | 'blue' | 'green' | 'orange' | 'pink' }) {
  if (items.length === 0) return null;

  const stampColor = color === 'red' ? '#EF4444' : 
                    color === 'blue' ? '#3B82F6' : 
                    color === 'green' ? '#22C55E' : 
                    color === 'orange' ? '#F59E0B' : 
                    color === 'pink' ? '#EC4899' : '#1A1A1A';

  return (
    <div className={`p-6 rounded-[32px] cartoon-border cartoon-shadow transition-all ${
      color === 'red' ? 'bg-red-50/30' : 
      color === 'blue' ? 'bg-blue-50/30' : 
      color === 'green' ? 'bg-green-50/30' : 
      color === 'orange' ? 'bg-orange-50/30' : 
      color === 'pink' ? 'bg-pink-50/30' : 
      'bg-white'
    }`}>
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="w-14 h-14 flex items-center justify-center relative"
          style={{
            border: `4px solid ${stampColor}`,
            borderRadius: '8px',
            transform: `rotate(${Math.random() * 10 - 5}deg)`,
            opacity: 0.85,
            color: stampColor,
            boxShadow: `2px 2px 0px ${stampColor}22`
          }}
        >
          {color === 'red' ? <Star className="w-8 h-8" strokeWidth={2.5} /> : 
           color === 'blue' ? <Unesco className="w-8 h-8" strokeWidth={2.5} /> : 
           color === 'green' ? <Sprout className="w-8 h-8" strokeWidth={2.5} /> : 
           color === 'orange' ? <Soup className="w-8 h-8" strokeWidth={2.5} /> : 
           color === 'pink' ? <Footprints className="w-8 h-8" strokeWidth={2.5} /> : 
           <Icon className="w-8 h-8" strokeWidth={2.5} />}
          
          {/* Stamp Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden mix-blend-multiply">
            <div className="w-full h-full" style={{ backgroundImage: `radial-gradient(${stampColor} 1px, transparent 0)`, backgroundSize: '4px 4px' }}></div>
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-fredoka font-bold tracking-tight" style={{ color: stampColor }}>{title}</h3>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Official Stamp</span>
        </div>
        <div className="ml-auto text-xs font-fredoka font-bold bg-white cartoon-border px-3 py-1 rounded-xl">
          {items.length}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl cartoon-border transition-all flex flex-col gap-4 ${
              checkedIn.has(item.name) ? '' : 'bg-white'
            }`}
            style={{ 
              backgroundColor: checkedIn.has(item.name) ? `${stampColor}15` : 'white',
              borderColor: checkedIn.has(item.name) ? stampColor : '#E5E5E5'
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm" style={{ color: checkedIn.has(item.name) ? stampColor : '#1A1A1A' }}>{item.name}</span>
                  <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-2 py-0.5 rounded-lg cartoon-border-sm">
                    <img 
                      src={`https://flagcdn.com/w20/${item.countryCode.toLowerCase()}.png`} 
                      alt={item.country}
                      className="w-4 h-3 object-cover rounded-[1px]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-tighter">{item.countryCode}</span>
                  </div>
                </div>
                {item.metadata && <span className="text-[11px] text-[#9E9E9E] font-medium italic">{item.metadata}</span>}
              </div>
              <button
                onClick={() => onToggle(item)}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all cartoon-border`}
                style={{
                  backgroundColor: checkedIn.has(item.name) ? stampColor : '#F5F5F5',
                  color: checkedIn.has(item.name) ? 'white' : '#9E9E9E',
                  borderColor: checkedIn.has(item.name) ? stampColor : '#E5E5E5'
                }}
              >
                {checkedIn.has(item.name) ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>
            </div>

            {checkedIn.has(item.name) && (
              <div className="pt-4 border-t-2 border-dashed border-[#E5E5E5]">
                {item.image ? (
                  <div className="relative group">
                    <img 
                      src={item.image} 
                      alt="Memory" 
                      className="w-full h-40 object-cover rounded-2xl cartoon-border shadow-sm"
                    />
                    <button 
                      onClick={() => onRemoveImage(item.name)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full cartoon-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed border-[#E5E5E5] rounded-2xl cursor-pointer hover:border-[#FFD600] hover:bg-[#FFFBEB] transition-all group">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => onImageUpload(item.name, e)}
                    />
                    <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center group-hover:bg-[#FFD600] transition-colors">
                      <Camera className="w-5 h-5 text-[#9E9E9E] group-hover:text-[#1A1A1A]" />
                    </div>
                    <span className="text-xs font-fredoka font-bold text-[#9E9E9E] group-hover:text-[#1A1A1A]">Add Memory Sticker</span>
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
