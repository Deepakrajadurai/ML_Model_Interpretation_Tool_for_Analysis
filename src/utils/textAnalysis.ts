export interface WordFrequency {
  text: string;
  value: number;
  percentage: number;
}

export interface TextStatistics {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  avgWordsPerSentence: number;
  avgCharsPerWord: number;
  readingTime: number;
  uniqueWords: number;
  lexicalDiversity: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'shall', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
]);

export function analyzeWordFrequency(text: string): WordFrequency[] {
  // Clean and tokenize text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));

  // Count word frequencies
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Convert to array and calculate percentages
  const totalWords = words.length;
  const frequencies = Object.entries(wordCount)
    .map(([text, value]) => ({
      text,
      value,
      percentage: (value / totalWords) * 100
    }))
    .sort((a, b) => b.value - a.value);

  return frequencies;
}

export function calculateTextStatistics(text: string): TextStatistics {
  const characters = text.length;
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const uniqueWords = new Set(
    words.map(word => word.toLowerCase().replace(/[^\w]/g, ''))
  ).size;
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgCharsPerWord = words.length > 0 ? 
    words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
  
  const readingTime = Math.ceil(words.length / 200); // 200 words per minute
  const lexicalDiversity = words.length > 0 ? uniqueWords / words.length : 0;

  return {
    characters,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
    readingTime,
    uniqueWords,
    lexicalDiversity: Math.round(lexicalDiversity * 100) / 100
  };
}

export function extractKeyPhrases(text: string, maxPhrases: number = 10): string[] {
  // Simple n-gram extraction for key phrases
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const phrases: Record<string, number> = {};
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));
    
    // Extract 2-grams and 3-grams
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words.slice(i, i + 2).join(' ');
      phrases[bigram] = (phrases[bigram] || 0) + 1;
      
      if (i < words.length - 2) {
        const trigram = words.slice(i, i + 3).join(' ');
        phrases[trigram] = (phrases[trigram] || 0) + 1;
      }
    }
  });
  
  return Object.entries(phrases)
    .filter(([phrase, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([phrase]) => phrase);
}