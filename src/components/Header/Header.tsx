import { Layout, Menu, Button, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Header.css";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  return (
    <Header className="app-header">
      <div className="header-left">
        <Title level={3} style={{ margin: 0 }}>
          Employvia
        </Title>
      </div>

      <Menu
        mode="horizontal"
        className="header-center"
        selectable={false}
        items={[
          { key: "create-department", label: "About Us" },
          { key: "products", label: "Products" },
          { key: "dashboard", label: "Dashboard" },
        ]}
      />

      <div className="header-right">
        <Button type="primary" icon={<UserOutlined />}>
          Log In
        </Button>
      </div>
    </Header>
  );
};

export default AppHeader;
