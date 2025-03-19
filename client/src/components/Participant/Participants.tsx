import { useEffect, useState } from "react";
import api from "../../helpers/api";
import styles from "./Participants.module.css";

interface ParticipantProps {
  projectId: number;
  currentUserId: number;
  setIsParticipant: (value: boolean) => void;
}

interface Participant {
  id: number;
  pseudo: string;
  color: string;
}

const Participants: React.FC<ParticipantProps> = ({
  projectId,
  currentUserId,
  setIsParticipant,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await api.get(`/api/project/${projectId}/participants`);
      setParticipants(response.data);
      const isParticipating = response.data.some(
        (p: Participant) => p.id === currentUserId,
      );
      setIsParticipating(isParticipating);
      setIsParticipant(isParticipating);
    } catch (error) {
      console.error("Erreur lors de la récupération des participants :", error);
    }
  };

  const handleParticipate = async () => {
    try {
      await api.post(`/api/project/${projectId}/participate`);
      fetchParticipants();
    } catch (error) {
      console.error("Erreur lors de la participation au projet :", error);
    }
  };

  return (
    <div className={styles.participantsSection}>
      <h2 className={styles.participantsTitle}>Participants</h2>
      <ul className={styles.participantsList}>
        {participants.map((participant) => (
          <li key={participant.id} style={{ color: participant.color }}>
            {participant.pseudo}
          </li>
        ))}
      </ul>
      {!isParticipating && (
        <button
          type="button"
          onClick={handleParticipate}
          className={styles.participateButton}
        >
          Participer
        </button>
      )}
    </div>
  );
};

export default Participants;
