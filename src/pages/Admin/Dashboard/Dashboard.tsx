import {
  Layout,
  Card,
  Table,
  Tag,
  message,
} from "antd";
import StatsCards from "./StatsCards/StatsCards";
import { useEffect, useState } from "react";
import { recentEmployees } from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";

const { Content } = Layout;

const EmployeesTable = () => {
  const { state } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res: any = await recentEmployees(state.user?.token);

      const latest7Workers = res.payload.slice(0, 6);
      setData(latest7Workers);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "Position",
      dataIndex: "positionTitle",
      key: "positionTitle",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   render: () => (
    //     <Space>
    //       <Button type="link">Edit</Button>
    //       <Button type="link" danger>
    //         Disable
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <Card title="Recent Employees" bordered={false} style={{ borderRadius: 12 }}>
      <Table columns={columns} dataSource={data} pagination={false} loading={loading} />
    </Card>
  );
};

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
