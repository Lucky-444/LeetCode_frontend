import {z} from 'zod';
export const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Difficulty is required",
  }),
  tags: z.array(z.string()).optional(),

  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().min(1, "Explanation is required"),
    })
  ).min(1, "At least one visible test case is required"),

  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    })
  ).min(1, "At least one hidden test case is required"),

  starterCode: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      initialCode: z.string().min(1, "Initial code is required"),
    })
  ).length(3, "All three starter codes are required"),

  referenceSolution: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      completeCode: z.string().min(1, "Complete code is required"),
    })
  ).length(3, "All three reference solutions are required"),

  constraints: z.object({
    timeLimit: z.string().min(1, "Time limit is required"),
    memoryLimit: z.string().min(1, "Memory limit is required"),
  }),
});
