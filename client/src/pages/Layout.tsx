import { Outlet } from "react-router-dom";
import styles from "./PagesCSS/Layout.module.css";

function Layout() {
  return (
    <main className={styles.pages}>
      <Outlet />
    </main>
  );
}

export default Layout;
