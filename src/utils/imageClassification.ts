// Enhanced image classification with better human detection
// In production, you'd use a proper ML model like TensorFlow.js or a cloud API

export interface ClassificationResult {
  id: string;
  name: string;
  confidence: number;
}

export interface ImageAnalysisResult {
  predictions: ClassificationResult[];
  dominantColors: string[];
  imageType: 'person' | 'animal' | 'object' | 'landscape' | 'unknown';
}

// Enhanced image analysis using Canvas API with better human detection
export async function analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Create object URL for the image
    const objectUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        // Clean up object URL after loading
        URL.revokeObjectURL(objectUrl);
        
        // Set canvas size
        canvas.width = Math.min(img.width, 224);
        canvas.height = Math.min(img.height, 224);
        
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Analyze image characteristics
        const analysis = analyzeImageData(data, canvas.width, canvas.height);
        
        // Generate predictions based on analysis
        const predictions = generatePredictions(analysis, imageFile.name);
        
        resolve({
          predictions,
          dominantColors: analysis.dominantColors,
          imageType: analysis.imageType
        });
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

interface ImageCharacteristics {
  brightness: number;
  contrast: number;
  colorfulness: number;
  dominantColors: string[];
  hasFleshTones: boolean;
  fleshTonePercentage: number;
  hasFaceStructure: boolean;
  hasHairTexture: boolean;
  hasClothingColors: boolean;
  hasAnimalFeatures: boolean;
  imageType: 'person' | 'animal' | 'object' | 'landscape' | 'unknown';
}

function analyzeImageData(data: Uint8ClampedArray, width: number, height: number): ImageCharacteristics {
  let totalR = 0, totalG = 0, totalB = 0;
  let brightness = 0;
  let fleshTonePixels = 0;
  let faceStructurePixels = 0;
  let hairPixels = 0;
  let clothingPixels = 0;
  let animalFeaturePixels = 0;
  
  const colorCounts: { [key: string]: number } = {};
  const pixelCount = width * height;
  
  // Analyze each pixel with enhanced detection
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    totalR += r;
    totalG += g;
    totalB += b;
    brightness += (r + g + b) / 3;
    
    // Enhanced flesh tone detection for humans
    if (isHumanFleshTone(r, g, b)) {
      fleshTonePixels++;
    }
    
    // Face structure detection (lighter flesh tones, specific ratios)
    if (isFaceStructure(r, g, b)) {
      faceStructurePixels++;
    }
    
    // Hair texture detection
    if (isHairTexture(r, g, b)) {
      hairPixels++;
    }
    
    // Clothing color detection
    if (isClothingColor(r, g, b)) {
      clothingPixels++;
    }
    
    // Animal feature detection (fur patterns, animal colors)
    if (isAnimalFeature(r, g, b)) {
      animalFeaturePixels++;
    }
    
    // Count dominant colors
    const colorKey = `${Math.floor(r/32)*32},${Math.floor(g/32)*32},${Math.floor(b/32)*32}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }
  
  // Calculate percentages and characteristics
  const fleshTonePercentage = fleshTonePixels / pixelCount;
  const faceStructurePercentage = faceStructurePixels / pixelCount;
  const hairPercentage = hairPixels / pixelCount;
  const clothingPercentage = clothingPixels / pixelCount;
  const animalFeaturePercentage = animalFeaturePixels / pixelCount;
  
  // Calculate averages
  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;
  brightness = brightness / pixelCount;
  
  // Calculate contrast
  let contrast = 0;
  for (let i = 0; i < data.length; i += 4) {
    const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    contrast += Math.abs(pixelBrightness - brightness);
  }
  contrast = contrast / pixelCount;
  
  // Calculate colorfulness
  const colorfulness = Math.sqrt(
    Math.pow(avgR - avgG, 2) + Math.pow(avgG - avgB, 2) + Math.pow(avgB - avgR, 2)
  );
  
  // Get dominant colors
  const dominantColors = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([color]) => `rgb(${color})`);
  
  // Enhanced image type determination with human priority
  let imageType: 'person' | 'animal' | 'object' | 'landscape' | 'unknown' = 'unknown';
  
  // Human detection score (weighted combination of features)
  const humanScore = 
    (fleshTonePercentage * 3) + 
    (faceStructurePercentage * 4) + 
    (hairPercentage * 2) + 
    (clothingPercentage * 1.5);
  
  // Animal detection score
  const animalScore = animalFeaturePercentage * 2;
  
  // Determine image type with improved logic
  if (humanScore > 0.3 && fleshTonePercentage > 0.08) {
    imageType = 'person';
  } else if (animalScore > 0.4 && humanScore < 0.2) {
    imageType = 'animal';
  } else if (brightness > 150 && colorfulness > 50 && fleshTonePercentage < 0.05) {
    imageType = 'landscape';
  } else if (humanScore < 0.1 && animalScore < 0.2) {
    imageType = 'object';
  } else {
    // Default to person if there's any significant flesh tone presence
    imageType = fleshTonePercentage > 0.05 ? 'person' : 'object';
  }
  
  return {
    brightness,
    contrast,
    colorfulness,
    dominantColors,
    hasFleshTones: fleshTonePercentage > 0.05,
    fleshTonePercentage,
    hasFaceStructure: faceStructurePercentage > 0.03,
    hasHairTexture: hairPercentage > 0.05,
    hasClothingColors: clothingPercentage > 0.1,
    hasAnimalFeatures: animalFeaturePercentage > 0.2,
    imageType
  };
}

function isHumanFleshTone(r: number, g: number, b: number): boolean {
  // Enhanced human skin tone detection with broader range
  // Covers various ethnicities and lighting conditions
  
  // Basic flesh tone check
  const basicFlesh = (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15 &&
    r < 255 && g < 220 && b < 180
  );
  
  // Light skin tones
  const lightSkin = (
    r > 180 && g > 140 && b > 100 &&
    r > g && g > b &&
    (r - g) < 50 && (g - b) < 50
  );
  
  // Medium skin tones
  const mediumSkin = (
    r > 120 && r < 200 &&
    g > 80 && g < 160 &&
    b > 50 && b < 120 &&
    r > g && g >= b
  );
  
  // Darker skin tones
  const darkSkin = (
    r > 60 && r < 140 &&
    g > 40 && g < 100 &&
    b > 20 && b < 80 &&
    r >= g && g >= b &&
    (r - b) > 20
  );
  
  return basicFlesh || lightSkin || mediumSkin || darkSkin;
}

function isFaceStructure(r: number, g: number, b: number): boolean {
  // Detect face-like structures (lighter flesh tones, specific patterns)
  return (
    r > 150 && g > 120 && b > 90 &&
    r > g && g > b &&
    (r - g) < 40 && (g - b) < 40 &&
    r < 240 && g < 200 && b < 160
  );
}

function isHairTexture(r: number, g: number, b: number): boolean {
  // Hair color detection (various hair colors)
  const brightness = (r + g + b) / 3;
  
  // Dark hair (black, dark brown)
  const darkHair = brightness < 80 && Math.max(r, g, b) - Math.min(r, g, b) < 30;
  
  // Brown hair
  const brownHair = (
    r > 60 && r < 150 &&
    g > 40 && g < 120 &&
    b > 20 && b < 100 &&
    r > g && g > b
  );
  
  // Blonde hair
  const blondeHair = (
    r > 180 && g > 160 && b > 100 &&
    r > g && g > b &&
    (r - b) > 50
  );
  
  // Gray/white hair
  const grayHair = (
    Math.abs(r - g) < 20 && Math.abs(g - b) < 20 &&
    brightness > 120
  );
  
  return darkHair || brownHair || blondeHair || grayHair;
}

function isClothingColor(r: number, g: number, b: number): boolean {
  // Common clothing colors and patterns
  const brightness = (r + g + b) / 3;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);
  
  // Bright colors (typical clothing)
  const brightClothing = saturation > 50 && brightness > 80 && brightness < 200;
  
  // Dark clothing
  const darkClothing = brightness < 60 && saturation < 40;
  
  // White/light clothing
  const lightClothing = brightness > 200 && saturation < 30;
  
  return brightClothing || darkClothing || lightClothing;
}

function isAnimalFeature(r: number, g: number, b: number): boolean {
  // Animal-specific features (fur patterns, animal colors)
  const avg = (r + g + b) / 3;
  const variance = Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg);
  
  // Fur-like patterns (low variance, earth tones)
  const furPattern = (
    variance < 25 &&
    avg > 40 && avg < 160 &&
    ((r > g && r > b && r < 180) || // Brown tones
     (Math.abs(r - g) < 15 && Math.abs(g - b) < 15)) // Gray tones
  );
  
  // Bright animal colors (birds, exotic animals)
  const brightAnimal = (
    Math.max(r, g, b) > 200 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 100
  );
  
  return furPattern || brightAnimal;
}

function generatePredictions(analysis: ImageCharacteristics, fileName: string): ClassificationResult[] {
  const predictions: ClassificationResult[] = [];
  
  // Enhanced prediction logic with human priority
  switch (analysis.imageType) {
    case 'person':
      // High confidence for human detection
      predictions.push(
        { id: 'person', name: 'Person', confidence: 0.85 + Math.min(0.1, analysis.fleshTonePercentage * 2) },
        { id: 'human', name: 'Human', confidence: 0.80 + Math.min(0.1, analysis.fleshTonePercentage * 1.5) }
      );
      
      if (analysis.hasFaceStructure) {
        predictions.push({ id: 'face', name: 'Face', confidence: 0.75 + Math.random() * 0.1 });
      } else {
        predictions.push({ id: 'portrait', name: 'Portrait', confidence: 0.65 + Math.random() * 0.15 });
      }
      break;
      
    case 'animal':
      // Only classify as animal if human features are clearly absent
      if (analysis.fleshTonePercentage < 0.05) {
        if (analysis.hasAnimalFeatures) {
          predictions.push(
            { id: 'animal', name: 'Animal', confidence: 0.80 + Math.random() * 0.1 },
            { id: 'mammal', name: 'Mammal', confidence: 0.65 + Math.random() * 0.15 },
            { id: 'pet', name: 'Pet', confidence: 0.55 + Math.random() * 0.2 }
          );
        } else {
          predictions.push(
            { id: 'wildlife', name: 'Wildlife', confidence: 0.70 + Math.random() * 0.15 },
            { id: 'creature', name: 'Creature', confidence: 0.60 + Math.random() * 0.2 }
          );
        }
      } else {
        // If flesh tones present, lean towards person
        predictions.push(
          { id: 'person', name: 'Person', confidence: 0.75 + Math.random() * 0.1 },
          { id: 'human', name: 'Human', confidence: 0.65 + Math.random() * 0.15 }
        );
      }
      break;
      
    case 'landscape':
      predictions.push(
        { id: 'landscape', name: 'Landscape', confidence: 0.85 + Math.random() * 0.1 },
        { id: 'nature', name: 'Nature', confidence: 0.75 + Math.random() * 0.15 },
        { id: 'scenery', name: 'Scenery', confidence: 0.65 + Math.random() * 0.2 }
      );
      break;
      
    case 'object':
      predictions.push(
        { id: 'object', name: 'Object', confidence: 0.75 + Math.random() * 0.1 },
        { id: 'item', name: 'Item', confidence: 0.65 + Math.random() * 0.15 },
        { id: 'artifact', name: 'Artifact', confidence: 0.55 + Math.random() * 0.2 }
      );
      break;
      
    default:
      // Default case - check for any human indicators
      if (analysis.fleshTonePercentage > 0.03) {
        predictions.push(
          { id: 'person', name: 'Person', confidence: 0.70 + Math.random() * 0.15 },
          { id: 'human', name: 'Human', confidence: 0.60 + Math.random() * 0.2 }
        );
      } else {
        predictions.push(
          { id: 'unknown', name: 'Unknown', confidence: 0.50 + Math.random() * 0.2 },
          { id: 'image', name: 'Image', confidence: 0.90 + Math.random() * 0.05 }
        );
      }
  }
  
  // Filename-based hints (high priority)
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.includes('person') || lowerFileName.includes('human') || 
      lowerFileName.includes('face') || lowerFileName.includes('portrait') ||
      lowerFileName.includes('selfie') || lowerFileName.includes('photo')) {
    predictions.unshift({ id: 'person', name: 'Person', confidence: 0.95 });
  }
  
  // Remove duplicates and sort by confidence
  const uniquePredictions = predictions.reduce((acc, current) => {
    const existing = acc.find(item => item.id === current.id);
    if (!existing) {
      acc.push(current);
    } else if (current.confidence > existing.confidence) {
      existing.confidence = current.confidence;
    }
    return acc;
  }, [] as ClassificationResult[]);
  
  // Sort by confidence and limit to top 3
  return uniquePredictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map((pred, index) => ({
      ...pred,
      confidence: Math.min(0.95, Math.max(0.1, pred.confidence - index * 0.03))
    }));
}