export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export const getContrastColor = (hexColor: string) => {
  const rgb = hexToRgb(hexColor);
  const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

const getColorDistance = (c1: {r: number, g: number, b: number}, c2: {r: number, g: number, b: number}) => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

const isGrayscale = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) < 15; 
}

const mix = (c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}, weight: number) => {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * weight),
    g: Math.round(c1.g + (c2.g - c1.g) * weight),
    b: Math.round(c1.b + (c2.b - c1.b) * weight),
  };
}

// Generates a massive deep spectrum (15 steps) for a color
export const generateExpandedShades = (hexColor: string): string[] => {
  const base = hexToRgb(hexColor);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const tones: string[] = [];

  // TINTS: 7 steps closer to white
  const tintWeights = [0.96, 0.9, 0.8, 0.7, 0.6, 0.45, 0.3];
  tintWeights.forEach(w => {
    const mixed = mix(base, white, w);
    tones.push(rgbToHex(mixed.r, mixed.g, mixed.b));
  });

  // BASE
  tones.push(hexColor);

  // SHADES: 7 steps closer to black
  const shadeWeights = [0.15, 0.3, 0.45, 0.6, 0.7, 0.8, 0.92];
  shadeWeights.forEach(w => {
    const mixed = mix(base, black, w);
    tones.push(rgbToHex(mixed.r, mixed.g, mixed.b));
  });

  return tones;
};

export const extractColorsFromImage = (imageSrc: string): Promise<{ primary: string; accent: string; palette: string[] }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(getDefaultColors());

      canvas.width = 200;
      canvas.height = 200;
      ctx.clearRect(0, 0, 200, 200); 
      ctx.drawImage(img, 0, 0, 200, 200);

      try {
        const imageData = ctx.getImageData(0, 0, 200, 200);
        const data = imageData.data;
        const colorMap: Map<string, number> = new Map();
        
        for (let i = 0; i < data.length; i += 8) { 
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue; 
          if (r > 250 && g > 250 && b > 250) continue;
          if (r < 15 && g < 15 && b < 15) continue;
          if (isGrayscale(r, g, b) && (r > 200 || r < 50)) continue; 

          const hex = rgbToHex(r, g, b);
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        let sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

        const distinctColors: string[] = [];
        const threshold = 60; 

        while (sortedColors.length > 0) {
            const current = sortedColors[0];
            distinctColors.push(current);
            const currentRgb = hexToRgb(current);
            sortedColors = sortedColors.filter(c => {
                const dist = getColorDistance(currentRgb, hexToRgb(c));
                return dist > threshold; 
            });
            if (distinctColors.length >= 5) break;
        }

        if (distinctColors.length > 0) {
          const primary = distinctColors[0];
          let accent = distinctColors.length > 1 ? distinctColors[1] : null;

          if (!accent) {
             const rgb = hexToRgb(primary);
             accent = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
          }

          let fullPalette: string[] = [];
          
          fullPalette = fullPalette.concat(generateExpandedShades(primary));
          if (accent) {
            fullPalette = fullPalette.concat(generateExpandedShades(accent));
          }
          distinctColors.slice(2, 4).forEach(c => {
             fullPalette = fullPalette.concat(generateExpandedShades(c));
          });

          const neutrals = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#94A3B8', '#475569', '#1E293B', '#0F172A', '#000000'];
          fullPalette = fullPalette.concat(neutrals);

          const uniquePalette = Array.from(new Set(fullPalette));

          resolve({
            primary: primary,
            accent: accent!,
            palette: uniquePalette
          });
        } else {
          resolve(getDefaultColors());
        }
      } catch (e) {
        console.error("Color extraction error", e);
        resolve(getDefaultColors());
      }
    };

    img.onerror = () => {
      resolve(getDefaultColors());
    };
  });
};

const getDefaultColors = () => ({ 
    primary: '#EC1B23', 
    accent: '#24268C', 
    palette: [
        ...generateExpandedShades('#EC1B23'),
        ...generateExpandedShades('#24268C'),
        '#FFFFFF', '#000000'
    ]
});