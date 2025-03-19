import { type SetStateAction, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import title from "../assets/images/harmonicactus.png";
import { useAuth } from "../contexts/AuthContext";
import api from "../helpers/api";
import { errorToast, successToast } from "../helpers/toast";
import styles from "./PagesCSS/Login.module.css";

function Signin() {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password === confirmPassword) {
      try {
        // Envoie les données d'inscription au serveur
        const response = await api.post("/api/register", {
          pseudo,
          password,
        });

        // Si l'inscription réussit
        if (response.status === 201) {
          successToast("Inscription réussie !");
          // Connexion automatique après l'inscription (facultatif)
          handleLogin(response.data.user); // Assumes the API returns the created user
          navigate("/account");
        } else {
          errorToast("Erreur lors de l'inscription. Veuillez réessayer.");
        }
      } catch (error) {
        errorToast(
          "Erreur lors de l'inscription. Veuillez vérifier vos informations.",
        );
        console.error("Erreur lors de l'inscription:", error);
      }
    } else {
      setPasswordMatch(false);
    }
  };

  const handlePasswordChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(e.target.value === password);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.head}>
        <img src={title} alt="Harminicacctus" className={styles.title} />
        <p className={styles.quote}>Car la désorganisation, ça pique</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.container}>
          <label htmlFor="pseudo" className={styles.label}>
            Pseudo :
          </label>
          <input
            type="text"
            id="pseudo"
            name="pseudo"
            required
            autoComplete="username"
            className={styles.input}
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>
        <div className={styles.container}>
          <label htmlFor="password" className={styles.label}>
            Mot de passe :
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="new-password"
            className={styles.input}
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className={styles.container}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirmer le mot de passe :
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            className={styles.input}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </div>
        {!passwordMatch && (
          <p className={styles.errorText}>
            Les mots de passe ne correspondent pas.
          </p>
        )}
        <button type="submit" className={styles.button}>
          S'inscrire
        </button>
      </form>
      <p className={styles.text}>
        Déjà un compte ?{" "}
        <Link to="/" className={styles.toggleButton}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default Signin;
