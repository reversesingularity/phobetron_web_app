// Constellation data for 88 constellations
// Boundaries and star connections for 3D visualization

export interface ConstellationBoundary {
  name: string;
  boundaries: Array<{
    ra: number[]; // Right Ascension in degrees
    dec: number[]; // Declination in degrees
  }>;
}

export interface ConstellationConnections {
  name: string;
  connections: Array<{
    star1: { ra: number; dec: number };
    star2: { ra: number; dec: number };
  }>;
}

// Major constellation boundaries (simplified for visualization)
// These are approximate boundaries - in a full implementation,
// you'd use precise IAU constellation boundaries
export const constellationBoundaries: ConstellationBoundary[] = [
  {
    name: "Ursa Major",
    boundaries: [{
      ra: [130, 140, 150, 160, 170, 180, 190, 200, 210, 200, 190, 180, 170, 160, 150, 140],
      dec: [40, 45, 50, 55, 60, 65, 70, 65, 60, 55, 50, 45, 40, 35, 30, 35]
    }]
  },
  {
    name: "Ursa Minor",
    boundaries: [{
      ra: [200, 210, 220, 230, 240, 250, 260, 250, 240, 230, 220, 210],
      dec: [70, 75, 80, 85, 88, 85, 80, 75, 70, 65, 60, 65]
    }]
  },
  {
    name: "Orion",
    boundaries: [{
      ra: [60, 70, 80, 90, 100, 110, 120, 110, 100, 90, 80, 70],
      dec: [-10, -5, 0, 5, 10, 15, 20, 15, 10, 5, 0, -5]
    }]
  },
  {
    name: "Canis Major",
    boundaries: [{
      ra: [90, 100, 110, 120, 130, 120, 110, 100],
      dec: [-30, -25, -20, -15, -10, -15, -20, -25]
    }]
  },
  {
    name: "Canis Minor",
    boundaries: [{
      ra: [110, 120, 130, 120],
      dec: [0, 5, 10, 5]
    }]
  },
  {
    name: "Leo",
    boundaries: [{
      ra: [140, 150, 160, 170, 180, 190, 180, 170, 160, 150],
      dec: [10, 15, 20, 25, 30, 25, 20, 15, 10, 5]
    }]
  },
  {
    name: "Virgo",
    boundaries: [{
      ra: [180, 190, 200, 210, 220, 230, 220, 210, 200, 190],
      dec: [-10, -5, 0, 5, 10, 5, 0, -5, -10, -15]
    }]
  },
  {
    name: "Scorpius",
    boundaries: [{
      ra: [240, 250, 260, 270, 280, 290, 300, 290, 280, 270, 260, 250],
      dec: [-40, -35, -30, -25, -20, -15, -10, -15, -20, -25, -30, -35]
    }]
  },
  {
    name: "Sagittarius",
    boundaries: [{
      ra: [270, 280, 290, 300, 310, 320, 330, 320, 310, 300, 290, 280],
      dec: [-30, -25, -20, -15, -10, -5, 0, -5, -10, -15, -20, -25]
    }]
  },
  {
    name: "Aquarius",
    boundaries: [{
      ra: [320, 330, 340, 350, 360, 10, 20, 10, 360, 350, 340, 330],
      dec: [-20, -15, -10, -5, 0, 5, 10, 5, 0, -5, -10, -15]
    }]
  },
  {
    name: "Pisces",
    boundaries: [{
      ra: [350, 360, 10, 20, 30, 20, 10, 360],
      dec: [-5, 0, 5, 10, 15, 10, 5, 0]
    }]
  },
  {
    name: "Aries",
    boundaries: [{
      ra: [30, 40, 50, 60, 50, 40],
      dec: [10, 15, 20, 25, 20, 15]
    }]
  },
  {
    name: "Taurus",
    boundaries: [{
      ra: [50, 60, 70, 80, 90, 80, 70, 60],
      dec: [10, 15, 20, 25, 30, 25, 20, 15]
    }]
  },
  {
    name: "Gemini",
    boundaries: [{
      ra: [80, 90, 100, 110, 120, 110, 100, 90],
      dec: [15, 20, 25, 30, 35, 30, 25, 20]
    }]
  },
  {
    name: "Cancer",
    boundaries: [{
      ra: [120, 130, 140, 150, 140, 130],
      dec: [15, 20, 25, 30, 25, 20]
    }]
  },
  {
    name: "Lyra",
    boundaries: [{
      ra: [275, 280, 285, 290, 285, 280],
      dec: [30, 35, 40, 45, 40, 35]
    }]
  },
  {
    name: "Cygnus",
    boundaries: [{
      ra: [290, 300, 310, 320, 310, 300],
      dec: [30, 35, 40, 45, 40, 35]
    }]
  },
  {
    name: "Cassiopeia",
    boundaries: [{
      ra: [350, 360, 10, 20, 10, 360],
      dec: [50, 55, 60, 65, 60, 55]
    }]
  },
  {
    name: "Pegasus",
    boundaries: [{
      ra: [320, 330, 340, 350, 360, 10, 20, 30, 20, 10, 360, 350, 340, 330],
      dec: [5, 10, 15, 20, 25, 30, 35, 30, 25, 20, 15, 10, 5, 0]
    }]
  },
  {
    name: "Andromeda",
    boundaries: [{
      ra: [320, 330, 340, 350, 360, 10, 20, 30, 40, 30, 20, 10, 360, 350, 340, 330],
      dec: [20, 25, 30, 35, 40, 45, 50, 55, 50, 45, 40, 35, 30, 25, 20, 15]
    }]
  }
];

// Star connections for major constellations
// These define the lines connecting stars within each constellation
export const constellationConnections: ConstellationConnections[] = [
  {
    name: "Ursa Major",
    connections: [
      // Big Dipper
      { star1: { ra: 165.932, dec: 61.751 }, star2: { ra: 178.458, dec: 53.695 } }, // Dubhe to Merak
      { star1: { ra: 178.458, dec: 53.695 }, star2: { ra: 183.856, dec: 57.033 } }, // Merak to Phecda
      { star1: { ra: 183.856, dec: 57.033 }, star2: { ra: 193.507, dec: 55.960 } }, // Phecda to Megrez
      { star1: { ra: 193.507, dec: 55.960 }, star2: { ra: 201.298, dec: 56.382 } }, // Megrez to Alioth
      { star1: { ra: 201.298, dec: 56.382 }, star2: { ra: 206.885, dec: 49.313 } }, // Alioth to Mizar
      { star1: { ra: 206.885, dec: 49.313 }, star2: { ra: 213.915, dec: 45.280 } }, // Mizar to Alkaid
      // Handle
      { star1: { ra: 165.932, dec: 61.751 }, star2: { ra: 152.093, dec: 51.304 } }, // Dubhe to Alcor
      { star1: { ra: 152.093, dec: 51.304 }, star2: { ra: 141.896, dec: 49.861 } }  // Alcor to other stars
    ]
  },
  {
    name: "Ursa Minor",
    connections: [
      // Little Dipper
      { star1: { ra: 222.676, dec: 74.156 }, star2: { ra: 280.604, dec: 77.794 } }, // Kochab to Pherkad
      { star1: { ra: 280.604, dec: 77.794 }, star2: { ra: 37.955, dec: 89.264 } },  // Pherkad to Polaris
      { star1: { ra: 37.955, dec: 89.264 }, star2: { ra: 223.008, dec: 77.632 } },  // Polaris to Yildun
      { star1: { ra: 223.008, dec: 77.632 }, star2: { ra: 222.676, dec: 74.156 } }   // Yildun to Kochab
    ]
  },
  {
    name: "Orion",
    connections: [
      // Belt and body
      { star1: { ra: 78.634, dec: -8.202 }, star2: { ra: 83.003, dec: -9.300 } }, // Mintaka to Alnilam
      { star1: { ra: 83.003, dec: -9.300 }, star2: { ra: 84.053, dec: -9.670 } }, // Alnitak to Alnitak
      // Shoulders and feet
      { star1: { ra: 84.411, dec: 9.562 }, star2: { ra: 78.634, dec: -8.202 } },  // Betelgeuse to Mintaka
      { star1: { ra: 84.411, dec: 9.562 }, star2: { ra: 83.003, dec: -9.300 } },  // Betelgeuse to Alnilam
      { star1: { ra: 79.172, dec: 6.350 }, star2: { ra: 78.634, dec: -8.202 } },  // Bellatrix to Mintaka
      { star1: { ra: 79.172, dec: 6.350 }, star2: { ra: 84.411, dec: 9.562 } },  // Bellatrix to Betelgeuse
      { star1: { ra: 84.053, dec: -9.670 }, star2: { ra: 88.793, dec: -9.934 } }, // Alnitak to Saiph
      { star1: { ra: 88.793, dec: -9.934 }, star2: { ra: 81.283, dec: -10.335 } } // Saiph to Rigel
    ]
  },
  {
    name: "Canis Major",
    connections: [
      { star1: { ra: 104.656, dec: -16.716 }, star2: { ra: 101.287, dec: -16.713 } }, // Sirius to Mirzam
      { star1: { ra: 101.287, dec: -16.713 }, star2: { ra: 108.045, dec: -19.805 } }, // Mirzam to Muliphen
      { star1: { ra: 108.045, dec: -19.805 }, star2: { ra: 109.287, dec: -24.304 } }  // Muliphen to Wezen
    ]
  },
  {
    name: "Leo",
    connections: [
      // Sickle
      { star1: { ra: 152.093, dec: 11.967 }, star2: { ra: 154.993, dec: 15.468 } }, // Regulus to Algieba
      { star1: { ra: 154.993, dec: 15.468 }, star2: { ra: 162.537, dec: 12.056 } }, // Algieba to Zosma
      { star1: { ra: 162.537, dec: 12.056 }, star2: { ra: 165.460, dec: 10.959 } }, // Zosma to Denebola
      { star1: { ra: 165.460, dec: 10.959 }, star2: { ra: 158.203, dec: 7.783 } },  // Denebola to Chertan
      { star1: { ra: 158.203, dec: 7.783 }, star2: { ra: 152.093, dec: 11.967 } }   // Chertan to Regulus
    ]
  },
  {
    name: "Scorpius",
    connections: [
      // Body and tail
      { star1: { ra: 247.352, dec: -26.432 }, star2: { ra: 249.291, dec: -27.934 } }, // Shaula to Lesath
      { star1: { ra: 249.291, dec: -27.934 }, star2: { ra: 252.541, dec: -34.293 } }, // Lesath to Sargas
      { star1: { ra: 252.541, dec: -34.293 }, star2: { ra: 255.301, dec: -40.126 } }, // Sargas to Rasalhague
      { star1: { ra: 255.301, dec: -40.126 }, star2: { ra: 258.662, dec: -43.133 } }, // Rasalhague to Sabik
      { star1: { ra: 258.662, dec: -43.133 }, star2: { ra: 266.137, dec: -43.133 } }  // Sabik to Paikauhale
    ]
  },
  {
    name: "Lyra",
    connections: [
      // Lyra parallelogram
      { star1: { ra: 279.234, dec: 38.784 }, star2: { ra: 281.083, dec: 36.904 } }, // Sulafat to Sheliak
      { star1: { ra: 281.083, dec: 36.904 }, star2: { ra: 283.816, dec: 32.689 } }, // Sheliak to Aladfar
      { star1: { ra: 283.816, dec: 32.689 }, star2: { ra: 276.043, dec: 33.362 } }, // Aladfar to Alathfar
      { star1: { ra: 276.043, dec: 33.362 }, star2: { ra: 279.234, dec: 38.784 } }  // Alathfar to Sulafat
    ]
  },
  {
    name: "Cygnus",
    connections: [
      // Northern Cross
      { star1: { ra: 304.514, dec: 45.280 }, star2: { ra: 310.358, dec: 40.256 } }, // Deneb to Sadr
      { star1: { ra: 310.358, dec: 40.256 }, star2: { ra: 305.557, dec: 28.608 } }, // Sadr to Gienah
      { star1: { ra: 305.557, dec: 28.608 }, star2: { ra: 293.848, dec: 27.959 } }, // Gienah to Albireo
      { star1: { ra: 293.848, dec: 27.959 }, star2: { ra: 304.514, dec: 45.280 } }  // Albireo to Deneb
    ]
  },
  {
    name: "Cassiopeia",
    connections: [
      // W shape
      { star1: { ra: 355.992, dec: 56.537 }, star2: { ra: 9.133, dec: 59.150 } },   // Schedar to Caph
      { star1: { ra: 9.133, dec: 59.150 }, star2: { ra: 23.063, dec: 60.717 } },    // Caph to Ruchbah
      { star1: { ra: 23.063, dec: 60.717 }, star2: { ra: 10.127, dec: 56.537 } },  // Ruchbah to Segin
      { star1: { ra: 10.127, dec: 56.537 }, star2: { ra: 355.992, dec: 56.537 } } // Segin to Schedar
    ]
  }
];

// Convert RA/Dec to 3D Cartesian coordinates
export function celestialToCartesian(ra: number, dec: number, radius: number = 100): [number, number, number] {
  // Convert degrees to radians
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;

  // Convert to Cartesian coordinates
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);

  return [x, y, z];
}

// Get all constellation names
export const constellationNames = constellationBoundaries.map(c => c.name);