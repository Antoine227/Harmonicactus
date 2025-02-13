import type { Task } from "../../pages/Project";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  isParticipant: boolean;
  onAssignParticipants: (taskId: number) => void;
  onRemoveParticipant: (taskId: number, participantId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
  isParticipant,
  onAssignParticipants,
  onRemoveParticipant,
}) => {
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateTask({ ...task, Description: e.target.value });
  };

  return (
    <>
      <select
        value={task.type}
        onChange={(e) =>
          onUpdateTask({
            ...task,
            type: e.target.value as "To do" | "En cours" | "Bloqué" | "Fini",
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
        onClick={() => onAssignParticipants(task.id)}
        disabled={!isParticipant}
      >
        🖐
      </button>
      {task.participants.map((participant) => (
        <span key={participant.id} className={styles.participantTag}>
          {participant.pseudo}
          <button
            type="button"
            onClick={() => onRemoveParticipant(task.id, participant.id)}
            className={styles.participantCross}
            disabled={!isParticipant}
          >
            ❌
          </button>
        </span>
      ))}
      <input
        type="text"
        value={task.Description}
        onChange={handleDescriptionChange}
        disabled={!isParticipant}
      />
      <button
        type="button"
        onClick={() => onDeleteTask(task.id)}
        disabled={!isParticipant}
      >
        🗑
      </button>
    </>
  );
};

export default TaskItem;
