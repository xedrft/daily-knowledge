export const API_BASE = "http://127.0.0.1:1337/api";

export const endpoints = {
  checkField: () => `${API_BASE}/check-field`,
  listConcepts: () => `${API_BASE}/list-concepts`,
  getConcept: () => `${API_BASE}/get-concept`,
  conceptGet: () => `${API_BASE}/concept/get`,
  getFieldSuggestions: () => `${API_BASE}/get-field-suggestions`,
  changeField: () => `${API_BASE}/change-field`,
  signin: () => `${API_BASE}/signin`,
  register: () => `${API_BASE}/register`,
};
