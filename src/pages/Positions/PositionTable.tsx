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
  Badge,
  Tooltip
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  CalendarOutlined,
  BankOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import CreatePositionForm from "./Create/Create";
import {
  getPositions,
  getDepartments,
  deletePosition,
  getAllWorkersCount,
} from "../../api/apiCall";
import { useAuth } from "../../auth/auth";
import EditPositionModal from "./Edit/Edit";

const { Search } = Input;
const { Option } = Select;

type Position = {
  id: number;
  title: string;
  description: string;
  departmentName: string;
  departmentId: number;
  createdAt: Date;
  employeeCount?: number;
  status?: 'active' | 'inactive';
};

const PositionsTable = () => {
  const { state } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [totalEmployees, setTotalEmployees] = useState();

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
  const fetchDepartments = async () => {
    try {
      const response = await getDepartments(state.user?.token);
      if (response.success) setDepartments(response.payload || []);
    } catch (error) {
      message.error("Failed to load departments");
    }
  };

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res: any = await getPositions(state.user?.token);
      const enhancedPositions = res.payload?.map((position: any) => ({
        ...position,
      }));
      setPositions(enhancedPositions || []);
    } catch {
      message.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
    fetchEmployeeCount();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deletePosition(state.user?.token, id);
      message.success("Position deleted successfully");
      fetchPositions();
    } catch (error) {
      message.error("Failed to delete position");
      console.error(error);
    }
  };

  const showDeleteConfirm = (id: number) => {
    Modal.confirm({
      title: "Delete Position",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this position? This action cannot be undone.",
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

  const openEditModal = (position: Position) => {
    setSelectedPosition(position);
    setEditModalOpen(true);
  };

  // Filter and sort positions
  const filteredPositions = positions
    .filter(position => {
      const matchesSearch = position.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           position.description.toLowerCase().includes(searchText.toLowerCase()) ||
                           position.departmentName?.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || position.departmentId?.toString() === departmentFilter;
      return matchesSearch && matchesStatus  && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'employeeCount') return (b.employeeCount || 0) - (a.employeeCount || 0);
      return 0;
    });

  // Calculate statistics
  const activePositions = positions.filter(pos => pos.status === 'active').length;
  const totalPositions = positions.length;

  const columns: ColumnsType<Position> = [
    {
      title: "Position",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <Space>
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
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      sorter: (a, b) => (a.departmentName || '').localeCompare(b.departmentName || ''),
      render: (text) => (
        <Space>
          <BankOutlined style={{ color: '#52c41a' }} />
          <span>{text || 'No Department'}</span>
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
            backgroundColor: (count || 0) > 10 ? '#52c41a' : '#1890ff',
            fontSize: '12px'
          }} 
        />
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag 
          color={record.status === 'active' ? 'green' : 'default'} 
          icon={record.status === 'active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {record.status === 'active' ? 'Active' : 'Inactive'}
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
      width: 120,
      render: (_, record) => (
        <Space size="small">
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

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, fontWeight: 600 }}>Positions Management</h2>
            <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              Manage all job positions and their assignments
            </p>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Position
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Positions"
              value={totalPositions}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Positions"
              value={activePositions}
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

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Search positions..."
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
              placeholder="Filter by department"
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </Option>
              ))}
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
              <Option value="title">Title (A-Z)</Option>
              <Option value="createdAt">Creation Date</Option>
              <Option value="employeeCount">Employee Count</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Positions Table */}
      <Card
        title="Positions List"
        extra={
          <Tag color="blue">
            Total: {totalPositions}
          </Tag>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredPositions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${total} positions total`
          }}
          rowClassName={(record) => 
            record.status === 'inactive' ? 'inactive-row' : ''
          }
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Position Modal */}
      <CreatePositionForm
        open={createModalOpen}
        token={state.user?.token}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => { 
          fetchPositions(); 
          setCreateModalOpen(false);
          message.success('Position created successfully!');
        }}
      />

      {/* Edit Position Modal */}
      {selectedPosition && (
        <EditPositionModal
          open={editModalOpen}
          position={selectedPosition}
          departments={departments}
          token={state.user?.token}
          onCancel={() => setEditModalOpen(false)}
          onSuccess={() => { 
            fetchPositions(); 
            setEditModalOpen(false);
            message.success('Position updated successfully!');
          }}
        />
      )}
    </div>
  );
};

export default PositionsTable;
