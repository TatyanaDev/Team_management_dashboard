import { useState, useEffect } from "react";
import type { Task } from "../types/types";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      setTimeout(async () => {
        try {
          const { tasks } = await import("../../public/tasks.json");
          const tasksData = tasks as Task[];

          setTasks(tasksData);
        } catch (error) {
          console.error(error);
          setError("Error fetching tasks");
        } finally {
          setLoading(false);
        }
      }, 1000);
    })();
  }, []);

  return { tasks, setTasks, loading, error };
};
