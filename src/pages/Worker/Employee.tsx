import { useState, useEffect } from "react";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Progress,
  List,
  Avatar,
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
  theme,
} from "antd";
import moment from "moment";
import {
  checkInAttendanceWorker,
  checkOutAttendanceWorker,
  getAttendanceWorkersByUser,
  getContractByUser,
  getIfaUserCheckedInWorker,
  getManagerByDepartment,
  getWorkingDays,
} from "../../api/apiCall";
import { useAuth } from "../../auth/auth";
import { format } from "date-fns";

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
  const [contractStatus, setContractStatus] = useState<any>();
  const [managerName, setManagerName] = useState<any>();
  const [attendanceData, setAttendanceData] = useState<any>();
  const [workingDays, setWorkingDays] = useState<any>();
  const [form] = Form.useForm();

  const getContractByUserId = async () => {
    const response = await getContractByUser(state.user?.token, state.user?.id);
    setContractStatus(response.payload);
  };

  const getManagerName = async () => {
    const response = await getManagerByDepartment(
      state.user?.token,
      state.user?.departmentName
    );
    setManagerName(response.payload);
  };

  useEffect(() => {
    getContractByUserId();
    getManagerName();
  }, []);

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

  const getAttendanceData = async () => {
    const response = await getAttendanceWorkersByUser(
      state.user?.token,
      state.user?.id
    );
    setAttendanceData(response.payload);
  };

  const fetchWorkingDays = async () => {
    const response = await getWorkingDays(state.user?.token);
    console.log(response, "res");
    setWorkingDays(response.payload.workingDays);
  };

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
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
      sorter: (a: any, b: any) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (time: string | null) =>
        time ? (
          <Tag color="blue" icon={<CheckCircleOutlined />}>
            {moment(time, "HH:mm").format("hh:mm A")}
          </Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Not checked in
          </Tag>
        ),
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (time: string | null, record: any) =>
        time ? (
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            {moment(time, "HH:mm").format("hh:mm A")}
          </Tag>
        ) : record.checkIn === null ? (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Not checked in
          </Tag>
        ) : (
          <Tag color="orange">Still Active</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "";
        let icon = null;

        switch (status) {
          case "present":
            color = "success";
            icon = <CheckCircleOutlined />;
            break;
          case "active":
            color = "processing";
            icon = <ClockCircleOutlined />;
            break;
          case "late":
            color = "warning";
            icon = <ClockCircleOutlined />;
            break;
          case "absent":
            color = "error";
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = "default";
        }

        return (
          <Tag color={color} icon={icon}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
      filters: [
        { text: "Present", value: "present" },
        { text: "Active", value: "active" },
        { text: "Late", value: "late" },
        { text: "Absent", value: "absent" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Duration",
      key: "duration",
      render: (record: any) => {
        console.log(record, "res");
        if (record.checkIn && record.checkOut) {
          const checkIn = moment(record.checkIn, "HH:mm");
          const checkOut = moment(record.checkOut, "HH:mm");
          const duration = moment.duration(checkOut.diff(checkIn));
          const hours = Math.floor(duration.asHours());
          const minutes = duration.minutes();
          return `${hours}h ${minutes}m`;
        }
        return "-";
      },
    },
  ];

  useEffect(() => {
    isUserCheckedIn();
    fetchWorkingDays();
    getAttendanceData();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ padding: 24, background: "#ffffff" }}>
          {/* Redesigned Quick Actions Card */}
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col span={24}>
              <Card>
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
                      {state.user?.departmentName}
                    </Paragraph>
                    <Space size="large">
                      <Text>
                        <CalendarOutlined /> Today:{" "}
                        {moment().format("dddd, MMMM D")}
                      </Text>
                    </Space>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    {attendanceCompleted ? (
                      <Space direction="vertical" size="middle">
                        <Alert
                          message="Attendance completed for today"
                          style={{
                            alignItems: "center",
                          }}
                          type="success"
                          showIcon
                        />
                      </Space>
                    ) : isCheckedIn ? (
                      <Space direction="vertical" size="middle">
                        <Alert
                          message="Currently Checked In"
                          style={{
                            alignItems: "center",
                          }}
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
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Statistic
                    title="Attendance"
                    value={attendanceData?.length || 0}
                    suffix={`/ ${workingDays || 0} days`}
                    valueStyle={{ fontSize: 24, fontWeight: 600 }}
                  />
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background:
                        "linear-gradient(135deg, #1890ff20 0%, #1890ff40 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />
                  </div>
                </div>

                <Progress
                  percent={Math.round(
                    (attendanceData?.length / workingDays) * 100
                  )}
                  size="small"
                  strokeColor="#1890ff"
                  trailColor="#e6f7ff"
                  style={{ marginTop: 12 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <Statistic
                      title="Contract Status"
                      value={contractStatus?.status?.toUpperCase() || "N/A"}
                      valueStyle={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: "#52c41a",
                      }}
                    />
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, display: "block", marginTop: 8 }}
                    >
                      Ends:{" "}
                      {contractStatus?.endDate
                        ? format(
                            new Date(contractStatus.endDate),
                            "MMM dd, yyyy"
                          )
                        : "-"}
                    </Text>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      marginBottom: 25,
                      borderRadius: 16,
                      background:
                        "linear-gradient(135deg, #52c41a20 0%, #52c41a40 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: 24, color: "#52c41a" }}
                    />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Statistic
                    title="Attendance Rate"
                    value={
                      Math.round(
                        (attendanceData?.length / workingDays) * 100
                      ) || 0
                    }
                    suffix="%"
                    valueStyle={{ fontSize: 24, fontWeight: 600 }}
                  />
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background:
                        "linear-gradient(135deg, #faad1420 0%, #faad1440 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RiseOutlined style={{ fontSize: 24, color: "#faad14" }} />
                  </div>
                </div>
                <Progress
                  percent={
                    Math.round((attendanceData?.length / workingDays) * 100) ||
                    0
                  }
                  size="small"
                  status="active"
                  strokeColor="#faad14"
                  trailColor="#fff7e6"
                  style={{ marginTop: 12 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <Statistic
                      title="Manager"
                      value={
                        managerName?.firstName + " " + managerName?.lastName ||
                        "N/A"
                      }
                      valueStyle={{ fontSize: 20, fontWeight: 600 }}
                    />
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, display: "block", marginTop: 8 }}
                    >
                      {managerName?.title || "Department Manager"}
                    </Text>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background:
                        "linear-gradient(135deg, #eb2f9620 0%, #eb2f9640 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TeamOutlined style={{ fontSize: 24, color: "#eb2f96" }} />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Redesigned Main Content */}
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card
                style={{
                  border: "none",
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Tabs
                  defaultActiveKey="attendance"
                  style={{ padding: "0 24px" }}
                  tabBarStyle={{
                    marginBottom: 0,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <TabPane
                    tab={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        <ClockCircleOutlined /> Attendance History
                      </span>
                    }
                    key="attendance"
                  >
                    <Table
                      columns={columns}
                      dataSource={attendanceData}
                      pagination={{ pageSize: 5 }}
                      style={{ padding: "0 24px 24px", marginTop: 20 }}
                      rowKey={(record) => record.id}
                      className="custom-table"
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
      <Modal
        title="Apply for Leave"
        open={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        footer={null}
        style={{ borderRadius: 20 }}
        bodyStyle={{ padding: "24px" }}
      >
        <Form form={form} layout="vertical" onFinish={handleLeaveSubmit}>
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: "Please select leave type" }]}
          >
            <Select placeholder="Select leave type" size="large">
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
            <DatePicker.RangePicker style={{ width: "100%" }} size="large" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please enter reason" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter reason for leave"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setShowLeaveModal(false)} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
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
