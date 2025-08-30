import { useNavigate } from "react-router";
import { ACCESS_TOKEN_KEY } from "../constants";
import useUserStore from "../store/user";

const HomePage = () => {
  const navigate = useNavigate();
  const { setUser, user } = useUserStore();
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser({
      id: 0,
      username: "",
      avatar: "",
      role: "",
      bucketName: "",
      aesKeyEncrypted: "",
    });
    navigate("/login");
  };
  return (
    <div>
      HomePage {user.username} <button onClick={handleLogout}>logout</button>
    </div>
  );
};

export default HomePage;
