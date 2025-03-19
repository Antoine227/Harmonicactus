import { useState } from "react";
import styles from "./TaskAdd.module.css";

interface TaskAddProps {
  stepId: number;
  onAddTask: (stepId: number, taskDescription: string) => void;
  disabled?: boolean;
}

const TaskAdd: React.FC<TaskAddProps> = ({ stepId, onAddTask, disabled }) => {
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
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleAddTaskClick}
        className={styles.addTaskbutton}
        disabled={disabled}
        title="Ajouter une tâche"
      >
        +
      </button>
    </div>
  );
};

export default TaskAdd;
