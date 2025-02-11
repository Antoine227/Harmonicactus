import { Link } from "react-router-dom";
import styles from "./PagesCSS/Login.module.css";

function Login() {
  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.title}>HARMONICACTUS</h1>
      <form className={styles.form}>
        <div className={styles.container}>
          <label htmlFor="pseudo" className={styles.label}>
            Pseudo :{" "}
          </label>
          <input
            type="text"
            id="pseudo"
            name="pseudo"
            required
            autoComplete="pseudo"
            className={styles.input}
          />
        </div>
        <div className={styles.container}>
          <label htmlFor="password" className={styles.label}>
            Password :{" "}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="current-password"
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.button}>
          Se connecter
        </button>
      </form>
      <p className={styles.text}>
        Pas encore de compte ?{" "}
        <Link to="/signin" className={styles.toggleButton}>
          S'inscrire
        </Link>
      </p>
    </div>
  );
}

export default Login;
