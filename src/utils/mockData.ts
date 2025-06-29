export const generateMockSHAPValues = (features: string[]) => {
  return features.map(feature => ({
    feature,
    value: (Math.random() - 0.5) * 2 // Random value between -1 and 1
  }));
};

export const generateMockGradCAMData = (width: number, height: number) => {
  const data: number[][] = [];
  
  for (let i = 0; i < height; i++) {
    const row: number[] = [];
    for (let j = 0; j < width; j++) {
      // Create a circular hotspot in the center with some noise
      const centerX = width / 2;
      const centerY = height / 2;
      const distance = Math.sqrt((j - centerX) ** 2 + (i - centerY) ** 2);
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const intensity = Math.max(0, 1 - (distance / maxDistance)) + Math.random() * 0.2 - 0.1;
      row.push(Math.max(0, Math.min(1, intensity)));
    }
    data.push(row);
  }
  
  return data;
};