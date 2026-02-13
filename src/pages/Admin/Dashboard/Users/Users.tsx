import { useEffect, useState } from "react";
import {
  Table,
  message,
  Button,
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Input,
  Select,
  Space,
  Avatar,
  Tooltip,
  Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  SwapOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { useAuth } from "../../../../auth/auth";
import {
  getDepartments,
  getUsers,
  transferUserToDepartment,
  updateUserStatus,
} from "../../../../api/apiCall";
import { useNavigate } from "react-router-dom";
import TransferWorkerModal from "../../../Manager/Dashboard/Workers/Transfer/Transfer";

const { Search } = Input;
const { Option } = Select;

type User = {
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
  isActive: boolean;
  status: string;
  lastLoginAt?: string;
  hireDate?: string;
};

const UsersTable = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isOpenTransferModal, setIsOpenTransferModal] = useState(false);

  const goToProfile = (id: string) => {
    navigate(`/dashboard/users/profile/${id}`);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await getUsers(state.user?.token);
      setData(res.payload || []);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments(state.user?.token);
      if (response.success) {
        setDepartments(response.payload || []);
      }
    } catch (error) {
      message.error("Failed to load departments");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);


  const setUserStatus = async (user: User) => {
    try {
      const response = await updateUserStatus(
        state.user?.token,
        user.id,
        !user.isActive
      );
      if (response.success) {
        message.success(
          `User ${!user.isActive ? "activated" : "deactivated"} successfully`
        );
        fetchUsers();
      }
    } catch (error) {
      message.error("Failed to update user status");
    }
  };

  const showSetUserStatus = (user: User) => {
    Modal.confirm({
      title: "Change User Status",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${
        user.isActive ? "deactivate" : "activate"
      } this user?`,
      okText: user.isActive ? "Deactivate" : "Activate",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setUserStatus(user);
      },
    });
  };

  // Filter and sort users
  const filteredUsers = data
    .filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "all" ||
        user.departmentId?.toString() === departmentFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "createdAt")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "lastLogin")
        return (
          new Date(b.lastLoginAt || 0).getTime() -
          new Date(a.lastLoginAt || 0).getTime()
        );
      return 0;
    });

  // Calculate statistics
  const totalUsers = data.length;
  const activeUsers = data.filter((user) => user.isActive).length;
  const adminUsers = data.filter((user) => user.role === "admin").length;
  const managerUsers = data.filter((user) => user.role === "manager").length;

  const openTransferModal = (user: User) => {
    setEditingUser(user);
    setIsOpenTransferModal(true);
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
      render: (_, record) => (
        <Space>
          <Avatar
            size="large"
            style={{
              backgroundColor: record.isActive ? "#1890ff" : "#d9d9d9",
              cursor: "pointer",
            }}
            icon={<UserOutlined />}
            onClick={() => goToProfile(record.id)}
          />
          <div>
            <div style={{ fontWeight: 600 }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              <MailOutlined /> {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            <PhoneOutlined /> {record.phone || "N/A"}
          </div>
          {record.address && (
            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: 4 }}>
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
      render: (text) => (
        <Space>
          <BankOutlined style={{ color: "#52c41a" }} />
          <span>{text || "No Department"}</span>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (_, { role }) => {
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
      title: "Status",
      key: "status",
      render: (_, record) => {
        let color = "default";
        let icon = <CloseCircleOutlined />;
        let text = "Inactive";

        if (record.isActive) {
          color = "green";
          icon = <CheckCircleOutlined />;
          text = "Active";
        } else if (record.status === "suspended") {
          color = "red";
          text = "Suspended";
        }

        return (
          <Tag color={color} icon={icon}>
            {text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} />
          {format(new Date(date), "MMM dd, yyyy")}
        </Space>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      sorter: (a, b) =>
        new Date(a.lastLoginAt || 0).getTime() -
        new Date(b.lastLoginAt || 0).getTime(),
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#fa8c16" }} />
          {date ? format(new Date(date), "MMM dd, HH:mm") : "Never"}
        </Space>
      ),
    },
    {
      title: "Active",
      key: "active",
      render: (_, record) => (
        <Tooltip title={record.isActive ? "Deactivate user" : "Activate user"}>
          <Switch
            checked={record.isActive}
            onChange={() => showSetUserStatus(record)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Transfer">
            <Button 
              type="text" 
              icon={<SwapOutlined />}
              onClick={() => openTransferModal(record)}
            />
          </Tooltip>
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

  const handleTransferUser = async (values: any) => {
    try {
      if (!editingUser) return;

      await transferUserToDepartment(state.user?.token, {
        id: editingUser.id,
        ...values,
      });

      message.success("User updated successfully");
      setIsOpenTransferModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch {
      message.error("Failed to update user");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, fontWeight: 600 }}>Users Management</h2>
            <p style={{ margin: "4px 0 0 0", color: "#8c8c8c" }}>
              Manage all system users and their permissions
            </p>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Admins"
              value={adminUsers}
              prefix={<LockOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Managers"
              value={managerUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              enterButton
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Role"
              style={{ width: "100%" }}
              value={roleFilter}
              onChange={setRoleFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="worker">Worker</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Status"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Department"
              style={{ width: "100%" }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Departments</Option>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Sort by"
              style={{ width: "100%" }}
              value={sortBy}
              onChange={setSortBy}
              suffixIcon={<SortAscendingOutlined />}
            >
              <Option value="name">Name (A-Z)</Option>
              <Option value="createdAt">Creation Date</Option>
              <Option value="lastLogin">Last Login</Option>
            </Select>
          </Col>
          <Col span={2} style={{ textAlign: "right" }}>
            <Tag color="blue">
              Active: {activeUsers} / {totalUsers}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card
        title="Users List"
        extra={
          <span style={{ color: "#8c8c8c", fontSize: "14px" }}>
            Showing {filteredUsers.length} of {totalUsers} users
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${total} users total`,
          }}
          rowClassName={(record) => (!record.isActive ? "inactive-row" : "")}
          scroll={{ x: 1500 }}
        />
      </Card>

      <TransferWorkerModal
        open={isOpenTransferModal}
        user={editingUser}
        departments={departments}
        onCancel={() => {
          setIsOpenTransferModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleTransferUser}
      />
    </div>
  );
};

export default UsersTable;
