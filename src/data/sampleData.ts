// Location and area data for Addis Ababa - essential for location services

// Area data for Addis Ababa - used for location services
export const addisAbabaAreas = [
  'Bole',
  'Kazanchis', 
  'Piazza',
  'Mexico',
  'Gerji',
  'CMC',
  'Lebu',
  'Kirkos'
];

// Nearby locations mapping - used for location-based services
export const nearbyLocations = {
  'bole': [
    'Bole Airport Area',
    'Bole Medhanialem',
    'Bole Michael',
    'Bole Arabsa',
    'Bole Bulbula',
    'Edna Mall Area',
    'Friendship City Center'
  ],
  'piazza': [
    'Arat Kilo',
    'Sidist Kilo',
    'Red Terror Martyrs Memorial',
    'Taitu Hotel Area',
    'Post Office Square',
    'Merkato Border'
  ],
  'kazanchis': [
    'ECA Conference Center',
    'Meskel Square',
    'UN Economic Commission',
    'Kazanchis Business District',
    'Embassy Row'
  ],
  'mexico': [
    'Mexico Square',
    'CMC Area',
    'Ring Road Junction',
    'Government Quarter',
    'National Theatre Area'
  ],
  'gerji': [
    'Gerji Mebrat Hail',
    'Gerji 4 Kilo',
    'Gerji New Sites',
    'Gerji Commercial Area'
  ]
};

// Popular districts info - used for location information
export const popularDistricts = [
  {
    name: 'Bole',
    description: 'Modern district near the airport with international hotels and shopping',
    hotelCount: 0, // Will be updated as hotels are added
    avgPrice: 0,   // Will be calculated from actual hotel data
    highlights: ['Airport proximity', 'Shopping centers', 'International cuisine']
  },
  {
    name: 'Piazza',
    description: 'Historic heart of Addis Ababa with cultural attractions',
    hotelCount: 0,
    avgPrice: 0,
    highlights: ['Historical sites', 'Cultural attractions', 'Traditional markets']
  },
  {
    name: 'Kazanchis',
    description: 'Business district with conference facilities and embassies',
    hotelCount: 0,
    avgPrice: 0,
    highlights: ['Business hotels', 'Conference centers', 'Embassy quarter']
  }
];

