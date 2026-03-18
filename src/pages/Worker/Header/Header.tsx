import { Avatar, Badge, Dropdown, Layout, Space, Typography } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../../../auth/actions";
import { useAuth } from "../../../auth/auth";

const { Title } = Typography;
const { Header } = Layout;

const HeaderBar = ({ title, setActiveMenu }: any) => {
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  const logOut = () => {
    dispatch(removeUser());
    localStorage.removeItem("avatarColor");
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      setActiveMenu("myProfile");
    }
    if (key === "logout") {
      // 🔐 clear auth data
      logOut();
      navigate("/login");
    }
  };

  const items: any = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Profile",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f5f5f5",
      }}
    >
      <Title level={3} style={{ margin: 0 }}>
        {title}
      </Title>

      <Space size="large">
        <Badge count={5}>
          <BellOutlined style={{ fontSize: 20 }} />
        </Badge>

        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar
            icon={<UserOutlined />}
            style={{ cursor: "pointer", backgroundColor: "#1677ff" }}
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
