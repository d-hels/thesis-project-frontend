import {
  Layout,
  Card,
  Row,
  Col,
  Table,
  Typography,
  message,
  Space,
  Alert,
  Button,
  Tag,
} from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  checkInAttendanceManager,
  checkOutAttendanceManager,
  getIfaUserCheckedInManager,
  getWorkers,
} from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";
import type { ColumnsType } from "antd/es/table";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

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

const Dashboard = ({ stats }: any) => {
  const { state } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [data, setData] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attendanceCompleted, setAttendanceCompleted] = useState(false);

  const isUserCheckedIn = async () => {
    const response = await getIfaUserCheckedInManager(
      state.user?.token,
      state.user?.id
    );
    if (response.success && response.payload === "can_check_in") {
      setIsCheckedIn(false);
    } else if (response.success && response.payload === "can_check_out") {
      setIsCheckedIn(true);
    } else if (
      !response.success &&
      response.payload === "already_checked_in_and_out"
    ) {
      setAttendanceCompleted(true);
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
  const cardStats = [
    {
      title: "Total Employees",
      value: stats.totalWorkers,
      color: "#40c9c6",
      icon: <TeamOutlined />,
      change: "+2 this month",
    },
    {
      title: "Attendance Today",
      value: stats.attendancePercentage + "%",
      color: "#36a2eb",
      icon: <ClockCircleOutlined />,
      change: "+3% from yesterday",
    },
    {
      title: "Pending Leaves",
      value: 0,
      color: "#f6a623",
      icon: <CalendarOutlined />,
      change: "Need attention",
    },
    {
      title: "Active Now",
      value: stats.presentWorkers,
      color: "#ff6b6b",
      icon: <CheckCircleOutlined />,
      change: "85% of workforce",
    },
  ];

  const handleCheckIn = async (date: string) => {
    setButtonLoading(true);
    const response = await checkInAttendanceManager(state.user?.token, {
      userId: state.user?.id,
      checkIn: date,
    });

    if (response.success) {
      setTimeout(() => {
        setIsCheckedIn(true);
        message.success("Checked in successfully!");
        setButtonLoading(false);
      }, 1000);
    } else {
      message.error("An error in the system!");
      setButtonLoading(false);
    }
  };

  const handleCheckOut = async (time: string) => {
    const response = await checkOutAttendanceManager(state.user?.token, {
      userId: state.user?.id,
      checkOut: time,
    });

    setButtonLoading(true);
    setTimeout(() => {
      setAttendanceCompleted(true);
      message.success("Checked out successfully!");
      setButtonLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchWorkers();
    isUserCheckedIn();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px", overflow: "initial" }}>
          <Card
            style={{
              marginBottom: 12,
              borderRadius: 12,
              borderColor: "1px solid gray",
              color: "#fff",
            }}
          >
            <Row gutter={[16, 16]} style={{ marginBottom: "0px" }}>
              <Col span={24}>
                <Row align="middle" gutter={24}>
                  <Col flex={1}>
                    <Title level={3} style={{ marginBottom: 4 }}>
                      <span
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {state.user?.name} {state.user?.surname}
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {state.user?.positionsTitle}
                        </Tag>
                      </span>
                    </Title>
                    <Paragraph type="secondary">
                      {state.user?.departmentName} • ID:
                    </Paragraph>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    {attendanceCompleted ? (
                      <Space direction="vertical" size="middle">
                        <Alert
                          message="Attendance completed"
                          style={{ alignItems: "center" }}
                          type="success"
                          showIcon
                        />
                      </Space>
                    ) : isCheckedIn ? (
                      <Space direction="vertical" size="middle">
                        <Alert
                          message="Currently Checked In"
                          style={{ alignItems: "center" }}
                          type="success"
                          showIcon
                        />
                        <Button
                          type="primary"
                          danger
                          icon={<LogoutOutlined />}
                          loading={buttonLoading}
                          onClick={() => {
                            const time = new Date().toLocaleTimeString(
                              "en-GB",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            );
                            handleCheckOut(time);
                          }}
                          size="large"
                        >
                          Check Out
                        </Button>
                      </Space>
                    ) : (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={buttonLoading}
                        onClick={() => {
                          const time = new Date().toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          handleCheckIn(time);
                        }}
                        size="large"
                      >
                        Check In
                      </Button>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {cardStats.map((stat) => (
              <Col xs={24} sm={12} md={6} key={stat.title}>
                <Card
                  style={{
                    borderRadius: 12,
                    background: stat.color,
                    color: "rgba(255,255,255,0.8)",
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
                    <Title
                      level={2}
                      style={{ color: "rgba(255,255,255,0.8)", margin: 0 }}
                    >
                      {stat.value}
                    </Title>
                    <Text
                      style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}
                    >
                      {stat.change}
                    </Text>
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
