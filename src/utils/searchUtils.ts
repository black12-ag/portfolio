// Empty searchUtils stub for portfolio - search functionality not needed
export const searchUtils = {};

// Mock exports for existing imports
export const generateSearchSuggestions = () => [];
export const autoCorrect = (term: string) => term;
export const highlightMatch = (text: string) => text;
export type SearchSuggestion = {
  text: string;
  type: string;
};
