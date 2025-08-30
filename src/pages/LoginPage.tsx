import { useNavigate } from "react-router";
import ghostDriveApi from "../apis/ghost-drive-api";
import { ACCESS_TOKEN_KEY } from "../constants";
import useUserStore from "../store/user";

const LoginPage = () => {
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const response = await ghostDriveApi.user.login({
        username: "lilhuy0405",
        password: "123456",
      });
      console.log(response);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.jwt);
      setUser(response.user);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <button onClick={handleLogin}>login</button>
    </div>
  );
};

export default LoginPage;
