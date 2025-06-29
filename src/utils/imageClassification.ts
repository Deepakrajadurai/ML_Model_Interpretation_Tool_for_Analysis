// Simple image classification based on basic image analysis
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

// Basic image analysis using Canvas API
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
  hasFurTexture: boolean;
  hasFeathers: boolean;
  imageType: 'person' | 'animal' | 'object' | 'landscape' | 'unknown';
}

function analyzeImageData(data: Uint8ClampedArray, width: number, height: number): ImageCharacteristics {
  let totalR = 0, totalG = 0, totalB = 0;
  let brightness = 0;
  let fleshTonePixels = 0;
  let furTexturePixels = 0;
  let featherPixels = 0;
  
  const colorCounts: { [key: string]: number } = {};
  const pixelCount = width * height;
  
  // Analyze each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    totalR += r;
    totalG += g;
    totalB += b;
    brightness += (r + g + b) / 3;
    
    // Check for flesh tones (human skin detection)
    if (isFleshTone(r, g, b)) {
      fleshTonePixels++;
    }
    
    // Check for fur-like textures (brown/gray variations)
    if (isFurLike(r, g, b)) {
      furTexturePixels++;
    }
    
    // Check for feather-like colors
    if (isFeatherLike(r, g, b)) {
      featherPixels++;
    }
    
    // Count dominant colors
    const colorKey = `${Math.floor(r/32)*32},${Math.floor(g/32)*32},${Math.floor(b/32)*32}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }
  
  // Calculate averages
  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;
  brightness = brightness / pixelCount;
  
  // Calculate contrast (simplified)
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
  
  // Determine image type based on characteristics
  let imageType: 'person' | 'animal' | 'object' | 'landscape' | 'unknown' = 'unknown';
  
  const fleshTonePercentage = fleshTonePixels / pixelCount;
  const furTexturePercentage = furTexturePixels / pixelCount;
  const featherPercentage = featherPixels / pixelCount;
  
  if (fleshTonePercentage > 0.15) {
    imageType = 'person';
  } else if (furTexturePercentage > 0.25) {
    imageType = 'animal';
  } else if (featherPercentage > 0.2) {
    imageType = 'animal';
  } else if (brightness > 150 && colorfulness > 50) {
    imageType = 'landscape';
  } else {
    imageType = 'object';
  }
  
  return {
    brightness,
    contrast,
    colorfulness,
    dominantColors,
    hasFleshTones: fleshTonePercentage > 0.1,
    hasFurTexture: furTexturePercentage > 0.2,
    hasFeathers: featherPercentage > 0.15,
    imageType
  };
}

function isFleshTone(r: number, g: number, b: number): boolean {
  // Human skin tone detection (simplified)
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15 &&
    r < 250 && g < 200 && b < 170
  );
}

function isFurLike(r: number, g: number, b: number): boolean {
  // Fur-like texture detection (browns, grays, mixed tones)
  const avg = (r + g + b) / 3;
  const variance = Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg);
  
  return (
    variance < 30 && // Low color variance (neutral tones)
    avg > 50 && avg < 180 && // Medium brightness
    ((r > g && r > b) || (Math.abs(r - g) < 20 && Math.abs(g - b) < 20)) // Brown or gray tones
  );
}

function isFeatherLike(r: number, g: number, b: number): boolean {
  // Feather-like colors (often colorful or white/black)
  const brightness = (r + g + b) / 3;
  const colorfulness = Math.max(r, g, b) - Math.min(r, g, b);
  
  return (
    (brightness > 200 || brightness < 50) || // Very bright or very dark
    colorfulness > 80 // High color saturation
  );
}

function generatePredictions(analysis: ImageCharacteristics, fileName: string): ClassificationResult[] {
  const predictions: ClassificationResult[] = [];
  
  // Base predictions on image analysis
  switch (analysis.imageType) {
    case 'person':
      predictions.push(
        { id: 'person', name: 'Person', confidence: 0.85 + Math.random() * 0.1 },
        { id: 'human', name: 'Human', confidence: 0.75 + Math.random() * 0.1 },
        { id: 'face', name: 'Face', confidence: 0.65 + Math.random() * 0.15 }
      );
      break;
      
    case 'animal':
      if (analysis.hasFurTexture) {
        predictions.push(
          { id: 'cat', name: 'Cat', confidence: 0.45 + Math.random() * 0.2 },
          { id: 'dog', name: 'Dog', confidence: 0.35 + Math.random() * 0.2 },
          { id: 'mammal', name: 'Mammal', confidence: 0.75 + Math.random() * 0.1 }
        );
      } else if (analysis.hasFeathers) {
        predictions.push(
          { id: 'bird', name: 'Bird', confidence: 0.80 + Math.random() * 0.1 },
          { id: 'eagle', name: 'Eagle', confidence: 0.45 + Math.random() * 0.2 },
          { id: 'parrot', name: 'Parrot', confidence: 0.35 + Math.random() * 0.2 }
        );
      } else {
        predictions.push(
          { id: 'animal', name: 'Animal', confidence: 0.70 + Math.random() * 0.15 },
          { id: 'wildlife', name: 'Wildlife', confidence: 0.55 + Math.random() * 0.2 }
        );
      }
      break;
      
    case 'landscape':
      predictions.push(
        { id: 'landscape', name: 'Landscape', confidence: 0.80 + Math.random() * 0.1 },
        { id: 'nature', name: 'Nature', confidence: 0.70 + Math.random() * 0.15 },
        { id: 'outdoor', name: 'Outdoor', confidence: 0.60 + Math.random() * 0.2 }
      );
      break;
      
    case 'object':
      predictions.push(
        { id: 'object', name: 'Object', confidence: 0.75 + Math.random() * 0.1 },
        { id: 'item', name: 'Item', confidence: 0.65 + Math.random() * 0.15 },
        { id: 'thing', name: 'Thing', confidence: 0.55 + Math.random() * 0.2 }
      );
      break;
      
    default:
      predictions.push(
        { id: 'unknown', name: 'Unknown', confidence: 0.50 + Math.random() * 0.2 },
        { id: 'image', name: 'Image', confidence: 0.90 + Math.random() * 0.05 }
      );
  }
  
  // Check filename for additional hints
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.includes('person') || lowerFileName.includes('human') || lowerFileName.includes('face')) {
    predictions.unshift({ id: 'person', name: 'Person', confidence: 0.95 });
  } else if (lowerFileName.includes('cat')) {
    predictions.unshift({ id: 'cat', name: 'Cat', confidence: 0.90 });
  } else if (lowerFileName.includes('dog')) {
    predictions.unshift({ id: 'dog', name: 'Dog', confidence: 0.90 });
  }
  
  // Sort by confidence and limit to top 3
  return predictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map((pred, index) => ({
      ...pred,
      confidence: Math.min(0.95, pred.confidence - index * 0.05) // Ensure decreasing confidence
    }));
}