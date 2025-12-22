/*
  Demo programs
  -------------
  These exist ONLY in memory for demo mode.
  They are never written to the database.
*/

export interface DemoProgram {
  id: string;
  school: string;
  sport: string;
  year: string;
}

export const demoPrograms: DemoProgram[] = [
  {
    id: "demo-track",
    school: "North Valley High School",
    sport: "Track & Field",
    year: "2025",
  },
  {
    id: "demo-xc",
    school: "North Valley High School",
    sport: "Cross Country",
    year: "2025",
  },
];
