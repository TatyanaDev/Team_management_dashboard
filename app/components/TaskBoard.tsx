import { useState, useEffect, memo, useCallback } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import type { NotificationData, Task, TaskStatus } from "../types/types";
import { updateTaskOnServer } from "../services/taskService";
import { useTasks } from "../hooks/useTasks";
import StatusMessage from "./StatusMessage";
import Notification from "./Notification";
import Droppable from "./Droppable";

const TaskBoard = () => {
  const { tasks, setTasks, loading, error } = useTasks();

  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [notification, setNotification] = useState<NotificationData>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (tasks) {
      setOptimisticTasks(tasks);
    }
  }, [tasks]);

  const closeNotification = useCallback(() => setNotification((prev) => ({ ...prev, open: false })), []);

  const showNotification = useCallback(
    (message: string, severity: "success" | "error") => {
      closeNotification();

      setTimeout(() => {
        setNotification({
          open: true,
          message,
          severity,
        });
      }, 100);
    },
    [closeNotification]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const movedTask = tasks.find((task) => task.id === active.id);
      if (!movedTask) {
        return;
      }

      const newStatus = over.id;
      if (movedTask.status === newStatus) {
        // No status change, don't show notification
        return;
      }

      // Optimistically update the task status in local state (UI)
      const updatedTasks = optimisticTasks.map((task) => (task.id === movedTask.id ? { ...task, status: over.id as TaskStatus } : task));
      setOptimisticTasks(updatedTasks);

      try {
        // For task with ID "1", simulate the optimistic UI update and then send the request to the server
        if (movedTask.id === "1") {
          await updateTaskOnServer(movedTask.id, over.id as TaskStatus);
          showNotification(`Task "${movedTask.title}" moved to ${over.id}`, "success");
        } else {
          // For all other tasks, update the global state
          setTasks((prevTasks) => prevTasks.map((task) => (task.id === active.id ? { ...task, status: over.id as TaskStatus } : task)));
          showNotification(`Task "${movedTask.title}" moved to ${over.id}`, "success");
        }
      } catch (error) {
        // In case of an error, revert the changes made optimistically
        setOptimisticTasks(tasks);
        showNotification(`Failed to move task "${movedTask.title}" ${error}`, "error");
      }
    },
    [tasks, optimisticTasks, setTasks, showNotification]
  );

  if (loading) {
    return <StatusMessage type="loading" message="Loading..." />;
  }

  if (error) {
    return <StatusMessage type="error" message={error} />;
  }

  const columns: TaskStatus[] = ["To Do", "In Progress", "Done"];

  return (
    <Box component="section" aria-label="Task board with draggable tasks">
      <DndContext onDragEnd={handleDragEnd}>
        <Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
          }}
        >
          {columns.map((status) => (
            <Grid key={status} component="section" aria-labelledby={`task-column-${status.replace(/\s+/g, "-").toLowerCase()}`}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: { xs: 320, md: 360 },
                }}
              >
                <Typography id={`task-column-${status.replace(/\s+/g, "-").toLowerCase()}`} component="h2" variant="h6" sx={{ fontSize: { xs: 16, md: 18 }, fontWeight: 700 }}>
                  {status}
                </Typography>

                <Box sx={{ mt: 1.5, flex: 1, display: "flex" }} role="list" aria-label={`${status} tasks`}>
                  <Droppable status={status} tasks={optimisticTasks} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DndContext>

      <Notification notification={notification} closeNotification={closeNotification} />
    </Box>
  );
};

export default memo(TaskBoard);
