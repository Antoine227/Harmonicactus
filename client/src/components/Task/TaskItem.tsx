import type { Task } from "../../pages/Project";

interface TaskItemProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
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
      >
        <option value="To do">To do</option>
        <option value="En cours">En cours</option>
        <option value="Bloqué">Bloqué</option>
        <option value="Fini">Fini</option>
      </select>
      <input
        type="text"
        value={task.Description}
        onChange={handleDescriptionChange}
      />
      <button type="button" onClick={() => onDeleteTask(task.id)}>
        Supprimer
      </button>
    </>
  );
};

export default TaskItem;
