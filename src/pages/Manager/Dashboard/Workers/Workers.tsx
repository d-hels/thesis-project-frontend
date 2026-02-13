import { useEffect, useState, useMemo } from "react";
import {
  Table,
  message,
  Button,
  Card,
  Space,
  Input,
  Tag,
  Avatar,
  Tooltip,
  Select,
  Row,
  Col,
  Statistic,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { useAuth } from "../../../../auth/auth";
import {
  getDepartments,
  getWorkersByDepartment,
  updateWorker,
} from "../../../../api/apiCall";
import EditWorkerModal from "./Edit/Edit";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  departmentId: number;
  positionId: number;
  departmentName: string;
  positionTitle: string;
  createdAt: string;
  status: "active" | "on-leave" | "offline";
  performanceScore?: number;
  currentTasks?: number;
  completedTasks?: number;
  lastActive?: string;
};

type ManagerStats = {
  teamSize: number;
  activeEmployees: number;
  onLeave: number;
  avgPerformance: number;
  pendingTasks: number;
};

const ManagerEmployeesTable = () => {
  const { state } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, _] = useState<string>("all");
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("team");
  const navigate = useNavigate();

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res: any = await getWorkersByDepartment(state.user?.token, state.user?.departmentId);
      setEmployees(res.payload);
      setFilteredEmployees(res.payload);
    } catch {
      message.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments(state.user?.token);
      if (response.success) {
        setDepartments(response.payload);
      }
    } catch {
      message.error("Failed to load departments");
    }
  };

  useEffect(() => {
    fetchTeamData();
    fetchDepartments();
  }, []);

  const openEditModal = (user: Employee) => {
    console.log(user)
    setSelectedEmployee(user);
    setEditModalOpen(true);
  };

  useEffect(() => {
    let result = employees;

    if (searchText) {
      result = result.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
          emp.positionTitle.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((emp) => emp.status === statusFilter);
    }

    if (departmentFilter !== "all") {
      result = result.filter((emp) => emp.departmentName === departmentFilter);
    }

    setFilteredEmployees(result);
  }, [searchText, statusFilter, departmentFilter, employees]);

  const handleUpdateEmployee = async (values: any) => {
    try {
      if (!selectedEmployee) return;

      await updateWorker(state.user?.token, {
        id: selectedEmployee.id,
        ...values,
      });

      message.success("Employee updated successfully");
      setEditModalOpen(false);
      setSelectedEmployee(null);
      fetchTeamData();
    } catch {
      message.error("Failed to update employee");
    }
  };

  const managerStats: ManagerStats = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === "active").length;
    const onLeave = employees.filter(emp => emp.status === "on-leave").length;
    const avgPerformance = employees.length > 0
      ? employees.reduce((sum, emp) => sum + (emp.performanceScore || 0), 0) / employees.length
      : 0;
    const pendingTasks = employees.reduce((sum, emp) => sum + (emp.currentTasks || 0), 0);

    return {
      teamSize: employees.length,
      activeEmployees,
      onLeave,
      avgPerformance: Math.round(avgPerformance),
      pendingTasks,
    };
  }, [employees]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'on_leave': return 'orange';
      case 'suspended': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'on_leave': return 'On Leave';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  const goToProfile = (id: string) => {
    navigate(`/manager/employees/profile/${id}`);
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (_: string, record: Employee) => (
        <Space align="center">
          <Avatar 
            size="large" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.firstName} {record.lastName}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Position',
      dataIndex: 'positionTitle',
      key: 'positionTitle',
      width: 150,
      render: (text: string) => (
        <div>
          <IdcardOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          {text}
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_: any, record: Employee) => (
        <Space direction="vertical" size={4}>
          <div>
            <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {record.email}
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            {record.phone}
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)}
          style={{ padding: '4px 8px', borderRadius: '4px' }}
        >
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Hire Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#fa8c16' }} />
          {format(new Date(createdAt), "MMM dd, yyyy")}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (record: any) => (
        <Space size="small">
          <Tooltip title="View Profile">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              size="small"
              onClick={() => goToProfile(record.id)}
            />
          </Tooltip>
          <Tooltip title="Send Message">
            <Button
              type="text" 
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const quickActionItems = [
    {
      title: "Schedule Team Meeting",
      icon: <TeamOutlined />,
      color: "#1890ff",
      onClick: () => message.info("Opening calendar..."),
    },
    {
      title: "Send Announcement",
      icon: <MailOutlined />,
      color: "#52c41a",
      onClick: () => message.info("Composing announcement..."),
    },
    {
      title: "Generate Report",
      icon: <EyeOutlined />,
      color: "#722ed1",
      onClick: () => message.info("Generating team report..."),
    },
  ];

  return (
    <div style={{ padding: "10px 10px" }}>
      <Card
        style={{ borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header with Stats */}
        <div style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px",
          borderRadius: "8px 8px 0 0"
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size="small">
                <h2 style={{ color: "white", margin: 0 }}>Team Management</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", margin: 0 }}>
                  Manage your direct reports and team performance
                </p>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => navigate("/manager/employees/create")}
              >
                Add to Team
              </Button>
            </Col>
          </Row>

          {/* Quick Stats */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={12} sm={4}>
              <Statistic
                title="Team Size"
                value={managerStats.teamSize}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "white" }}
                suffix={<span style={{ fontSize: 12, opacity: 0.8 }}>members</span>}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Statistic
                title="Active"
                value={managerStats.activeEmployees}
                valueStyle={{ color: "white" }}
                suffix={<span style={{ fontSize: 12, opacity: 0.8 }}>/ {managerStats.teamSize}</span>}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Statistic
                title="On Leave"
                value={managerStats.onLeave}
                valueStyle={{ color: "white" }}
              />
            </Col>
          </Row>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Space wrap>
            {quickActionItems.map((item, index) => (
              <Button
                key={index}
                icon={item.icon}
                style={{ 
                  color: item.color,
                  borderColor: item.color,
                }}
                onClick={item.onClick}
              >
                {item.title}
              </Button>
            ))}
          </Space>
        </div>

        {/* Tabs and Content */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: "0 24px", marginTop: 16 }}
        >
          <TabPane tab="Team Roster" key="team">
            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} md={8}>
                <Search
                  placeholder="Search team members..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />
              </Col>
              <Col xs={12} md={6}>
                <Select
                  placeholder="Status"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="on-leave">On Leave</Option>
                  <Option value="offline">Offline</Option>
                </Select>
              </Col>
              <Col xs={12} md={6}>
              </Col>
              <Col xs={24} md={4} style={{ textAlign: "right" }}>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTeamData}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Team Table */}
            <Table
              columns={columns}
              dataSource={filteredEmployees}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `${total} team members`,
              }}
              scroll={{ x: 1200 }}
              style={{ marginBottom: 24 }}
              rowClassName={(record) => `status-${record.status}`}
            />
          </TabPane>

          <TabPane tab="Reports" key="reports">
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <TeamOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
              <h3 style={{ color: "#666" }}>Team Reports</h3>
              <p>Generate performance reports, attendance logs, and team analytics</p>
              <Space>
                <Button type="primary">Generate Monthly Report</Button>
                <Button>Export Team Data</Button>
              </Space>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals */}
      <EditWorkerModal
        open={editModalOpen}
        user={selectedEmployee}
        departments={departments}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleUpdateEmployee}
      />

     
    </div>
  );
};

// Add CSS for status-based row styling
const style = document.createElement('style');
style.textContent = `
  .status-on-leave {
    background-color: #fffbe6;
  }
  .status-offline {
    background-color: #fafafa;
    opacity: 0.8;
  }
  .status-offline:hover td {
    background-color: #f0f0f0 !important;
  }
`;
document.head.appendChild(style);

export default ManagerEmployeesTable;