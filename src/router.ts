import { createBrowserRouter } from "react-router";
import { HomePage, LoginPage, RegisterPage } from "./pages";
import ProtectedPageLayout from "./layout/ProtectedPageLayout";
import SettingsPage from "./pages/SettingsPage";
import TestUpload from "./pages/TestUpload";

const router = createBrowserRouter([
  {
    Component: ProtectedPageLayout,
    children: [
      {
        path: "/",
        index: true,
        Component: HomePage,
      },
      {
        path: "/settings",
        Component: SettingsPage,
      },
      {
        path: "/test-upload",
        Component: TestUpload,
      }
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