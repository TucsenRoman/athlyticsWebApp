/*
  Demo workspace data
  -------------------
  Used for Workspace views (attendance, schedule, editor, etc).
*/

export const demoWorkspace = {
  athletes: [
    {
      id: "athlete-1",
      name: "Jordan Smith",
      grade: 11,
    },
    {
      id: "athlete-2",
      name: "Alex Johnson",
      grade: 10,
    },
    {
      id: "athlete-3",
      name: "athlete example",
      grade: 12,
    },
  ],

  workouts: [
    {
      id: "workout-1",
      title: "Acceleration & Starts",
      date: "2025-03-10",
      description: "Block starts, short sprints, and reaction work.",
    },
    {
      id: "workout-2",
      title: "Speed Endurance",
      date: "2025-03-12",
      description: "150–300m repeats at race pace.",
    },
  ],

  attendance: {
    date: "2025-03-12",
    present: ["athlete-1", "athlete-2"],
    absent: ["athlete-3"],
  },
};
