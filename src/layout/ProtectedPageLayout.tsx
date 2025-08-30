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
  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      navigate("/login");
    }
  }, []);
  const [opened, { toggle }] = useDisclosure(true);
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
    >
      <AppShell.Header className="flex items-center">
        <Flex align="center" gap="md" justify="space-between" w="100%" px="md">
          <div className="flex items-center gap-2">
            <Burger opened={opened} onClick={toggle} size="sm" />
            <div>Ghost Drive</div>
          </div>
          <div>
            <Input placeholder="Type here to search..." w="400px" />
          </div>
          <div className="flex items-center">
            <Switch
              size="md"
              color="dark.4"
              onLabel={
                <IoSunnyOutline
                  size={16}
                  color="var(--mantine-color-yellow-4)"
                />
              }
              offLabel={
                <TbMoonStars size={16} color="var(--mantine-color-blue-6)" />
              }
            />
            <Button variant="transparent">
              <IoSettingsOutline size={20} color="var(--mantine-color-white)" />
            </Button>
            <Button variant="transparent">
              <FaRegQuestionCircle
                size={20}
                color="var(--mantine-color-white)"
              />
            </Button>
            <Avatar color="blue" radius="xl">
              LH
            </Avatar>
          </div>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar>Navbar</AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default ProtectedPageLayout;
