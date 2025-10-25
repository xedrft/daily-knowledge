export type CourseCategoryKey =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "engineering"
  | "cs";

export interface CourseCategory {
  key: CourseCategoryKey;
  label: string;
  courses: string[];
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    key: "math",
    label: "Math",
    courses: [
      "Algebra I",
      "Algebra II",
      "Geometry",
      "Trigonometry",
      "Precalculus",
      "Calculus I",
      "Calculus II",
      "Calculus III",
      "Linear Algebra",
      "Differential Equations",
      "Probability",
      "Statistics",
      "Discrete Mathematics",
      "Number Theory",
      "Abstract Algebra",
      "Real Analysis",
      "Complex Analysis",
    ],
  },
  {
    key: "physics",
    label: "Physics",
    courses: [
      "Physics I (Mechanics)",
      "Physics II (E&M)",
      "Modern Physics",
      "Quantum Mechanics",
      "Thermodynamics",
      "Classical Mechanics",
      "Waves and Optics",
    ],
  },
  {
    key: "chemistry",
    label: "Chemistry",
    courses: [
      "General Chemistry I",
      "General Chemistry II",
      "Organic Chemistry I",
      "Organic Chemistry II",
      "Physical Chemistry",
      "Analytical Chemistry",
    ],
  },
  {
    key: "biology",
    label: "Biology",
    courses: [
      "Biology I",
      "Biology II",
      "Genetics",
      "Cell Biology",
      "Microbiology",
      "Biochemistry",
      "Anatomy and Physiology",
    ],
  },
  {
    key: "engineering",
    label: "Engineering",
    courses: [
      "Intro to Engineering",
      "Statics",
      "Dynamics",
      "Materials Science",
      "Circuits",
      "Digital Logic",
      "Signals and Systems",
      "Control Systems",
      "Fluid Mechanics",
      "Engineering Thermodynamics",
    ],
  },
  {
    key: "cs",
    label: "Computer Science",
    courses: [
      "Intro to Computer Science",
      "Data Structures",
      "Algorithms",
      "Computer Architecture",
      "Operating Systems",
      "Databases",
      "Computer Networks",
      "Software Engineering",
      "Theory of Computation",
      "Machine Learning (Intro)",
    ],
  },
];

// Flat catalog preserved for compatibility in places that expect a string[]
export const COURSE_CATALOG: string[] = Array.from(
  new Set(COURSE_CATEGORIES.flatMap((c) => c.courses)),
);
