import {
  Layout,
  Card,
  Table,
  Tag,
  Button,
  Space,
} from "antd";
import StatsCards from "./StatsCards/StatsCards";

const { Content } = Layout;

const employees = [
  {
    key: "1",
    name: "John Doe",
    department: "Engineering",
    position: "Frontend Developer",
    status: "Active",
  },
  {
    key: "2",
    name: "Anna Smith",
    department: "HR",
    position: "HR Manager",
    status: "Inactive",
  },
  {
    key: "3",
    name: "Mark Wilson",
    department: "Finance",
    position: "Accountant",
    status: "Active",
  },
];

const EmployeesTable = () => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>
            Disable
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Recent Employees" bordered={false} style={{ borderRadius: 12 }}>
      <Table columns={columns} dataSource={employees} pagination={false} />
    </Card>
  );
};

// ------------------ Main Dashboard ------------------
const AdminDashboard = () => {

  return (
    <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ margin: "24px" }}>
          <StatsCards />
          <EmployeesTable />
        </Content>
    </Layout>
  );
};

export default AdminDashboard;
