import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ProtectedPageLayout = () => {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar/>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header/>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ProtectedPageLayout;
