import { useState, useEffect } from "react";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined,
  TeamOutlined,
  BellOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Progress,
  Timeline,
  List,
  Avatar,
  Badge,
  Space,
  Tag,
  Typography,
  DatePicker,
  Modal,
  Form,
  Input,
  Select,
  message,
  Table,
  Tabs,
  Alert,
} from "antd";
import moment from "moment";
import {
  checkInAttendanceWorker,
  checkOutAttendanceWorker,
  getIfaUserCheckedInWorker,
} from "../../api/apiCall";
import { useAuth } from "../../auth/auth";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const EmployeeDashboard = () => {
  const { state } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [_1, setCheckInTime] = useState<any>(null);
  const [_, setCurrentTime] = useState<any>(moment().format("HH:mm:ss"));
  const [leaves, setLeaves] = useState<any>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attendanceCompleted, setAttendanceCompleted] = useState(false);
  const [form] = Form.useForm();

  const employeeData = {
    name: "John Doe",
    role: "Senior Developer",
    department: "Engineering",
    employeeId: "EMP-2024-001",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    totalLeaves: 20,
    usedLeaves: 8,
    remainingLeaves: 12,
    attendanceThisMonth: 18,
    workingDaysThisMonth: 22,
    performance: 92,
  };

  const isUserCheckedIn = async () => {
    const response = await getIfaUserCheckedInWorker(
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

  // Sample attendance data
  const attendanceData = [
    {
      date: "2024-01-15",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      status: "Present",
    },
    {
      date: "2024-01-14",
      checkIn: "09:15 AM",
      checkOut: "06:30 PM",
      status: "Present",
    },
    {
      date: "2024-01-13",
      checkIn: "09:05 AM",
      checkOut: "05:45 PM",
      status: "Half Day",
    },
    { date: "2024-01-12", checkIn: "-", checkOut: "-", status: "Leave" },
    {
      date: "2024-01-11",
      checkIn: "09:10 AM",
      checkOut: "06:15 PM",
      status: "Present",
    },
  ];

  // Sample leaves data
  const leaveTypes = [
    { type: "Casual Leave", used: 4, total: 10 },
    { type: "Sick Leave", used: 2, total: 7 },
    { type: "Earned Leave", used: 2, total: 15 },
    { type: "Maternity Leave", used: 0, total: 180 },
  ];

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "Leave Approved",
      description: "Your leave for Jan 20 has been approved",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "New Announcement",
      description: "Team meeting scheduled for tomorrow",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "Payroll Processed",
      description: "Salary for December has been processed",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      title: "Performance Review",
      description: "Q4 performance review scheduled",
      time: "2 days ago",
      read: true,
    },
  ];

  // Sample upcoming holidays
  const upcomingHolidays = [
    { date: "Jan 26, 2024", occasion: "Republic Day" },
    { date: "Mar 25, 2024", occasion: "Holi" },
    { date: "Apr 11, 2024", occasion: "Eid al-Fitr" },
    { date: "Aug 15, 2024", occasion: "Independence Day" },
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async (time: string) => {
    setButtonLoading(true);
    const response = await checkInAttendanceWorker(state.user?.token, {
      userId: state.user?.id,
      checkIn: time,
    });

    if (response.success) {
      setTimeout(() => {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
        message.success("Checked in successfully!");
        setButtonLoading(false);
      }, 1000);
    } else {
      message.error("An error in the system!");
      setButtonLoading(false);
    }
  };

  const handleCheckOut = async (time: string) => {
    setButtonLoading(true);
    const response = await checkOutAttendanceWorker(state.user?.token, {
      userId: state.user?.id,
      checkOut: time,
    });

    setTimeout(() => {
      setAttendanceCompleted(true);
      setCheckInTime(null);
      message.success("Checked out successfully!");
      setButtonLoading(false);
    }, 1000);
  };

  const handleLeaveSubmit = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLeaves([
        ...leaves,
        { ...values, id: leaves.length + 1, status: "Pending" },
      ]);
      form.resetFields();
      setShowLeaveModal(false);
      message.success("Leave application submitted successfully!");
      setLoading(false);
    }, 1000);
  };

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Check In", dataIndex: "checkIn", key: "checkIn" },
    { title: "Check Out", dataIndex: "checkOut", key: "checkOut" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: any) => (
        <Tag
          color={
            status === "Present"
              ? "green"
              : status === "Half Day"
              ? "orange"
              : status === "Leave"
              ? "red"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  useEffect(() => {
    isUserCheckedIn();
  }, [])

  const currentWorker = {
    id: 101,
    uuid: "user-001",
    name: "John Doe",
    role: "Software Developer",
    department: "Engineering",
    avatarColor: "#1890ff",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ padding: 18, background: "#ffffff" }}>
          {/* Quick Actions Card */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col span={24}>
              <Card>
                <Row align="middle" gutter={24}>
                  {/* <Col>
                    <Avatar
                      size={64}
                      style={{ backgroundColor: currentWorker.avatarColor }}
                      icon={<UserOutlined />}
                    />
                  </Col> */}
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
                      {state.user?.departmentName} • ID: {currentWorker.id}
                    </Paragraph>
                    {/* <Space size="large">
                      <Text>
                        <CalendarOutlined /> Today:{" "}
                        {moment().format("dddd, MMMM D")}
                      </Text>
                    </Space> */}
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
                  {/* <Badge 
                    status="processing" 
                    text={
                      <Tag 
                        icon={status.icon} 
                        color={status.color}
                        style={{ fontSize: '16px', padding: '8px 16px' }}
                      >
                        {status.text}
                      </Tag>
                    } 
                  /> */}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Stats Row */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Attendance This Month"
                  value={employeeData.attendanceThisMonth}
                  suffix={`/ ${employeeData.workingDaysThisMonth}`}
                  prefix={<ClockCircleOutlined />}
                />
                <Progress
                  percent={
                    (employeeData.attendanceThisMonth /
                      employeeData.workingDaysThisMonth) *
                    100
                  }
                  size="small"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Leaves Remaining"
                  value={employeeData.remainingLeaves}
                  suffix={`/ ${employeeData.totalLeaves}`}
                  prefix={<CalendarOutlined />}
                />
                <Progress
                  percent={
                    (employeeData.remainingLeaves / employeeData.totalLeaves) *
                    100
                  }
                  size="small"
                  status="active"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Performance"
                  value={employeeData.performance}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                />
                <Progress
                  percent={employeeData.performance}
                  size="small"
                  status="success"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Employee ID"
                  value={employeeData.employeeId}
                  prefix={<UserOutlined />}
                />
                <Text type="secondary">{employeeData.department}</Text>
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row gutter={16}>
            <Col span={16}>
              <Tabs defaultActiveKey="attendance">
                <TabPane tab="Attendance History" key="attendance">
                  <Table
                    columns={columns}
                    dataSource={attendanceData}
                    pagination={{ pageSize: 5 }}
                  />
                </TabPane>
                <TabPane tab="Leaves Balance" key="leaves">
                  <List
                    dataSource={leaveTypes}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.type}
                          description={`${item.used} of ${item.total} days used`}
                        />
                        <Progress
                          percent={(item.used / item.total) * 100}
                          style={{ width: 200 }}
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
                <TabPane tab="Time Tracking" key="time">
                  <Card>
                    <Timeline>
                      <Timeline.Item color="green">
                        Checked In - 09:00 AM
                      </Timeline.Item>
                      <Timeline.Item>
                        Lunch Break - 01:00 PM to 02:00 PM
                      </Timeline.Item>
                      <Timeline.Item>
                        Meeting - 03:00 PM to 04:00 PM
                      </Timeline.Item>
                      <Timeline.Item color="red">
                        Checked Out - 06:00 PM
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </TabPane>
              </Tabs>
            </Col>

            <Col span={8}>
              {/* Notifications */}
              <Card
                title={
                  <Space>
                    <BellOutlined />
                    Notifications
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Badge dot={!item.read}>
                            <Avatar icon={<BellOutlined />} />
                          </Badge>
                        }
                        title={item.title}
                        description={
                          <>
                            <Text>{item.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {item.time}
                            </Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* Upcoming Holidays */}
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    Upcoming Holidays
                  </Space>
                }
              >
                <List
                  dataSource={upcomingHolidays}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ background: "#1890ff" }}>
                            {item.date.split(" ")[0]}
                          </Avatar>
                        }
                        title={item.occasion}
                        description={item.date}
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* Quick Links */}
              <Card title="Quick Links" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button block icon={<FileTextOutlined />}>
                    Download Payslip
                  </Button>
                  <Button block icon={<CalendarOutlined />}>
                    View Holiday Calendar
                  </Button>
                  <Button block icon={<TeamOutlined />}>
                    Team Directory
                  </Button>
                  <Button block icon={<SettingOutlined />}>
                    Account Settings
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
      {/* Check In Modal */}
      {/* Leave Application Modal */}
      <Modal
        title="Apply for Leave"
        open={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleLeaveSubmit}>
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: "Please select leave type" }]}
          >
            <Select placeholder="Select leave type">
              <Option value="casual">Casual Leave</Option>
              <Option value="sick">Sick Leave</Option>
              <Option value="earned">Earned Leave</Option>
              <Option value="maternity">Maternity Leave</Option>
              <Option value="paternity">Paternity Leave</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please enter reason" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter reason for leave" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setShowLeaveModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit Application
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default EmployeeDashboard;
