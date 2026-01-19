import { createBrowserRouter } from "react-router";
import { HomePage, LoginPage, RegisterPage } from "./pages";
import ProtectedPageLayout from "./layout/ProtectedPageLayout";
import SettingsPage from "./pages/SettingsPage";
import VaultPage from "./pages/VaultPage";

const router = createBrowserRouter([
  {
    Component: ProtectedPageLayout,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        path: "/settings",
        Component: SettingsPage,
      },
      {
        path: "/vault",
        Component: VaultPage,
      },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
]);

export default router;