import {
    Layout,
    Menu,
  } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useState } from "react";
// import Dashboard from "../Dashboard/Dashboard";
import MyProfile from "../../Profile/Profile";
import HeaderBar from "../Header/Header";
import EmployeeDashboard from "../Employee";

const { Sider, Content } = Layout;

const WorkerDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <EmployeeDashboard/>;
        case "myProfile":
          return <MyProfile />;
      default:
        return null;
    }
  };

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
          selectedKeys={[activeMenu]}
          onClick={({ key }) => setActiveMenu(key)}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "users",
              icon: <TeamOutlined />,
              label: "Employees",
              children: [
                {
                  key: "users-list",
                  label: "All Employees",
                },
                {
                  key: "createUser",
                  label: "Create Employee",
                },
              ],
            },
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
        <HeaderBar title={"Dashboard"} setActiveMenu={setActiveMenu} />
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default WorkerDashboard;
