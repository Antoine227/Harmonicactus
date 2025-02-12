import { Link, useNavigate } from "react-router-dom";
import cactus1 from "../../assets/images/cactus1.png";
import cactusButton from "../../assets/images/cactus_button.png";
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
        <img src={cactusButton} alt="logout" className={styles.buttonImg} />
      </button>
      <h1 className={styles.harmonicactus}>
        <Link to="/account" className={styles.harmonicactus}>
          HARMONICACTUS
        </Link>
      </h1>
      <img src={cactus1} alt="cactus" className={styles.imgCactus} />
    </div>
  );
}

export default navbar;
