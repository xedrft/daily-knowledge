export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  checkField: () => `${API_BASE}/check-field`,
  listConcepts: () => `${API_BASE}/list-concepts`,
  getConcept: () => `${API_BASE}/get-concept`,
  conceptGet: () => `${API_BASE}/concept/get`,
  getFieldSuggestions: () => `${API_BASE}/get-field-suggestions`,
  changeField: () => `${API_BASE}/change-field`,
  initializeProfile: () => `${API_BASE}/initialize-profile`,
  updateLevel: () => `${API_BASE}/update-level`,
  updatePreviouslyLearned: () => `${API_BASE}/update-previously-learned`,
  signin: () => `${API_BASE}/signin`,
  register: () => `${API_BASE}/register`,
  // Activity & streak
  recordActivity: () => `${API_BASE}/record-activity`,
  getActivity: (from: string, to: string) => `${API_BASE}/activity?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  getStreak: (date?: string) => date ? `${API_BASE}/streak?date=${encodeURIComponent(date)}` : `${API_BASE}/streak`,
  // Concept management
  regenerateConcept: () => `${API_BASE}/concept/regenerate`,
};
