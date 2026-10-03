export const YEARS = ["1st Year", "2nd Year"] as const;

export const BATCHES: Record<string, string[]> = {
  "1st Year": ["CSE-A", "CSE-B", "AI-DS", "CSE(AI)", "ECE"],
  "2nd Year": ["AI-DS", "CSE"],
};

export const TYPES = ["Notes", "Homework", "PPT", "Class Overview"] as const;

const AI_DS_1ST: Record<string, string> = {
  Biotechnology: "Shikha Dwivedi",
  EEE: "Diwaker Pathak",
  Maths: "Neha Singh",
  "Computational Mechanics": "Mithlesh Sir",
  "Computational Thinking": "Sushil Sir and Monica Mam",
  "Indian Heritage": "Ankur Sir",
  "MAOM and Yoga": "Arpan Sir",
  "Elements of Computing": "Manishika Mam and Kulbhushan Sir",
};

// Subject -> Teacher, keyed by year then batch
export const SUBJECT_TEACHERS: Record<string, Record<string, Record<string, string>>> = {
  "1st Year": {
    "CSE-A": {
      Maths: "Deepika Mam",
      "Computational Thinking": "Sushil Sir (online)",
      EEE: "Diwakar Pathak",
      Hardware: "Shikha Dwivedi",
      "Technical Communication": "Shail Jha Sir",
      "Indian Heritage": "Ankur Sir",
      MAOM: "Arpan Sir",
    },
    "CSE-B": {
      Maths: "Deepika Mam",
      "Computational Thinking": "Sushil Sir (online) and Monika Mam",
      EEE: "Ajit Debnath",
      Hardware: "Shikha Dwivedi",
      "Technical Communication": "Shail Jha Sir",
      "Indian Heritage": "Ankur Sir (online)",
      MAOM: "Arpan Sir",
    },
    "AI-DS": AI_DS_1ST,
    "CSE(AI)": {
      "Computational Programming": "B Rajathilagam (Principal)",
      "Discrete Maths": "Deepika Mam",
      "Elements of Computing": "Manishika Mam (online)",
      "Technical Communication": "Shail Jha",
      "Indian Heritage": "Ankur Sir (online)",
      "Computational Physics": "Luv Singh",
      MAOM: "Arpan",
      "Mathematics for Computing": "Neha Singh",
    },
    ECE: {
      "Engineering Maths": "Neha Singh",
      "Problem Solving and Algorithmic Thinking": "Sushil Sir (online) and Monika Mam",
      "Fundamental of Electronics": "Ajit Debnath (online)",
      "C Programming": "B Rajathilagam",
      "Nature Inspired Engineering": "Mithlesh Sir",
      "Physics of Semiconductor": "Kulbhushan Sir",
      "Indian Heritage": "Ankur Sir",
      MAOM: "Arpan Sir",
    },
  },
  "2nd Year": {
    "AI-DS": {
      "Intro to Robotics": "Mithlesh Sir",
      "Software Communication": "Ajit Debnath",
      "Engineering Maths": "Luv Sir",
      "Intro to Computer Network": "Shikha Dwivedi",
      Modelling: "Sumant Sir (online)",
      "AI/ML": "Akanksha Mam",
    },
    CSE: {
      "Digital Electronics": "Kulbhushan Sir",
      DSA: "B Rajathilagam",
      DBMS: "Akanksha Mam",
      "Optimisation Techniques Lab": "Luv Sir",
      "Procedural Programming using C": "Akanksha Mam",
    },
  },
};

export function subjectsFor(year: string, batch: string): string[] {
  return Object.keys(SUBJECT_TEACHERS[year]?.[batch] ?? {});
}

export function teacherFor(year: string, batch: string, subject: string): string {
  return SUBJECT_TEACHERS[year]?.[batch]?.[subject] ?? "";
}

export function parseBatches(value: string): string[] {
  return value.split("+").map((batch) => batch.trim()).filter(Boolean);
}

export function joinBatches(year: string, selected: string[]): string {
  const order = BATCHES[year] ?? [];
  return order.filter((batch) => selected.includes(batch)).join(" + ");
}

export function subjectsForBatches(year: string, batches: string[]): string[] {
  return Array.from(new Set(batches.flatMap((batch) => subjectsFor(year, batch)))).sort();
}

export function teacherForBatches(year: string, batches: string[], subject: string): string {
  return Array.from(
    new Set(batches.map((batch) => teacherFor(year, batch, subject)).filter(Boolean)),
  ).join(" / ");
}

export function belongsToBatch(value: string, batch: string): boolean {
  return !batch || parseBatches(value).includes(batch);
}

export const ALL_SUBJECTS = Array.from(
  new Set(
    Object.values(SUBJECT_TEACHERS).flatMap((batches) =>
      Object.values(batches).flatMap((map) => Object.keys(map)),
    ),
  ),
).sort();

export const STUDENT_PIN = "544545";
