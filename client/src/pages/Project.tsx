import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Participants from "../components/Participant/Participants";
import TaskAdd from "../components/Task/TaskAdd";
import TaskItem from "../components/Task/TaskItem";
import Navbar from "../components/navbar/navbar";
import { useAuth } from "../contexts/AuthContext";
import api from "../helpers/api";
import styles from "./PagesCSS/Project.module.css";

interface ProjectDetails {
  id: number;
  title: string;
  user_id: number;
  steps: Step[];
}

interface Step {
  id: number;
  name: string;
  type: "To do" | "En cours" | "Bloqué" | "Fini";
  project_id: number;
  tasks: Task[];
}

export interface Task {
  id: number;
  Description: string;
  type: "To do" | "En cours" | "Bloqué" | "Fini";
  step_id: number;
  participants: { id: number; pseudo: string; color: string }[]; // Liste des IDs des participants
}

// Define a type for SSE events
type SSEEvent =
  | {
      type: "taskUpdated";
      taskId: number;
      description: string;
      taskType: "To do" | "En cours" | "Bloqué" | "Fini";
    }
  | { type: "stepCreated"; step: Step }
  | { type: "taskCreated"; task: Task; stepId: number }
  | {
      type: "participantAssigned";
      taskId: number;
      userId: number;
      pseudo: string;
      color: string;
    }
  // Add other event types here
  | { type: "error"; message: string }; // Generic error event

function Project() {
  const { id } = useParams<{ id: string }>(); // Récupère l'ID du projet depuis l'URL
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [newStepName, setNewStepName] = useState("");
  const [isParticipant, setIsParticipant] = useState(false);
  const [collapsedSteps, setCollapsedSteps] = useState<number[]>([]);
  const { user } = useAuth();

  // Use useCallback for handleProjectUpdate to prevent unnecessary re-renders
  const handleProjectUpdate = useCallback((data: SSEEvent) => {
    setProject((prevProject) => {
      if (!prevProject) return prevProject;

      switch (data.type) {
        case "taskUpdated":
          return {
            ...prevProject,
            steps: prevProject.steps.map((step) => ({
              ...step,
              tasks: step.tasks.map((task) =>
                task.id === data.taskId
                  ? {
                      ...task,
                      Description: data.description,
                      type: data.taskType,
                    }
                  : task,
              ),
            })),
          };
        // Handle other event types (stepCreated, taskCreated, etc.)
        default:
          console.warn("Unhandled event type:", data.type);
          return prevProject;
      }
    });
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await api.get(`/api/project/${id}`);
        setProject(projectResponse.data);
        setIsParticipant(projectResponse.data.user_id === user?.id);
      } catch (error) {
        console.error("Erreur lors du chargement du projet :", error);
      }
    };

    fetchProjectData();

    // Set up EventSource
    const eventSource = new EventSource("http://localhost:3000/events");

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data); // Assertion du type SSEEvent
        handleProjectUpdate(data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id, user, handleProjectUpdate]);

  // logique des étapes

  const handleAddStep = async () => {
    try {
      if (!project) return;
      const response = await api.post(`/api/project/${project.id}/steps`, {
        name: newStepName,
        type: "To do",
      });
      setProject({ ...project, steps: [...project.steps, response.data] });
      setNewStepName("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'étape :", error);
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    try {
      await api.delete(`/api/steps/${stepId}`);
      if (project) {
        setProject({
          ...project,
          steps: project.steps.filter((step) => step.id !== stepId),
          id: project.id,
          title: project.title,
          user_id: project.user_id,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étape :", error);
    }
  };

  const handleUpdateStep = async (step: Step) => {
    try {
      await api.put(`/api/steps/${step.id}`, {
        name: step.name,
        type: step.type,
      });
      if (project) {
        setProject({
          ...project,
          steps: project.steps.map((s) => (s.id === step.id ? step : s)),
        });
      }
    } catch (error) {
      console.error("Erreur lors de la modification de l'étape :", error);
    }
  };

  // Logiques des tâches

  const handleAddTask = async (stepId: number, taskDescription: string) => {
    try {
      if (!project) return;
      const response = await api.post(`/api/steps/${stepId}/tasks`, {
        Description: taskDescription,
        type: "To do",
        participants: [],
      });
      setProject({
        ...project,
        steps: project.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                tasks: Array.isArray(step.tasks)
                  ? [...step.tasks, response.data]
                  : [response.data],
              }
            : step,
        ),
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche :", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      if (project) {
        setProject({
          ...project,
          steps: project.steps.map((step) => ({
            ...step,
            tasks: step.tasks.filter((task) => task.id !== taskId),
          })),
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche :", error);
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.id}`, {
        Description: task.Description,
        type: task.type,
      });
      if (project) {
        setProject({
          ...project,
          steps: project.steps.map((step) => ({
            ...step,
            tasks: step.tasks.map((t) => (t.id === task.id ? task : t)),
          })),
        });
      }
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche :", error);
    }
  };

  const handleAssignParticipants = async (taskId: number) => {
    try {
      if (!user || !project) return;

      // Récupérer les participants du projet
      const participantsResponse = await api.get(
        `/api/project/${project.id}/participants`,
      );
      const participants = participantsResponse.data;

      // Trouver l'utilisateur actuel dans la liste des participants
      const currentUser = participants.find(
        (p: { id: number; pseudo: string; color: string }) => p.id === user.id,
      );

      if (!currentUser) {
        console.error("L'utilisateur n'est pas un participant du projet");
        return;
      }

      // Appel à l'API pour attribuer l'utilisateur à la tâche
      await api.post(`/api/tasks/${taskId}/assign`, { userId: user.id }); // S'assurer que user.id est un nombre valide

      // Mise à jour de l'état local du projet
      setProject({
        ...project,
        steps: project.steps.map((step) => ({
          ...step,
          tasks: step.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  participants: [
                    ...task.participants,
                    {
                      id: user.id,
                      pseudo: user.pseudo,
                      color: currentUser.color,
                    },
                  ],
                }
              : task,
          ),
        })),
      });
    } catch (error) {
      console.error("Erreur lors de l'attribution de la tâche :", error);
    }
  };

  const handleRemoveParticipant = async (
    taskId: number,
    participantId: number,
  ) => {
    try {
      await api.delete(`/api/tasks/${taskId}/participants/${participantId}`);
      if (project) {
        setProject({
          ...project,
          steps: project.steps.map((step) => ({
            ...step,
            tasks: step.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    participants: task.participants.filter(
                      (p) => p.id !== participantId,
                    ),
                  }
                : task,
            ),
          })),
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du participant de la tâche :",
        error,
      );
    }
  };

  // Fonction pour basculer l'état d'une étape
  const toggleStepCollapse = (stepId: number) => {
    setCollapsedSteps((prevCollapsedSteps) =>
      prevCollapsedSteps.includes(stepId)
        ? prevCollapsedSteps.filter((id) => id !== stepId)
        : [...prevCollapsedSteps, stepId],
    );
  };

  if (!project) {
    return <div>Chargement du projet...</div>;
  }

  return (
    <>
      <Navbar />
      <div className={styles.projectContainer}>
        <h1 className={styles.projectTitle}>{project.title}</h1>

        {project && user && (
          <Participants
            projectId={project.id}
            currentUserId={user.id}
            setIsParticipant={setIsParticipant}
          />
        )}

        {project.steps && project.steps.length > 0 ? (
          <ul className={styles.stepsList}>
            {project.steps.map((step) => (
              <li key={step.id} className={styles.stepItem}>
                <div className={styles.stepHead}>
                  <select
                    value={step.type}
                    onChange={(e) =>
                      isParticipant &&
                      handleUpdateStep({
                        ...step,
                        type: e.target.value as
                          | "To do"
                          | "En cours"
                          | "Bloqué"
                          | "Fini",
                      })
                    }
                    disabled={!isParticipant}
                  >
                    <option value="To do">To do</option>
                    <option value="En cours">En cours</option>
                    <option value="Bloqué">Bloqué</option>
                    <option value="Fini">Fini</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => toggleStepCollapse(step.id)}
                  >
                    {collapsedSteps.includes(step.id) ? "🐵" : "🙈"}
                  </button>

                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) =>
                      isParticipant &&
                      handleUpdateStep({ ...step, name: e.target.value })
                    }
                    disabled={!isParticipant}
                  />
                  <button
                    type="button"
                    onClick={() => isParticipant && handleDeleteStep(step.id)}
                    disabled={!isParticipant}
                  >
                    🗑
                  </button>
                </div>

                {/* Tasks */}
                {!collapsedSteps.includes(step.id) && (
                  <div className={styles.tasksSection}>
                    {step.tasks && step.tasks.length > 0 ? (
                      <ul className={styles.tasksList}>
                        {step.tasks.map((task) => (
                          <li key={task.id} className={styles.taskItem}>
                            <TaskItem
                              task={task}
                              onUpdateTask={handleUpdateTask}
                              onDeleteTask={handleDeleteTask}
                              isParticipant={isParticipant}
                              onAssignParticipants={handleAssignParticipants}
                              onRemoveParticipant={handleRemoveParticipant}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.noTask}>
                        Aucune tâche pour le moment.
                      </p>
                    )}
                    <div className={styles.addTask}>
                      <TaskAdd
                        stepId={step.id}
                        onAddTask={handleAddTask}
                        disabled={!isParticipant}
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noStep}>Aucune étape pour le moment.</p>
        )}
        <div className={styles.stepsSection}>
          <input
            type="text"
            placeholder="Nom de l'étape"
            className={styles.stepTitleInput}
            value={newStepName}
            onChange={(e) => isParticipant && setNewStepName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddStep();
              }
            }}
            disabled={!isParticipant}
          />
          <button
            type="button"
            className={styles.addStepButton}
            onClick={handleAddStep}
            disabled={!isParticipant}
          >
            Ajouter une Étape
          </button>
        </div>
      </div>
    </>
  );
}

export default Project;
