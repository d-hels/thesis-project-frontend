import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import HeaderBar from "../../Manager/Layout/Header";

const { Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.replace("/manager/", "");

  return (
    <Layout style={{ minHeight: "100vh" }}>
       <Sider
        collapsible
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
          Employvia
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(`/manager/${key}`)}
          items={[
            {
              key: "home",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "users",
              icon: <TeamOutlined />,
              label: "Employees",
              children: [
                {
                  key: "employees",
                  label: "All Employees",
                },
                // {
                //   key: "employees/create",
                //   label: "Create Employee",
                // },
              ],
            },
            {
              key: "attendance",
              icon: <CalendarOutlined />,
              label: "Attendance",
            },
            {
              key: "contracts",
              icon: <FileTextOutlined />,
              label: "Contracts",
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
        <HeaderBar title={"Dashboard"}/>
          {/* 🔥 ROUTED CONTENT */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
