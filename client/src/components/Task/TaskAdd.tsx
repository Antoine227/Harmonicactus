import { useState } from "react";
import styles from "./TaskItem.module.css";

interface TaskAddProps {
  stepId: number;
  onAddTask: (stepId: number, taskDescription: string) => void;
}

const TaskAdd: React.FC<TaskAddProps> = ({ stepId, onAddTask }) => {
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const handleAddTaskClick = () => {
    onAddTask(stepId, newTaskDescription);
    setNewTaskDescription("");
  };

  return (
    <div className={styles.addTask}>
      <input
        type="text"
        placeholder="Description de la tâche"
        className={styles.taskDescriptionInput}
        value={newTaskDescription}
        onChange={(e) => setNewTaskDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddTaskClick();
          }
        }}
      />
      <button
        type="button"
        onClick={handleAddTaskClick}
        className={styles.addTaskbutton}
      >
        Ajouter une Tâche
      </button>
    </div>
  );
};

export default TaskAdd;
