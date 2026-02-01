/**
 * US States Data
 * 
 * Contains all 50 US states with:
 * - Official DMV appointment URLs
 * - Passport agency locations
 * - Geographic coordinates for nearby state calculation
 * - Neighboring states for expanded search
 */

export type USState = {
  code: string;           // State abbreviation (e.g., "CA")
  name: string;           // Full name (e.g., "California")
  lat: number;            // Latitude for distance calculation
  lng: number;            // Longitude for distance calculation
  neighbors: string[];    // Adjacent state codes
  dmvUrl: string;         // Official DMV appointment URL
  passportUrl: string | null;  // Passport agency URL if available
  visaUrl: string | null;      // Visa services URL if available
};

export const US_STATES: USState[] = [
  {
    code: "AL",
    name: "Alabama",
    lat: 32.806671,
    lng: -86.791130,
    neighbors: ["FL", "GA", "MS", "TN"],
    dmvUrl: "https://www.alabamainteractive.org/dls/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "AK",
    name: "Alaska",
    lat: 61.370716,
    lng: -152.404419,
    neighbors: [],
    dmvUrl: "https://doa.alaska.gov/dmv/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "AZ",
    name: "Arizona",
    lat: 33.729759,
    lng: -111.431221,
    neighbors: ["CA", "CO", "NV", "NM", "UT"],
    dmvUrl: "https://azmvdnow.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "AR",
    name: "Arkansas",
    lat: 34.969704,
    lng: -92.373123,
    neighbors: ["LA", "MO", "MS", "OK", "TN", "TX"],
    dmvUrl: "https://www.dfa.arkansas.gov/driver-services/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "CA",
    name: "California",
    lat: 36.116203,
    lng: -119.681564,
    neighbors: ["AZ", "NV", "OR"],
    dmvUrl: "https://www.dmv.ca.gov/portal/appointments/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/san-francisco.html",
    visaUrl: "https://www.cgisf.gov.in/page/visa-services/",
  },
  {
    code: "CO",
    name: "Colorado",
    lat: 39.059811,
    lng: -105.311104,
    neighbors: ["AZ", "KS", "NE", "NM", "OK", "UT", "WY"],
    dmvUrl: "https://mydmv.colorado.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "CT",
    name: "Connecticut",
    lat: 41.597782,
    lng: -72.755371,
    neighbors: ["MA", "NY", "RI"],
    dmvUrl: "https://portal.ct.gov/dmv/appointment/appointment",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "DE",
    name: "Delaware",
    lat: 39.318523,
    lng: -75.507141,
    neighbors: ["MD", "NJ", "PA"],
    dmvUrl: "https://www.dmv.de.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "FL",
    name: "Florida",
    lat: 27.766279,
    lng: -81.686783,
    neighbors: ["AL", "GA"],
    dmvUrl: "https://www.flhsmv.gov/appointments/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/miami.html",
    visaUrl: null,
  },
  {
    code: "GA",
    name: "Georgia",
    lat: 33.040619,
    lng: -83.643074,
    neighbors: ["AL", "FL", "NC", "SC", "TN"],
    dmvUrl: "https://dds.georgia.gov/appointments",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/atlanta.html",
    visaUrl: null,
  },
  {
    code: "HI",
    name: "Hawaii",
    lat: 21.094318,
    lng: -157.498337,
    neighbors: [],
    dmvUrl: "https://hidot.hawaii.gov/highways/dmv/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/honolulu.html",
    visaUrl: null,
  },
  {
    code: "ID",
    name: "Idaho",
    lat: 44.240459,
    lng: -114.478828,
    neighbors: ["MT", "NV", "OR", "UT", "WA", "WY"],
    dmvUrl: "https://itd.idaho.gov/dmv/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "IL",
    name: "Illinois",
    lat: 40.349457,
    lng: -88.986137,
    neighbors: ["IN", "IA", "KY", "MO", "WI"],
    dmvUrl: "https://www.ilsos.gov/appointments/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/chicago.html",
    visaUrl: null,
  },
  {
    code: "IN",
    name: "Indiana",
    lat: 39.849426,
    lng: -86.258278,
    neighbors: ["IL", "KY", "MI", "OH"],
    dmvUrl: "https://www.in.gov/bmv/2338.htm",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "IA",
    name: "Iowa",
    lat: 42.011539,
    lng: -93.210526,
    neighbors: ["IL", "MN", "MO", "NE", "SD", "WI"],
    dmvUrl: "https://iowadot.gov/mvd/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "KS",
    name: "Kansas",
    lat: 38.526600,
    lng: -96.726486,
    neighbors: ["CO", "MO", "NE", "OK"],
    dmvUrl: "https://www.ksrevenue.gov/dovindex.html",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "KY",
    name: "Kentucky",
    lat: 37.668140,
    lng: -84.670067,
    neighbors: ["IL", "IN", "MO", "OH", "TN", "VA", "WV"],
    dmvUrl: "https://drive.ky.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "LA",
    name: "Louisiana",
    lat: 31.169546,
    lng: -91.867805,
    neighbors: ["AR", "MS", "TX"],
    dmvUrl: "https://expresslane.org/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/new-orleans.html",
    visaUrl: null,
  },
  {
    code: "ME",
    name: "Maine",
    lat: 44.693947,
    lng: -69.381927,
    neighbors: ["NH"],
    dmvUrl: "https://www.maine.gov/sos/bmv/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "MD",
    name: "Maryland",
    lat: 39.063946,
    lng: -76.802101,
    neighbors: ["DE", "PA", "VA", "WV"],
    dmvUrl: "https://mva.maryland.gov/Pages/default.aspx",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "MA",
    name: "Massachusetts",
    lat: 42.230171,
    lng: -71.530106,
    neighbors: ["CT", "NH", "NY", "RI", "VT"],
    dmvUrl: "https://www.mass.gov/orgs/massachusetts-registry-of-motor-vehicles",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/boston.html",
    visaUrl: null,
  },
  {
    code: "MI",
    name: "Michigan",
    lat: 43.326618,
    lng: -84.536095,
    neighbors: ["IN", "OH", "WI"],
    dmvUrl: "https://dsvsesvc.sos.state.mi.us/TAP/_/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/detroit.html",
    visaUrl: null,
  },
  {
    code: "MN",
    name: "Minnesota",
    lat: 45.694454,
    lng: -93.900192,
    neighbors: ["IA", "ND", "SD", "WI"],
    dmvUrl: "https://dps.mn.gov/divisions/dvs/Pages/default.aspx",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/minneapolis.html",
    visaUrl: null,
  },
  {
    code: "MS",
    name: "Mississippi",
    lat: 32.741646,
    lng: -89.678696,
    neighbors: ["AL", "AR", "LA", "TN"],
    dmvUrl: "https://www.dps.state.ms.us/driver-services/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "MO",
    name: "Missouri",
    lat: 38.456085,
    lng: -92.288368,
    neighbors: ["AR", "IL", "IA", "KS", "KY", "NE", "OK", "TN"],
    dmvUrl: "https://dor.mo.gov/driver-license/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "MT",
    name: "Montana",
    lat: 46.921925,
    lng: -110.454353,
    neighbors: ["ID", "ND", "SD", "WY"],
    dmvUrl: "https://dojmt.gov/driving/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "NE",
    name: "Nebraska",
    lat: 41.125370,
    lng: -98.268082,
    neighbors: ["CO", "IA", "KS", "MO", "SD", "WY"],
    dmvUrl: "https://dmv.nebraska.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "NV",
    name: "Nevada",
    lat: 38.313515,
    lng: -117.055374,
    neighbors: ["AZ", "CA", "ID", "OR", "UT"],
    dmvUrl: "https://dmv.nv.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "NH",
    name: "New Hampshire",
    lat: 43.452492,
    lng: -71.563896,
    neighbors: ["MA", "ME", "VT"],
    dmvUrl: "https://www.nh.gov/dmv/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "NJ",
    name: "New Jersey",
    lat: 40.298904,
    lng: -74.521011,
    neighbors: ["DE", "NY", "PA"],
    dmvUrl: "https://www.state.nj.us/mvc/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "NM",
    name: "New Mexico",
    lat: 34.840515,
    lng: -106.248482,
    neighbors: ["AZ", "CO", "OK", "TX", "UT"],
    dmvUrl: "https://www.mvd.newmexico.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "NY",
    name: "New York",
    lat: 42.165726,
    lng: -74.948051,
    neighbors: ["CT", "MA", "NJ", "PA", "VT"],
    dmvUrl: "https://dmv.ny.gov/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/new-york.html",
    visaUrl: null,
  },
  {
    code: "NC",
    name: "North Carolina",
    lat: 35.630066,
    lng: -79.806419,
    neighbors: ["GA", "SC", "TN", "VA"],
    dmvUrl: "https://www.ncdot.gov/dmv/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "ND",
    name: "North Dakota",
    lat: 47.528912,
    lng: -99.784012,
    neighbors: ["MN", "MT", "SD"],
    dmvUrl: "https://www.dot.nd.gov/divisions/driverslicense/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "OH",
    name: "Ohio",
    lat: 40.388783,
    lng: -82.764915,
    neighbors: ["IN", "KY", "MI", "PA", "WV"],
    dmvUrl: "https://www.bmv.ohio.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "OK",
    name: "Oklahoma",
    lat: 35.565342,
    lng: -96.928917,
    neighbors: ["AR", "CO", "KS", "MO", "NM", "TX"],
    dmvUrl: "https://oklahoma.gov/dps/driver-license-services.html",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "OR",
    name: "Oregon",
    lat: 44.572021,
    lng: -122.070938,
    neighbors: ["CA", "ID", "NV", "WA"],
    dmvUrl: "https://www.oregon.gov/odot/dmv/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "PA",
    name: "Pennsylvania",
    lat: 40.590752,
    lng: -77.209755,
    neighbors: ["DE", "MD", "NJ", "NY", "OH", "WV"],
    dmvUrl: "https://www.dmv.pa.gov/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/philadelphia.html",
    visaUrl: null,
  },
  {
    code: "RI",
    name: "Rhode Island",
    lat: 41.680893,
    lng: -71.511780,
    neighbors: ["CT", "MA"],
    dmvUrl: "https://dmv.ri.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "SC",
    name: "South Carolina",
    lat: 33.856892,
    lng: -80.945007,
    neighbors: ["GA", "NC"],
    dmvUrl: "https://www.scdmvonline.com/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "SD",
    name: "South Dakota",
    lat: 44.299782,
    lng: -99.438828,
    neighbors: ["IA", "MN", "MT", "ND", "NE", "WY"],
    dmvUrl: "https://dps.sd.gov/driver-licensing",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "TN",
    name: "Tennessee",
    lat: 35.747845,
    lng: -86.692345,
    neighbors: ["AL", "AR", "GA", "KY", "MO", "MS", "NC", "VA"],
    dmvUrl: "https://www.tn.gov/safety/driver-services.html",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "TX",
    name: "Texas",
    lat: 31.054487,
    lng: -97.563461,
    neighbors: ["AR", "LA", "NM", "OK"],
    dmvUrl: "https://www.dps.texas.gov/section/driver-license",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/dallas.html",
    visaUrl: null,
  },
  {
    code: "UT",
    name: "Utah",
    lat: 40.150032,
    lng: -111.862434,
    neighbors: ["AZ", "CO", "ID", "NV", "NM", "WY"],
    dmvUrl: "https://dmv.utah.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "VT",
    name: "Vermont",
    lat: 44.045876,
    lng: -72.710686,
    neighbors: ["MA", "NH", "NY"],
    dmvUrl: "https://dmv.vermont.gov/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "VA",
    name: "Virginia",
    lat: 37.769337,
    lng: -78.169968,
    neighbors: ["KY", "MD", "NC", "TN", "WV"],
    dmvUrl: "https://www.dmv.virginia.gov/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/washington.html",
    visaUrl: null,
  },
  {
    code: "WA",
    name: "Washington",
    lat: 47.400902,
    lng: -121.490494,
    neighbors: ["ID", "OR"],
    dmvUrl: "https://www.dol.wa.gov/",
    passportUrl: "https://travel.state.gov/content/travel/en/passports/get-fast/passport-agencies/seattle.html",
    visaUrl: null,
  },
  {
    code: "WV",
    name: "West Virginia",
    lat: 38.491226,
    lng: -80.954453,
    neighbors: ["KY", "MD", "OH", "PA", "VA"],
    dmvUrl: "https://transportation.wv.gov/DMV/",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "WI",
    name: "Wisconsin",
    lat: 44.268543,
    lng: -89.616508,
    neighbors: ["IL", "IA", "MI", "MN"],
    dmvUrl: "https://wisconsindot.gov/Pages/dmv/default.aspx",
    passportUrl: null,
    visaUrl: null,
  },
  {
    code: "WY",
    name: "Wyoming",
    lat: 42.755966,
    lng: -107.302490,
    neighbors: ["CO", "ID", "MT", "NE", "SD", "UT"],
    dmvUrl: "https://www.dot.state.wy.us/home/driver_license_records.html",
    passportUrl: null,
    visaUrl: null,
  },
];

// Quick lookup by state code
export const STATE_BY_CODE: Record<string, USState> = US_STATES.reduce(
  (acc, state) => {
    acc[state.code] = state;
    return acc;
  },
  {} as Record<string, USState>
);

// Quick lookup by state name (lowercase)
export const STATE_BY_NAME: Record<string, USState> = US_STATES.reduce(
  (acc, state) => {
    acc[state.name.toLowerCase()] = state;
    return acc;
  },
  {} as Record<string, USState>
);

/**
 * Find a state by code or name (case-insensitive)
 */
export function findState(input: string): USState | null {
  const normalized = input.trim();
  
  // Try code first (2 letters)
  if (normalized.length === 2) {
    return STATE_BY_CODE[normalized.toUpperCase()] || null;
  }
  
  // Try full name
  return STATE_BY_NAME[normalized.toLowerCase()] || null;
}

/**
 * Get neighboring states (including the state itself)
 */
export function getNeighboringStates(stateCode: string): USState[] {
  const state = STATE_BY_CODE[stateCode.toUpperCase()];
  if (!state) return [];
  
  const neighbors = [state];
  for (const neighborCode of state.neighbors) {
    const neighbor = STATE_BY_CODE[neighborCode];
    if (neighbor) neighbors.push(neighbor);
  }
  
  return neighbors;
}

/**
 * Get neighbor state NAMES for a given state name.
 * Used by the pipeline for location filtering.
 * 
 * @param stateName - Full state name (e.g., "California")
 * @returns Array of neighbor state names (e.g., ["Arizona", "Nevada", "Oregon"])
 */
export function getNeighborStates(stateName: string): string[] {
  const state = STATE_BY_NAME[stateName.toLowerCase()];
  if (!state) return [];
  
  return state.neighbors
    .map((code) => STATE_BY_CODE[code]?.name)
    .filter((name): name is string => !!name);
}

/**
 * Calculate distance between two states (in miles)
 */
export function calculateDistance(state1: USState, state2: USState): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(state2.lat - state1.lat);
  const dLng = toRad(state2.lng - state1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(state1.lat)) *
      Math.cos(toRad(state2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get states within a certain distance (in miles)
 */
export function getStatesWithinDistance(
  stateCode: string,
  maxDistance: number
): USState[] {
  const state = STATE_BY_CODE[stateCode.toUpperCase()];
  if (!state) return [];
  
  return US_STATES.filter(
    (s) => calculateDistance(state, s) <= maxDistance
  ).sort((a, b) => calculateDistance(state, a) - calculateDistance(state, b));
}
