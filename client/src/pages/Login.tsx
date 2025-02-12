import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../helpers/api";
import { errorToast, successToast } from "../helpers/toast";
import styles from "./PagesCSS/Login.module.css";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    pseudo: string;
  };
}

function Login() {
  const [login, setLogin] = useState({
    pseudo: "",
    password: "",
  });
  const navigate = useNavigate();

  const { handleLogin } = useAuth();

  // Gestion des changements dans les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Connexion
      const response = await api.post<LoginResponse>("/api/login", login);
      handleLogin(response.data.user);
      successToast(`Bienvenue, ${response.data.user.pseudo} !`);
      navigate("/account");
    } catch (error) {
      errorToast("Mot de passe ou pseudo invalide");
      console.error("Erreur lors de l'opération:", error);
    }
  };
  return (
    <div className={styles.mainContainer}>
      <div className={styles.head}>
        <h1 className={styles.title}>HARMONICACTUS</h1>
        <p className={styles.quote}>Car la désorganisation, ça pique</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
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
            onChange={handleChange}
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
            onChange={handleChange}
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
