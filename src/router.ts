import { createBrowserRouter } from "react-router";
import { HomePage, LoginPage, RegisterPage } from "./pages";
import ProtectedPageLayout from "./layout/ProtectedPageLayout";

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
]);

export default router;