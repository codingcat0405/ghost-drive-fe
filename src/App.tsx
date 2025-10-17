import { RouterProvider } from "react-router";
import router from "./router";
import useUserStore from "./store/user";
import ghostDriveApi from "./apis/ghost-drive-api";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "./constants";
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  const { setUser } = useUserStore();
  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        return;
      }
      const user = await ghostDriveApi.user.getUserInfo();
      setUser(user);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchUserInfo();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
