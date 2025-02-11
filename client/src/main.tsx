// Import necessary modules from React and React Router
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

/* ************************************************************************* */

/**
 * Contexts
 */
import { AuthProvider } from "./contexts/AuthContext";

import App from "./App";
import Account from "./pages/Account";
// Import the main app component
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Page404 from "./pages/Page404";
import SignIn from "./pages/Signin";

/* ************************************************************************* */

// Create router configuration with routes
const router = createBrowserRouter([
  {
    element: <Layout />, // Renders the App component for the home page
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/signin",
        element: <SignIn />,
      },
      {
        path: "/account",
        element: <Account />,
      },
      {
        path: "/project/:id",
        element: <App />,
      },
      {
        path: "*",
        element: <Page404 />,
      },
    ],
  },
]);

/* ************************************************************************* */

// Find the root element in the HTML document
const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

// Render the app inside the root element
createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  </StrictMode>,
);
