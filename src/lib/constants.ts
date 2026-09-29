export const YEARS = ["1st Year", "2nd Year"] as const;

export const BATCHES: Record<string, string[]> = {
  "1st Year": ["CSE-A", "CSE-B", "AI-DS", "CSE(AI)", "ECE"],
  "2nd Year": ["AI-DS", "CSE"],
};

export const TYPES = ["Notes", "Homework", "PPT", "Class Overview"] as const;

export const SUBJECT_TEACHERS: Record<string, string> = {
  Biotechnology: "Shikha Dwivedi",
  EEE: "Diwaker Pathak",
  Maths: "Neha Singh",
  "Computational Mechanics": "Mithlesh Sir",
  "Computational Thinking": "Sushil Sir and Monica Mam",
  "Indian Heritage": "Ankur Sir",
  "MAOM and Yoga": "Arpan Sir",
  "Elements of Computing": "Manishika Mam and Kulbhushan Sir",
};

export const SUBJECTS = Object.keys(SUBJECT_TEACHERS);

export const STUDENT_PIN = "544545";
