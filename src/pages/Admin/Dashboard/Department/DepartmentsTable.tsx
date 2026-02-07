import { useEffect, useState } from "react";
import { 
  Table, 
  Button, 
  message, 
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
  Badge,
  Tooltip,
  Spin
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  ExclamationCircleOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import { format } from "date-fns";

import CreateDepartmentForm from "./Create/CreateDepartment";
import EditDepartmentModal from "./Edit/EditDepartmentModal";
import { useAuth } from "../../../../auth/auth";
import { getDepartments, deleteDepartment, getUsersByDepartmentId, getAllWorkersCount } from "../../../../api/apiCall";

type Department = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  manager?: string;
  employeeCount?: number;
  location?: string;
  status?: 'active' | 'inactive';
};

type Employee = {
  id: number;
  name: string;
  email: string;
  position: string;
  departmentId: number;
  status: 'active' | 'inactive' | 'on_leave';
  phone: string;
  avatar?: string;
  hireDate: string;
  employeeId: string;
};

const { Search } = Input;
const { Option } = Select;

const DepartmentsTable = () => {
  const { state } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'details'>('table');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [totalEmployees, setTotalEmployees] = useState();

  const [employeesModalOpen, setEmployeesModalOpen] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const fetchDepartmentEmployees = async (departmentId: number) => {
    setEmployeesModalOpen(true);

    setEmployeesLoading(true);
    try {
      const response: any = await getUsersByDepartmentId(
        state.user?.token,
        departmentId
      );
 
      setDepartmentEmployees(response.payload);
    } catch (error) {
      message.error("Failed to load department employees");
      console.error(error);
    } finally {
      setEmployeesLoading(false);
    }
  };

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

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res: any = await getDepartments(state.user?.token);
      setDepartments(res.payload);
    } catch {
      message.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeCount = async () => {
    try {
      const res: any = await getAllWorkersCount(state.user?.token);
      setTotalEmployees(res.payload.usersCount);
    } catch {
      message.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
    fetchEmployeeCount();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(state.user?.token, id);
      message.success("Department deleted successfully");
      fetchDepartments();
      if (viewMode === 'details' && selectedDepartment?.id === id) {
        setViewMode('table');
      }
    } catch (error) {
      message.error("Failed to delete department");
      console.error(error);
    }
  };

  const showDeleteConfirm = (id: number) => {
    Modal.confirm({
      title: "Delete Department",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this department? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: {
        danger: true,
      },
      onOk() {
        handleDelete(id);
      },
    });
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setEditModalOpen(true);
  };

  const openViewDetails = (department: Department) => {
    setSelectedDepartment(department);
    setViewMode('details');
  };

  const filteredDepartments = departments
    .filter(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchText.toLowerCase()) ||
        dept.manager?.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'employeeCount') return (b.employeeCount || 0) - (a.employeeCount || 0);
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const activeDepartments = departments.filter(dept => dept.status === 'active').length;

  const columns: ColumnsType<Department> = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space>
          <Avatar 
            size="large" 
            style={{ 
              backgroundColor: record.status === 'active' ? '#1890ff' : '#d9d9d9',
            }}
            icon={<TeamOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.description?.substring(0, 60)}...
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          {text}
        </Space>
      ),
    },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      key: "employeeCount",
      sorter: (a, b) => (a.employeeCount || 0) - (b.employeeCount || 0),
      render: (count) => (
        <Badge 
          count={count} 
          style={{ 
            backgroundColor: (count || 0) > 20 ? '#52c41a' : '#1890ff',
            fontSize: '12px'
          }} 
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag 
          color={status === 'active' ? 'green' : 'default'} 
          icon={status === 'active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#722ed1' }} />
          {format(new Date(date), "MMM dd, yyyy")}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => openViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const employeeColumns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Employee) => (
        <Space align="center">
          <Avatar 
            size="large" 
            src={record.avatar} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.employeeId}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
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
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#fa8c16' }} />
          {format(new Date(date), "MMM dd, yyyy")}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any) => (
        <Space size="small">
          <Tooltip title="View Profile">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Send Message">
            <Button 
              type="text" 
              icon={<MailOutlined />}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const renderDepartmentDetails = () => {
    if (!selectedDepartment) return null;

    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <Button 
                icon={<EyeOutlined />} 
                onClick={() => setViewMode('table')}
                type="text"
              >
                Back to List
              </Button>
            </Space>
          }
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 32,
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '8px'
          }}>
            <Avatar 
              size={64}
              icon={<TeamOutlined />}
              style={{ 
                backgroundColor: selectedDepartment.status === 'active' ? '#1890ff' : '#d9d9d9',
                marginRight: '16px'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ margin: 0 }}>{selectedDepartment.name}</h2>
                <Tag 
                  color={selectedDepartment.status === 'active' ? 'green' : 'default'} 
                  icon={selectedDepartment.status === 'active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  {selectedDepartment.status === 'active' ? 'Active' : 'Inactive'}
                </Tag>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
                {selectedDepartment.description}
              </p>
            </div>
          </div>

          <Row gutter={24}>
            <Col span={16}>
              <Card title="Department Information">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Manager"
                      value={selectedDepartment.manager}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Employee Count"
                      value={selectedDepartment.employeeCount}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
                
                <div style={{ marginTop: 16 }}>
                  <h4>Created Date</h4>
                  <p>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {format(new Date(selectedDepartment.createdAt), "MMMM dd, yyyy")}
                  </p>
                </div>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    block
                    icon={<TeamOutlined />}
                    onClick={() => fetchDepartmentEmployees(selectedDepartment.id)}
                  >
                    View Employees
                  </Button>
                  <Button 
                    block
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteConfirm(selectedDepartment.id)}
                  >
                    Delete Department
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        <Modal
          title={
            <Space>
              <TeamOutlined />
              <span>Employees in {selectedDepartment.name}</span>
              <Tag color="blue">{departmentEmployees.length} employees</Tag>
            </Space>
          }
          open={employeesModalOpen}
          onCancel={() => setEmployeesModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setEmployeesModalOpen(false)}>
              Close
            </Button>
          ]}
          width={1200}
          style={{ top: 20 }}
        >
          {employeesLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#8c8c8c' }}>Loading employees...</p>
            </div>
          ) : (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Active Employees"
                      value={departmentEmployees.filter(emp => emp.status === 'active').length}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="On Leave"
                      value={departmentEmployees.filter(emp => emp.status === 'on_leave').length}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Inactive"
                      value={departmentEmployees.filter(emp => emp.status === 'inactive').length}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total"
                      value={departmentEmployees.length}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Table
                dataSource={departmentEmployees}
                columns={employeeColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `${total} employees total`
                }}
                rowClassName={(record) => {
                  if (record.status === 'inactive') return 'inactive-row';
                  if (record.status === 'on_leave') return 'on-leave-row';
                  return '';
                }}
                scroll={{ x: 1000 }}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px'
                }}
              />
            </>
          )}
        </Modal>
      </div>
    );
  };


  const renderTableView = () => {
    return (
      <>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <h2 style={{ margin: 0, fontWeight: 600 }}>Departments Management</h2>
                <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                  Manage all departments and their information
                </p>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create Department
                </Button>
              </Col>
            </Row>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Departments"
                  value={departments.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
          <Card>
            <Statistic
              title="Active Positions"
              value={activeDepartments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Employees"
                  value={totalEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Search
                  placeholder="Search departments..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  enterButton
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Filter by status"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Sort by"
                  style={{ width: '100%' }}
                  value={sortBy}
                  onChange={setSortBy}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="name">Name (A-Z)</Option>
                  <Option value="employeeCount">Employee Count</Option>
                  <Option value="createdAt">Creation Date</Option>
                </Select>
              </Col>
              <Col span={4} style={{ textAlign: 'right' }}>
                <Tag color="blue">
                  Active: {activeDepartments} | Total: {departments.length}
                </Tag>
              </Col>
            </Row>
          </Card>

          {/* Departments Table */}
          <Card
            title="Departments List"
            extra={
              <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
                Showing {filteredDepartments.length} of {departments.length} departments
              </span>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredDepartments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `${total} departments total`
              }}
              rowClassName={(record) => 
                record.status === 'inactive' ? 'inactive-row' : ''
              }
              scroll={{ x: 1300 }}
            />
          </Card>
        </div>

        {/* Create Department Modal */}
        <CreateDepartmentForm
          open={createModalOpen}
          token={state.user?.token}
          onCancel={() => setCreateModalOpen(false)}
          onSuccess={() => { 
            fetchDepartments(); 
            setCreateModalOpen(false);
            message.success('Department created successfully!');
          }}
        />

        {/* Edit Department Modal */}
        {selectedDepartment && (
          <EditDepartmentModal
            open={editModalOpen}
            token={state.user?.token}
            department={selectedDepartment}
            onCancel={() => setEditModalOpen(false)}
            onSuccess={() => { 
              fetchDepartments(); 
              setEditModalOpen(false);
              message.success('Department updated successfully!');
            }}
          />
        )}
      </>
    );
  };

  return viewMode === 'table' ? renderTableView() : renderDepartmentDetails();
};

export default DepartmentsTable;