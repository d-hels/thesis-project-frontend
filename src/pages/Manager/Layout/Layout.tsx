import { Layout, Menu } from "antd";
import { CalendarOutlined, DashboardOutlined, TeamOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Dashboard from "../Dashboard/Dashboard";
import HeaderBar from "./Header";
import CreateWorkersForm from "../Dashboard/CreateWorker";
import EmployeesTable from "../Dashboard/Workers/Workers";
import MyProfile from "../../Profile/Profile";
import AttendanceDashboard from "../Dashboard/Attendance/Attendace";
import { getStatsByDepartmentId } from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";

const { Sider, Content } = Layout;

const AppLayout = () => {
  const {state} = useAuth();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState(false);

  const getStats = async () => {
    const response = await getStatsByDepartmentId(state.user?.token, state.user?.departmentId);
    if(response.success) { 
      setStats(response.payload)
    }
  }

  useEffect(() => {
    getStats();
  }, [])

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "users-list":
        return <EmployeesTable />;
      case "createUser":
        return <CreateWorkersForm />;
      case "myProfile":
        return <MyProfile />;
        case "attendance":
        return <AttendanceDashboard />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        theme="light"
        style={{
          borderRight: 1,
          boxShadow: "2px 0 8px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 20,
          }}
        >
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
            {
            key: "attendance",
            icon: <CalendarOutlined />,
            label: "Attendance",
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

export default AppLayout;
