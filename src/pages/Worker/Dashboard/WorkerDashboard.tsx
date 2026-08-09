import {
    Layout,
    Menu,
  } from "antd";
import {
  DashboardOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useState } from "react";
// import Dashboard from "../Dashboard/Dashboard";
import MyProfile from "../../Profile/Profile";
import HeaderBar from "../Header/Header";
import EmployeeDashboard from "../Employee";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Sider, Content } = Layout;

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const selectedKey = location.pathname.replace("/worker/", "");

  const toggleCollapsed = () => setCollapsed(!collapsed);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed} theme="light"
        style={{
          borderRight: 1,
          boxShadow: "2px 0 8px rgba(0,0,0,0.07)",
        }}>
        <div style={{ height: 32, margin: 16, color: "#000", fontWeight: "bold", textAlign: "center", fontSize: 20 }}>
          {collapsed ? "WS" : "Employvia"}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(`/worker/${key}`)}
          items={[
            {
              key: "home",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "profile",
              icon: <ProfileOutlined />,
              label: "Profile",
            }
          ]}
        />
      </Sider>

      <Layout>
        <Content
          style={{
            background: "#fff",
            borderRadius: 8,
          }}
        >
        <HeaderBar title={"Dashboard"} />
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
  );
};

export default WorkerDashboard;
