import { RouterProvider } from "react-router";
import router from "./router";
import useUserStore from "./store/user";
import ghostDriveApi from "./apis/ghost-drive-api";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "./constants";
import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});
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
    <>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <RouterProvider router={router} />
      </MantineProvider>
    </>
  );
}

export default App;
