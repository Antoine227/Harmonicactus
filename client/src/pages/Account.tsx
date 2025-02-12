import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importe Link
import Navbar from "../components/navbar/navbar";
import { useAuth } from "../contexts/AuthContext"; // Importe le contexte d'authentification
import api from "../helpers/api";
import styles from "./PagesCSS/Account.module.css";

interface Project {
  id: number;
  title: string;
  user_id: number;
}

function Account() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState(""); // Ajout d'un état pour le titre du nouveau projet
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const { user } = useAuth(); // Récupère l'utilisateur connecté depuis le contexte d'authentification

  useEffect(() => {
    // Récupére la liste des projets au chargement de la page
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/account/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
      }
    };

    if (user) {
      // Vérifie si l'utilisateur est connecté avant de récupérer les projets
      fetchProjects();
    }
  }, [user]); // Dépendance à user pour recharger les projets quand l'utilisateur change

  const handleCreateProject = async () => {
    // Créer un nouveau projet
    try {
      if (!newProjectTitle.trim()) {
        alert("Veuillez entrer un titre pour le projet.");
        return;
      }

      const response = await api.post("/api/account/projects", {
        title: newProjectTitle,
      });
      setProjects([...projects, response.data]);
      setNewProjectTitle(""); // Réinitialise le champ de saisie
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
    }
  };

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedProjects([]); // Déselectionne tous les projets
  };

  const handleProjectSelection = (projectId: number) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId)); // Désélectionner
    } else {
      setSelectedProjects([...selectedProjects, projectId]); // Sélectionner
    }
  };

  const handleDeleteProjects = async () => {
    try {
      if (selectedProjects.length === 0) {
        alert("Veuillez sélectionner au moins un projet à supprimer.");
        return;
      }

      // Suppression des projets sélectionnés
      await Promise.all(
        selectedProjects.map(async (projectId) => {
          await api.delete(`/api/account/projects/${projectId}`);
        }),
      );

      // Mise à jour de la liste des projets
      setProjects(
        projects.filter((project) => !selectedProjects.includes(project.id)),
      );
      setSelectedProjects([]); // Réinitialise la sélection
      setIsDeleteMode(false); // Désactive le mode suppression
    } catch (error) {
      console.error("Erreur lors de la suppression des projets:", error);
      // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.accountContainer}>
        {" "}
        <div className={styles.createProjectSection}>
          <input
            type="text"
            placeholder="Nom du projet"
            className={styles.projectTitleInput}
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateProject();
              }
            }}
          />
          <button
            type="button"
            className={styles.createProjectButton}
            onClick={handleCreateProject}
          >
            CRÉER
          </button>
        </div>
        <div className={styles.deleteProjectSection}>
          <button
            type="button"
            className={styles.deleteProjectButton}
            onClick={handleDeleteModeToggle}
          >
            {isDeleteMode ? "Annuler" : "Supprimer"}
          </button>
          {isDeleteMode && (
            <button
              type="button"
              className={styles.confirmDeleteButton}
              onClick={handleDeleteProjects}
              disabled={selectedProjects.length === 0}
            >
              Confirmer
            </button>
          )}
        </div>
        <div className={styles.projectsContainer}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <button
                type="button"
                key={project.id}
                className={`${styles.projectItem} ${isDeleteMode ? styles.selectableProject : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isDeleteMode) {
                    handleProjectSelection(project.id);
                  }
                }}
              >
                {isDeleteMode ? (
                  <div className={styles.deleteFieldInput}>
                    <span>{project.title}</span>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleProjectSelection(project.id)}
                      className={styles.deleteBoxInput}
                    />
                  </div>
                ) : (
                  <Link
                    to={`/project/${project.id}`}
                    className={styles.projectLink}
                  >
                    {project.title}
                  </Link>
                )}
              </button>
            ))
          ) : (
            <p className={styles.noProjectsMessage}>
              Aucun projet pour le moment.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Account;
