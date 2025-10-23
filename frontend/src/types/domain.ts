export interface ConceptSummary {
  documentId: string;
  title: string;
  difficulty: number;
  fields: string[];
  learned?: boolean;
  recentOrder?: number;
}

export interface ConceptFull {
  title: string;
  content: string;
  problemset?: any[];
  fields?: string[];
  difficulty?: number;
  cot?: string;
}

export interface UserData {
  hasField: boolean;
  currentField: string | null;
  pastFields: string[];
  conceptStats: {
    currentFieldCount: number;
    totalConceptsCount: number;
  };
  current_level?: number | null;
  previouslyLearned?: string[];
  onboardingComplete?: boolean;
}
