import { Link, Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "../constants";
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Flex,
  Input,
  Switch,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IoSettingsOutline, IoSunnyOutline } from "react-icons/io5";
import { TbMoonStars } from "react-icons/tb";
import { CiSettings } from "react-icons/ci";
import { FaRegQuestionCircle } from "react-icons/fa";

const ProtectedPageLayout = () => {
  const navigate = useNavigate();
  // useEffect(() => {
  //   if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
  //     navigate("/login");
  //   }
  // }, []);
  const [opened, { toggle }] = useDisclosure(true);
  return (
   <Outlet />
  );
};

export default ProtectedPageLayout;
