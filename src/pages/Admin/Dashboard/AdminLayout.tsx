import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  BankOutlined,
  FileTextOutlined,
  SafetyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import HeaderBar from "../../Manager/Layout/Header";

const { Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.replace("/dashboard/", "");

  const menuItems: any = [
    { key: 'home', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'users', icon: <UserOutlined />, label: 'Users' },
    { key: 'users/create', icon: <TeamOutlined />, label: 'Create User' },
    { key: 'managers', icon: <UserSwitchOutlined />, label: 'Managers' },
    { key: 'departments', icon: <BankOutlined />, label: 'Departments' },
    { key: 'positions', icon: <SafetyOutlined />, label: 'Positions' },
    { key: 'contracts', icon: <FileTextOutlined />, label: 'Contracts' },
    { type: 'divider' },
    { key: 'settings', icon: <LogoutOutlined />, label: 'Logout' }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div
          style={{
            height: 32,
            margin: 16,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Employvia
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(`/dashboard/${key}`)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <HeaderBar title="Admin Dashboard" />
        <Content
          style={{
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
