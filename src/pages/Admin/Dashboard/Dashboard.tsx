import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
} from "antd";

const { Content } = Layout;

// ------------------ Mock Data ------------------
const stats = [
  { title: "Total Employees", value: 128 },
  { title: "Active Employees", value: 112 },
  { title: "Departments", value: 8 },
  { title: "Open Positions", value: 5 },
];

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

// ------------------ Components ------------------
const StatsCards = () => (
  <Row gutter={16} style={{ marginBottom: 24 }}>
    {stats.map((item) => (
      <Col xs={24} sm={12} md={6} key={item.title}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Statistic title={item.title} value={item.value} />
        </Card>
      </Col>
    ))}
  </Row>
);

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
