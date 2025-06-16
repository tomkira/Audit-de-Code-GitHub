export interface Note {
  id: string;
  repoUrl: string;
  rating: number; // Note sur 10
  description: string;
  geminiAnalysis?: string;
  createdAt: string; 
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedContext?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  searchQuery?: string;
  groundingChunks?: GroundingChunk[];
}