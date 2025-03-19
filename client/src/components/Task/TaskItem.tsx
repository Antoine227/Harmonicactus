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
      <div className={styles.taskHeadLeft}>
        <select
          value={task.type}
          className={styles.taskSelect}
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
          className={styles.taskHeadButton}
          onClick={() => onAssignParticipants(task.id)}
          disabled={!isParticipant}
          title="S'assigner la tâche"
        >
          🖐
        </button>
        {task.participants.map((participant) => (
          <span
            key={participant.id}
            className={styles.participantTag}
            style={{ color: participant.color }}
          >
            {participant.pseudo.substring(0, 5)}
            <button
              type="button"
              onClick={() => onRemoveParticipant(task.id, participant.id)}
              className={styles.participantCross}
              disabled={!isParticipant}
              title="Désassigner la tâche"
            >
              ❌
            </button>
          </span>
        ))}
        <input
          type="text"
          className={styles.taskHeadinput}
          value={task.Description}
          onChange={handleDescriptionChange}
          disabled={!isParticipant}
        />
      </div>
      <button
        type="button"
        className={styles.taskDeleteButton}
        onClick={() => onDeleteTask(task.id)}
        disabled={!isParticipant}
        title="Supprimer"
      >
        ❌
      </button>
    </>
  );
};

export default TaskItem;
