export interface HouseModelVariant {
  id: string;
  category: '20x30' | '30x40' | '40x60' | 'custom';
  name: string;
  subtitle: string;
  sqft: number;
  floors: number;
  footprint: [number, number]; // [width, depth] in meters
  height: number;
  style:
    | 'modern-duplex'
    | 'traditional-sloped'
    | 'stilt-parking'
    | 'contemporary-box'
    | 'courtyard'
    | 'apartments'
    | 'villa'
    | 'commercial'
    | 'fusion-gable-cottage'
    | 'fusion-modern-villa'
    | 'skyline-luxury-apartments'
    | 'custom-cad';
  description: string;
  features: string[];
  isCustom?: boolean;
  meshPositions?: Float32Array;
  meshNormals?: Float32Array;
  meshIndices?: Uint32Array;
}

export const DEFAULT_HOUSE_MODELS: HouseModelVariant[] = [
  // --- 20x30 FT (6.1m x 9.1m) ---
  {
    id: '20x30-fusion-cottage',
    category: '20x30',
    name: 'Fusion Asymmetric Gable & Porch',
    subtitle: 'G+1 Fusion 360 Asymmetric Cottage',
    sqft: 600,
    floors: 2,
    footprint: [6.1, 9.1],
    height: 7.0,
    style: 'fusion-gable-cottage',
    description: 'Direct Fusion 360 architectural design with asymmetric dark slate gable roof, masonry chimney with cap, second-floor recessed windows, stepped ground wing, and prominent timber pergola porch on teak deck.',
    features: ['Asymmetric Slate Roof', 'Masonry Chimney & Cap', 'Timber Pergola Carport', 'Teak Deck & Pillars', 'Corner Structural Column'],
  },
  {
    id: '20x30-nilaya',
    category: '20x30',
    name: 'Bengaluru Nilaya',
    subtitle: 'G+1 Modern Duplex',
    sqft: 600,
    floors: 2,
    footprint: [6.1, 9.1],
    height: 6.8,
    style: 'modern-duplex',
    description: 'Classic Bengaluru independent duplex with cantilevered balcony, entrance portico, and rooftop water tank.',
    features: ['Cantilevered Balcony', 'Entrance Portico', 'Sintex Water Tank', 'Pergola Parapet'],
  },
  {
    id: '20x30-sloped',
    category: '20x30',
    name: 'Heritage Sloped Nilaya',
    subtitle: 'G+1 Mangalore Tile Villa',
    sqft: 600,
    floors: 2,
    footprint: [6.1, 9.1],
    height: 7.2,
    style: 'traditional-sloped',
    description: 'Traditional South Indian residence with red terracotta tiled pitched roof, wooden pillars, and open front veranda.',
    features: ['Terracotta Tile Roof', 'Timber Veranda Pillars', 'Ornamental Eaves', 'Clay Plaster Tone'],
  },
  {
    id: '20x30-stilt',
    category: '20x30',
    name: 'Stilt Parking Villa',
    subtitle: 'G+1 Compact Stilt',
    sqft: 600,
    floors: 2,
    footprint: [6.1, 9.1],
    height: 6.6,
    style: 'stilt-parking',
    description: 'Urban space-saving design with open ground-floor car parking bay and cantilevered upper residence.',
    features: ['Ground Car Parking Bay', 'Cantilevered Residence', 'Solar Water Heater', 'Safety Railings'],
  },
  {
    id: '20x30-modern',
    category: '20x30',
    name: 'Minimalist Cube',
    subtitle: 'G+1 Contemporary Box',
    sqft: 600,
    floors: 2,
    footprint: [6.1, 9.1],
    height: 6.5,
    style: 'contemporary-box',
    description: 'Architectural modern cube with cedar wood louvers, ribbon glass windows, and rooftop terrace.',
    features: ['Vertical Teak Louvers', 'Corner Ribbon Glazing', 'Rooftop Lounge', 'Graphite Concrete'],
  },

  // --- 30x40 FT (9.1m x 12.2m) ---
  {
    id: '30x40-fusion-villa',
    category: '30x40',
    name: 'Fusion Modern Villa & Pool Pavilion',
    subtitle: 'G+1 Fusion 360 Architectural Villa',
    sqft: 1200,
    floors: 2,
    footprint: [9.1, 12.2],
    height: 7.8,
    style: 'fusion-modern-villa',
    description: 'Ultra-modern architectural villa straight from Fusion 360: sunken outdoor fire pit lounge, turquoise reflection lap pool with teak deck, panoramic glass curtain walls, floating cantilever exterior staircase, and rooftop pergola terrace with vertical sun louvers.',
    features: ['Sunken Fire-Pit Lounge', 'Turquoise Lap Pool', 'Floating Cantilever Stairs', 'Rooftop Pergola Deck', 'Vertical Shading Louvers'],
  },
  {
    id: '30x40-duplex',
    category: '30x40',
    name: 'Cauvery Executive',
    subtitle: 'G+2 Standard Duplex',
    sqft: 1200,
    floors: 3,
    footprint: [9.1, 12.2],
    height: 9.8,
    style: 'modern-duplex',
    description: 'Spacious 3-floor luxury duplex with covered garage, double-height living bay, and rooftop gazebo.',
    features: ['Enclosed Carport', 'Double-Height Bay', 'Terrace Pergola', 'Granite Finish'],
  },
  {
    id: '30x40-courtyard',
    category: '30x40',
    name: 'Thotti Mane Villa',
    subtitle: 'G+2 Courtyard Heritage',
    sqft: 1200,
    floors: 3,
    footprint: [9.1, 12.2],
    height: 9.5,
    style: 'courtyard',
    description: 'Karnataka-style central courtyard house with open skylight, exposed brick jali, and twin balconies.',
    features: ['Central Open Courtyard', 'Wirecut Brick Jali', 'Twin Balconies', 'Terracotta Trims'],
  },
  {
    id: '30x40-apartments',
    category: '30x40',
    name: 'Ashoka Twin Flats',
    subtitle: 'G+2 Rental Apartments',
    sqft: 1200,
    floors: 3,
    footprint: [9.1, 12.2],
    height: 9.6,
    style: 'apartments',
    description: 'Multi-family residential building with external dogleg staircase tower and symmetrical 2BHK units.',
    features: ['External Staircase Tower', 'Independent Flats', 'Dual Utility Decks', 'Compound Gate'],
  },

  // --- 40x60 FT (12.2m x 18.3m) ---
  {
    id: '40x60-skyline-apartments',
    category: '40x60',
    name: 'Skyline Luxury Multi-Story Apartments',
    subtitle: 'G+4 High-Grade Residential Tower',
    sqft: 2400,
    floors: 5,
    footprint: [12.2, 18.3],
    height: 16.5,
    style: 'skyline-luxury-apartments',
    description: 'High-grade detailed multi-story Bengaluru apartment tower with ground-floor stilt parking, grand glazed lobby, 4 upper floors with private cantilevered balconies & tinted glass balustrades, terracotta jali facade with architectural sun-fins, glass elevator core, and rooftop penthouse infinity terrace with twin Sintex water towers.',
    features: ['Stilt Parking & Reception Lobby', 'Cantilevered Balconies & Glass Railings', 'Terracotta Jali & Sun Fins', 'Glass Elevator Shaft', 'Rooftop Infinity Deck & Water Towers'],
  },
  {
    id: '40x60-villa',
    category: '40x60',
    name: 'Royal Palms Mansion',
    subtitle: 'G+3 Executive Estate',
    sqft: 2400,
    floors: 4,
    footprint: [12.2, 18.3],
    height: 12.8,
    style: 'villa',
    description: 'Luxury 4-floor estate with double garage, floor-to-ceiling glass atrium, and rooftop party terrace.',
    features: ['Double Garage', 'Glass Wall Atrium', 'Cantilevered Master Suite', 'Rooftop Deck'],
  },
  {
    id: '40x60-commercial',
    category: '40x60',
    name: 'Indiranagar Plaza',
    subtitle: 'G+3 Mixed-Use Complex',
    sqft: 2400,
    floors: 4,
    footprint: [12.2, 18.3],
    height: 13.0,
    style: 'commercial',
    description: 'Ground floor retail glass showroom with upper medical/office suites and penthouse executive floor.',
    features: ['Glazed Retail Showroom', 'ACP Cladding Band', 'Reflective Curtain Wall', 'Signage Band'],
  },
];
