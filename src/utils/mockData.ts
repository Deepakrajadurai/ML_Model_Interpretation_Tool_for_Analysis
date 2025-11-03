export const generateMockSHAPValues = (features: string[]) => {
  return features.map(feature => ({
    feature,
    value: (Math.random() - 0.5) * 2 // Random value between -1 and 1
  }));
};

export const generateMockGradCAMData = (width: number, height: number) => {
  const heatmapData: number[][] = [];
  
  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const row: number[] = [];
    for (let colIndex = 0; colIndex < width; colIndex++) {
      // Create a circular hotspot in the center with some noise
      const centerX = width / 2;
      const centerY = height / 2;
      const distance = Math.sqrt((colIndex - centerX) ** 2 + (rowIndex - centerY) ** 2);
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const intensity = Math.max(0, 1 - (distance / maxDistance)) + Math.random() * 0.2 - 0.1;
      row.push(Math.max(0, Math.min(1, intensity)));
    }
    heatmapData.push(row);
  }
  
  return heatmapData;
};

export const generateMockSentimentData = (sentences: string[]) => {
  return sentences.slice(0, 20).map(sentence => ({
    sentence: sentence.trim(),
    sentiment: (Math.random() - 0.5) * 2, // Random sentiment between -1 and 1
    confidence: 0.6 + Math.random() * 0.4 // Random confidence between 0.6 and 1
  }));
};

export const generateMockWordCloudData = (text: string) => {
  // Simple word frequency analysis
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Filter out short words
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Convert to array and sort by frequency
  return Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Top 50 words
};