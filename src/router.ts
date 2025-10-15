import { createBrowserRouter } from "react-router";
import { HomePage, LoginPage, RegisterPage } from "./pages";
import ProtectedPageLayout from "./layout/ProtectedPageLayout";
import SettingsPage from "./pages/SettingsPage";

const router = createBrowserRouter([
  {
    Component: ProtectedPageLayout,
    children: [
      {
        path: "/",
        index: true,
        Component: HomePage,
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
  {
    path: "/settings",
    Component: SettingsPage,
  },
]);

export default router;