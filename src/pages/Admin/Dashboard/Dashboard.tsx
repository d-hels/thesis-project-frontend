import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  RiseOutlined,
  ReloadOutlined,
  PieChartOutlined,
  RightOutlined,
  BankOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Button,
  Avatar,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Typography,
  Tooltip,
  message,
  Progress,
} from "antd";
import { useAuth } from "../../../auth/auth";
import {
  getDepartmentAttendancePercentage,
  getUsersCount,
  recentEmployees,
} from "../../../api/apiCall";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

interface QuickStat {
  title: string;
  value: number | string;
  change: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const AdminDashboard: React.FC = () => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const navigate = useNavigate();
  const [statistics, setStatistics]: any = useState();

  const getUsersNumber = async () => {
    const response = await getUsersCount(state.user?.token);
    if (response.success) {
      setStatistics(response.payload);
    }
  };

  const fetchDepartmentAttendance = async () => {
    try {
      const response = await getDepartmentAttendancePercentage(
        state.user?.token
      );
      if (response.success) {
        setDepartmentStats(response.payload || []);
      }
    } catch (error) {
      message.error("Failed to load department attendance");
    }
  };

  const fetchUsers = async () => {
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
    fetchUsers();
    getUsersNumber();
    fetchDepartmentAttendance();
  }, []);

  // Quick stats
  const quickStats: QuickStat[] = [
    {
      title: "Total Workers",
      value: statistics?.totalWorkers,
      change: `+${statistics?.newUsersThisWeek}`,
      icon: <TeamOutlined />,
      color: "#1890ff",
      bg: "#e6f7ff",
    },
    {
      title: "Present Today",
      value: statistics?.presentToday,
      change: `+${statistics?.attendanceIncrease}`,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      bg: "#f6ffed",
    },
    {
      title: "On Leave",
      value: statistics?.totalWorkers,
      change: "-2",
      icon: <ClockCircleOutlined />,
      color: "#faad14",
      bg: "#fff7e6",
    },
    {
      title: "Departments",
      value: "86",
      change: "",
      icon: <RiseOutlined />,
      color: "#722ed1",
      bg: "#f9f0ff",
    },
  ];

  const goToProfile = (id: string) => {
    navigate(`/dashboard/users/profile/${id}`);
  };

  const columns: any = [
    {
      title: "User",
      key: "user",
      sorter: (
        a: { firstName: any; lastName: any },
        b: { firstName: any; lastName: any }
      ) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            size="large"
            style={{
              backgroundColor: "#1890ff",
              cursor: "pointer",
            }}
            icon={<UserOutlined />}
            onClick={() => goToProfile(record.id)}
          />
          <div>
            <div style={{ fontWeight: 600 }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: "13px", color: "#000" }}>
              <MailOutlined /> {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: any, record: { phone: any; address: string }) => (
        <div>
          <div style={{ fontSize: "13px", color: "#000" }}>
            <PhoneOutlined /> {record.phone || "N/A"}
          </div>
          {record.address && (
            <div style={{ fontSize: "13px", color: "#000", marginTop: 4 }}>
              {record.address.substring(0, 30)}...
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (text: any) => (
        <Space>
          <BankOutlined style={{ color: "#52c41a" }} />
          <span>{text || "No Department"}</span>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (_: any, { role }: any) => {
        let color = "blue";
        let icon = <UserOutlined />;

        if (role === "admin") {
          color = "red";
          icon = <LockOutlined />;
        } else if (role === "manager") {
          color = "gold";
          icon = <TeamOutlined />;
        } else {
          color = "blue";
          icon = <UserOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} />
          {format(new Date(date), "MMM dd, yyyy")}
        </Space>
      ),
    },
    {
      title: "Profile",
      key: "profile",
      render: (_: any, record: { id: any }) => (
        <Space size="small">
          <Tooltip title=" View Profile">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => goToProfile(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Content
      style={{
        padding: "32px",
        minHeight: "100vh",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              Dashboard Management
            </Title>
            <Space size={16}>
              <Text type="secondary">Last updated: 2 min ago</Text>
            </Space>
          </Space>
        </Col>
        <Col>
          <Space size={12}>
            <Button icon={<ReloadOutlined />}>Refresh</Button>
            <Button
              type="primary"
              onClick={() => navigate("/dashboard/users/create")}
              icon={<PlusOutlined />}
              style={{
                border: "none",
              }}
            >
              Add Worker
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{
                transition: "all 0.3s",
                padding: 5,
                cursor: "pointer",
              }}
              hoverable
              bodyStyle={{ padding: "20px" }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text
                    type="secondary"
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    {stat.title}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        lineHeight: 1,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </Text>
                    <Tag
                      color={stat.change.startsWith("+") ? "success" : "error"}
                      style={{
                        marginLeft: 12,
                        borderRadius: 20,
                        border: "none",
                        background: stat.change.startsWith("+")
                          ? "#f6ffed"
                          : "#fff2f0",
                      }}
                    >
                      {stat.change}
                    </Tag>
                  </div>
                </Col>
                <Col>
                  <Avatar
                    size={48}
                    icon={stat.icon}
                    style={{
                      background: stat.bg,
                      color: stat.color,
                      fontSize: 24,
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Department Overview Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <PieChartOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: 600 }}>Department Overview</span>
              </Space>
            }
            style={{
              borderRadius: 10,
              border: "none",
            }}
            extra={
              <Button type="link" style={{ padding: 0 }}>
                View All <RightOutlined />
              </Button>
            }
          >
            <Row gutter={[24, 16]}>
              {departmentStats.map((dept, index) => {
                return (
                  <Col xs={24} md={8} key={dept.id || index}>
                    <div
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        border: "1px solid #f0f0f0",
                        transition: "all 0.3s",
                      }}
                    >
                      <Row
                        justify="space-between"
                        align="middle"
                        style={{ marginBottom: 16 }}
                      >
                        <Col>
                          <Space direction="vertical" size={2}>
                            <Text strong style={{ fontSize: 16 }}>
                              {dept.departmentName || dept.name}
                            </Text>
                            <Text type="secondary">
                              <TeamOutlined /> {dept.totalEmployees} workers
                            </Text>
                          </Space>
                        </Col>
                        <Col>
                          <Progress
                            type="circle"
                            percent={Number(dept.attendancePercentage) || 0}
                            width={60}
                            format={(percent: any) => (
                              <div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    lineHeight: 1,
                                  }}
                                >
                                  {dept.presentToday || 0}
                                </div>
                                <div style={{ fontSize: 10, color: "#8c8c8c" }}>
                                  /{dept.totalEmployees || 0}
                                </div>
                              </div>
                            )}
                            strokeColor={
                              (dept.attendancePercentage || 0) >= 90
                                ? "#52c41a"
                                : (dept.attendancePercentage || 0) >= 75
                                ? "#1890ff"
                                : (dept.attendancePercentage || 0) >= 50
                                ? "#faad14"
                                : "#ff4d4f"
                            }
                          />
                        </Col>
                      </Row>

                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text type="secondary">
                            <CheckCircleOutlined
                              style={{ color: "#52c41a", marginRight: 4 }}
                            />
                            Attendance
                          </Text>
                          <Text
                            strong
                            style={{
                              color:
                                (dept.attendancePercentage || 0) >= 90
                                  ? "#52c41a"
                                  : (dept.attendancePercentage || 0) >= 75
                                  ? "#1890ff"
                                  : (dept.attendancePercentage || 0) >= 50
                                  ? "#faad14"
                                  : "#ff4d4f",
                            }}
                          >
                            {dept.attendancePercentage || 0}%
                          </Text>
                        </div>
                        <Progress
                          percent={Number(dept.attendancePercentage) || 0}
                          size="small"
                          showInfo={false}
                          strokeColor={
                            (dept.attendancePercentage || 0) >= 90
                              ? "#52c41a"
                              : (dept.attendancePercentage || 0) >= 75
                              ? "#1890ff"
                              : (dept.attendancePercentage || 0) >= 50
                              ? "#faad14"
                              : "#ff4d4f"
                          }
                          trailColor="#e8e8e8"
                        />
                      </div>

                      {dept.late_count > 0 && (
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                          <Tag
                            color="warning"
                            icon={<ClockCircleOutlined />}
                            style={{ borderRadius: 12 }}
                          >
                            {dept.lateCount} late today
                          </Tag>
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Workers Table with Enhanced Design */}
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: "#1890ff" }} />
            <span style={{ fontWeight: 600 }}>Users List</span>
          </Space>
        }
        style={{ border: "none" }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${total} users total`,
          }}
          rowClassName={(record: any) =>
            !record.isActive ? "inactive-row" : ""
          }
        />
      </Card>
    </Content>
  );
};

export default AdminDashboard;
