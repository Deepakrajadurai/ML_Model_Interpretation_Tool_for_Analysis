// Simple rule-based sentiment analysis
// In a production app, you'd use a proper NLP library or API

const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant',
  'outstanding', 'superb', 'magnificent', 'marvelous', 'terrific', 'fabulous', 'incredible',
  'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'delighted', 'thrilled',
  'excited', 'grateful', 'thankful', 'appreciate', 'perfect', 'beautiful', 'nice',
  'positive', 'success', 'successful', 'win', 'winner', 'victory', 'triumph', 'achieve',
  'accomplished', 'effective', 'efficient', 'helpful', 'useful', 'valuable', 'benefit',
  'advantage', 'improvement', 'better', 'best', 'superior', 'quality', 'recommend'
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'dislike', 'despise',
  'angry', 'mad', 'furious', 'annoyed', 'frustrated', 'disappointed', 'sad', 'unhappy',
  'depressed', 'worried', 'concerned', 'afraid', 'scared', 'anxious', 'stressed',
  'problem', 'issue', 'trouble', 'difficulty', 'challenge', 'obstacle', 'failure',
  'fail', 'lose', 'loss', 'defeat', 'wrong', 'mistake', 'error', 'fault', 'blame',
  'worst', 'worse', 'inferior', 'poor', 'low', 'weak', 'useless', 'worthless',
  'waste', 'expensive', 'costly', 'overpriced', 'slow', 'broken', 'damaged'
];

const INTENSIFIERS = [
  'very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really',
  'quite', 'rather', 'pretty', 'fairly', 'somewhat', 'highly', 'deeply', 'truly'
];

const NEGATORS = [
  'not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor',
  'hardly', 'scarcely', 'barely', 'seldom', 'rarely', 'without', 'lack', 'lacking'
];

export interface SentimentResult {
  sentence: string;
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  positiveWords: string[];
  negativeWords: string[];
}

export function analyzeSentiment(text: string): SentimentResult[] {
  // Split text into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences.map(sentence => {
    const words = sentence.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    let positiveScore = 0;
    let negativeScore = 0;
    const positiveWords: string[] = [];
    const negativeWords: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let multiplier = 1;
      
      // Check for intensifiers before this word
      if (i > 0 && INTENSIFIERS.includes(words[i - 1])) {
        multiplier = 1.5;
      }
      
      // Check for negators before this word (within 2 words)
      let isNegated = false;
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (NEGATORS.includes(words[j])) {
          isNegated = true;
          break;
        }
      }
      
      if (POSITIVE_WORDS.includes(word)) {
        const score = multiplier;
        if (isNegated) {
          negativeScore += score;
          negativeWords.push(word);
        } else {
          positiveScore += score;
          positiveWords.push(word);
        }
      } else if (NEGATIVE_WORDS.includes(word)) {
        const score = multiplier;
        if (isNegated) {
          positiveScore += score;
          positiveWords.push(word);
        } else {
          negativeScore += score;
          negativeWords.push(word);
        }
      }
    }
    
    // Calculate final sentiment score
    const totalScore = positiveScore + negativeScore;
    let sentiment = 0;
    let confidence = 0;
    
    if (totalScore > 0) {
      sentiment = (positiveScore - negativeScore) / totalScore;
      confidence = Math.min(totalScore / words.length, 1);
    }
    
    // Normalize confidence to be more realistic
    confidence = Math.max(0.3, Math.min(0.95, confidence + 0.2));
    
    return {
      sentence: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
      sentiment,
      confidence,
      positiveWords,
      negativeWords
    };
  });
}

export function getOverallSentiment(results: SentimentResult[]): {
  overall: number;
  confidence: number;
  distribution: { positive: number; neutral: number; negative: number };
} {
  if (results.length === 0) {
    return { overall: 0, confidence: 0, distribution: { positive: 0, neutral: 0, negative: 0 } };
  }
  
  const weightedSum = results.reduce((sum, result) => 
    sum + (result.sentiment * result.confidence), 0
  );
  const totalWeight = results.reduce((sum, result) => sum + result.confidence, 0);
  
  const overall = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const confidence = totalWeight / results.length;
  
  // Calculate distribution
  let positive = 0, neutral = 0, negative = 0;
  results.forEach(result => {
    if (result.sentiment > 0.1) positive++;
    else if (result.sentiment < -0.1) negative++;
    else neutral++;
  });
  
  const total = results.length;
  const distribution = {
    positive: positive / total,
    neutral: neutral / total,
    negative: negative / total
  };
  
  return { overall, confidence, distribution };
}