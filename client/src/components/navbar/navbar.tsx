import { Link, useNavigate } from "react-router-dom";
import cactus1 from "../../assets/images/cactus1.png";
import cactusButton from "../../assets/images/cactus_button.png";
import title from "../../assets/images/harmonicactus.png";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./navbar.module.css";

function navbar() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    handleLogout();
    // Rediriger vers la page d'accueil après la déconnexion
    navigate("/");
  };

  return (
    <div className={styles.navContainer}>
      <button
        type="button"
        onClick={handleAuthAction}
        className={styles.button}
      >
        <img
          src={cactusButton}
          alt="logout"
          className={styles.buttonImg}
          title="Déconnection"
        />
      </button>
      <div className={styles.harmonicactus}>
        <Link to="/account" className={styles.harmonicactus}>
          <img
            src={title}
            alt="Harminicacctus"
            title="Retour au compte"
            className={styles.title}
          />
        </Link>
      </div>
      <img src={cactus1} alt="cactus" className={styles.imgCactus} />
    </div>
  );
}

export default navbar;
