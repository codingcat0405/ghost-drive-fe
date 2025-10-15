import { Outlet } from "react-router";
import "./globals.css";

const ProtectedPageLayout = () => {
  return (
    <Outlet />
  );
};

export default ProtectedPageLayout;
