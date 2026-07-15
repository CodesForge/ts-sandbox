import {z} from "zod";

export const TasksSchema = z.object({
    title: z.string()
        .min(3, "Title must be at least 3 characters")
        .max(30, "Title must be at most 30 characters"),
    description: z.string()
        .min(3, "Description must be at least 3 characters")
        .max(255, "Description must be at most 255 characters")
});

export type TasksSchemaType = z.infer<typeof TasksSchema>;