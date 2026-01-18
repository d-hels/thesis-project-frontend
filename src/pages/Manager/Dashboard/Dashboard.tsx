import { Layout, Card, Row, Col, Table, Typography, message } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getWorkers, getWorkersCount } from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";
import type { ColumnsType } from "antd/es/table";

const { Content } = Layout;
const { Title, Text } = Typography;

type Worker = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  departmentId: number;
  departmentName: string;
  createdAt: string;
};

const Dashboard = () => {
  const { state } = useAuth();
  const [numberOfEmployees, setNumberOfEmployees] = useState(0);
  const [data, setData] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  const getWorkersNumber = async () => {
    const response = await getWorkersCount(state.user?.token);
    if (response.success) {
      setNumberOfEmployees(response.payload.employeeCount);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res: any = await getWorkers(state.user?.token);

      const latest7Workers = res.payload.slice(0, 7);
      setData(latest7Workers);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  //   const employeeColumns = [
  //     {
  //       title: "Status",
  //       dataIndex: "status",
  //       key: "status",
  //       render: (status: any) => (
  //         <Badge
  //           status={status === "Active" ? "success" : "warning"}
  //           text={status}
  //         />
  //       ),
  //     },
  //   ];
  const columns: ColumnsType<Worker> = [
    {
      title: "Full Name",
      key: "fullName",
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Department Name",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "Position",
      key: "positionTitle",
      dataIndex: "positionTitle",
    },
  ];
  // Card stats
  const stats = [
    {
      title: "Total Employees",
      value: numberOfEmployees,
      color: "#40c9c6",
      icon: <TeamOutlined />,
    },
    {
      title: "Active Projects",
      value: 15,
      color: "#36a2eb",
      icon: <FileTextOutlined />,
    },
    {
      title: "Pending Requests",
      value: 5,
      color: "#f6a623",
      icon: <BellOutlined />,
    },
    {
      title: "Completed Tasks",
      value: 230,
      color: "#ff6b6b",
      icon: <DashboardOutlined />,
    },
  ];

  useEffect(() => {
    getWorkersNumber();
    fetchWorkers();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "24px", overflow: "initial" }}>
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} md={6} key={stat.title}>
                <Card
                  style={{
                    borderRadius: 12,
                    background: stat.color,
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  bodyStyle={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Text style={{ color: "#fff", fontWeight: 500 }}>
                      {stat.title}
                    </Text>
                    <Title level={2} style={{ color: "#fff", margin: 0 }}>
                      {stat.value}
                    </Title>
                  </div>
                  <div style={{ fontSize: 32, opacity: 0.7 }}>{stat.icon}</div>
                </Card>
              </Col>
            ))}
          </Row>
          <Card
            title="Employees Overview"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              loading={loading}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
