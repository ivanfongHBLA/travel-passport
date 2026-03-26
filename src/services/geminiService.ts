import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Place {
  name: string;
  lat: number;
  lng: number;
  category: string;
  country: string;
  countryCode: string;
  metadata?: string;
  image?: string; // Base64 encoded image memory
}

export interface TravelData {
  places: Place[];
  center: { lat: number; lng: number };
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    places: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Full, official name of the location." },
          lat: { type: Type.NUMBER, description: "Approximate latitude." },
          lng: { type: Type.NUMBER, description: "Approximate longitude." },
          category: { type: Type.STRING, enum: ["Country", "City", "Architecture", "Park", "Botanical Park", "Scenery", "Michelin Restaurant", "UNESCO Site", "Diving Site", "Airport", "Port", "Museum", "Food", "Jogging Spot", "Other"] },
          country: { type: Type.STRING, description: "The country where the place is located." },
          countryCode: { type: Type.STRING, description: "The ISO 3166-1 alpha-2 country code (e.g., 'FR' for France, 'MY' for Malaysia)." },
          metadata: { type: Type.STRING, description: "Additional info like Michelin award, UNESCO status, food specialty, or run distance." }
        },
        required: ["name", "lat", "lng", "category", "country", "countryCode"]
      }
    },
    center: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER }
      },
      required: ["lat", "lng"]
    }
  },
  required: ["places", "center"]
};

export async function extractTravelData(text: string): Promise<TravelData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: {
      systemInstruction: `You are a precise Travel Data Extraction Assistant for a map-based collector app. Your task is to analyze text provided by users and extract specific travel destinations, venues, and experiences they have visited or plan to visit.

Crucially, you must extract the FULL, OFFICIAL NAME of the location, its APPROXIMATE COORDINATES (lat/lng), and the COUNTRY it is in so it can be accurately pinpointed and categorized on a map.

Rules:
1. Specificity: Only extract specific, named places (e.g., "Hyde Park", not "a nice park").
2. Michelin Formatting: For Michelin restaurants, capture the name and the specific award mentioned (e.g., "1 Star", "3 Stars", "Bib Gourmand"). If no specific star/award is mentioned but it is noted as Michelin, use "Mentioned" in the metadata field.
3. Food Spots: Extract famous cafes, street food stalls, or local restaurants that aren't necessarily Michelin-rated but are notable. Use the "Food" category for these.
4. Jogging Spots: Extract specific parks, trails, or routes mentioned for running or jogging. Use the "Jogging Spot" category.
5. Hierarchy: If a place fits multiple categories (e.g., an architectural marvel that is also a UNESCO site), place it in the most specific or prestigious category (UNESCO > Architecture > Other).
6. Autocorrect and Standardize: Users will frequently misspell locations or use colloquial names. You must correct all typos and translate local/slang names into their official, globally recognized names (e.g., change 'K L' to 'Kuala Lumpur', or 'tamman tasek taipin' to 'Taiping Lake Gardens') to ensure accurate map geocoding.
7. Contextual Clues: Use the surrounding text to deduce the correct spelling of a place. If a user mentions a poorly spelled park or heritage building next to a specific city, ensure the corrected name actually exists in that city.
8. Coordinates: Provide the most accurate coordinates possible for each place.
9. Country: Always identify the country for each place.
10. Country Code: Provide the ISO 3166-1 alpha-2 country code (e.g., 'FR' for France, 'MY' for Malaysia) for each place.
11. Center: Provide a central coordinate that encompasses all extracted places for initial map centering.`,
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  });

  try {
    return JSON.parse(response.text || "{}") as TravelData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to extract travel data.");
  }
}
