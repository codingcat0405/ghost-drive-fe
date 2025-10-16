import { RouterProvider } from "react-router";
import router from "./router";
import useUserStore from "./store/user";
import ghostDriveApi from "./apis/ghost-drive-api";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "./constants";
import { Toaster } from "./components/ui/sonner";

function App() {
  const { setUser } = useUserStore();
  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      console.log("access token", accessToken);

      if (!accessToken) {
        return;
      }
      const user = await ghostDriveApi.user.getUserInfo();
      console.log(user);
      setUser(user);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchUserInfo();
  }, []);
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" theme="dark" />
    </>
  );
}

export default App;
