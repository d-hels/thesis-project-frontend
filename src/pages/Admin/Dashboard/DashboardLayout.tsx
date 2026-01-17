import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ApartmentOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import CreateAdminForm from "./Users/Create/CreateAdmin";
import UsersTable from "./Users/Users";
import DepartmentsTable from "../../Department/DepartmentsTable";
import PositionsTable from "../../Positions/PositionTable";
import AdminDashboard from "./Dashboard";
import HeaderBar from "../../Manager/Layout/Header";
import MyProfile from "../../Profile/Profile";

const { Sider, Content } = Layout;

const AppLayout = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <AdminDashboard />;
  
      case "users-list":
        return <UsersTable />;
  
      case "createUser":
        return <CreateAdminForm />;
  
      case "departments":
        return <DepartmentsTable />;
  
      case "positions":
        return <PositionsTable />;

        case "myProfile":
        return <MyProfile />;
  
      default:
        return null;
    }
  };

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
          LOGO
        </div>

        <Menu
          theme="dark"
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
              icon: <UserOutlined />,
              label: "Users",
              children: [
                {
                  key: "users-list",
                  label: "All Users",
                },
                {
                  key: "createUser",
                  label: "Create User",
                },
              ],
            },
            {
              key: "departments",
              icon: <ApartmentOutlined />,
              label: "Departments",
            },
            {
              key: "positions",
              icon: <SolutionOutlined />,
              label: "Positions",
            },
          ]}
        />
      </Sider>

      <Layout>
        <HeaderBar title={"Admin Dashboard"} setActiveMenu={setActiveMenu} />
        <Content
          style={{
            background: "#fff",
            borderRadius: 8,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
