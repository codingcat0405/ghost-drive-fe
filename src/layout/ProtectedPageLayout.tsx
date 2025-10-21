import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "@/constants";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Footer from "@/components/Footer";

const ProtectedPageLayout = () => {
  const navigate = useNavigate();
  const pathname = useLocation();

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) {
      navigate("/login");
    }
  }, [pathname.pathname]);
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <Outlet />
      <Footer />
    </div>
  );
};

export default ProtectedPageLayout;
