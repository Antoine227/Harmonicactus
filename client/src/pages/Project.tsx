import { useEffect, useState } from "react";
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
  participants: number[]; // Liste des IDs des participants
}

function Project() {
  const { id } = useParams<{ id: string }>(); // Récupère l'ID du projet depuis l'URL
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [newStepName, setNewStepName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await api.get(`/api/project/${id}`);
        setProject(projectResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement du projet :", error);
      }
    };

    fetchProjectData();
  }, [id]);

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

  if (!project) {
    return <div>Chargement du projet...</div>;
  }

  return (
    <>
      <Navbar />
      <div className={styles.projectContainer}>
        <h1 className={styles.projectTitle}>{project.title}</h1>

        {project && user && (
          <Participants projectId={project.id} currentUserId={user.id} />
        )}

        {project.steps && project.steps.length > 0 ? (
          <ul className={styles.stepsList}>
            {project.steps.map((step) => (
              <li key={step.id} className={styles.stepItem}>
                <div className={styles.stepHead}>
                  <select
                    value={step.type}
                    onChange={(e) =>
                      handleUpdateStep({
                        ...step,
                        type: e.target.value as
                          | "To do"
                          | "En cours"
                          | "Bloqué"
                          | "Fini",
                      })
                    }
                  >
                    <option value="To do">To do</option>
                    <option value="En cours">En cours</option>
                    <option value="Bloqué">Bloqué</option>
                    <option value="Fini">Fini</option>
                  </select>
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) =>
                      handleUpdateStep({ ...step, name: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(step.id)}
                  >
                    Supprimer
                  </button>
                </div>

                {/* Tasks */}
                <div className={styles.tasksSection}>
                  {step.tasks && step.tasks.length > 0 ? (
                    <ul className={styles.tasksList}>
                      {step.tasks.map((task) => (
                        <li key={task.id} className={styles.taskItem}>
                          <TaskItem
                            task={task}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
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
                    <TaskAdd stepId={step.id} onAddTask={handleAddTask} />
                  </div>
                </div>
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
            onChange={(e) => setNewStepName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddStep();
              }
            }}
          />
          <button
            type="button"
            className={styles.addStepButton}
            onClick={handleAddStep}
          >
            Ajouter une Étape
          </button>
        </div>
      </div>
    </>
  );
}

export default Project;
