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
  Tooltip,
  Progress,
  DatePicker,
  Form,
  InputNumber
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  ExclamationCircleOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { format, differenceInDays } from "date-fns";
import { createContract, getAllContracts, getAllUsers, updateContract } from "../../../../api/apiCall";
import { useAuth } from "../../../../auth/auth";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

type Contract = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  contractType: 'full_time' | 'part_time' | 'temporary' | 'intern' | 'freelance';
  salaryAmount: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  status?: 'active' | 'expiring_soon' | 'expired' | 'pending';
  department?: string;
  position?: string;
};

const ContractsTable = () => {
    const {state} = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchText, setSearchText] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  
  // Statistics state
  const [totalSalary, setTotalSalary] = useState(0);
  const [expiringContracts, setExpiringContracts] = useState(0);

  // Helper function to determine contract status
  const getContractStatus = (contract: Contract): 'active' | 'expiring_soon' | 'expired' | 'pending' => {
    const today = new Date();
    const startDate = new Date(contract.startDate);
    const endDate = contract.endDate ? new Date(contract.endDate) : null;
    
    if (startDate > today) {
      return 'pending';
    }
    
    if (!endDate) {
      return 'active';
    }
    
    if (endDate < today) {
      return 'expired';
    }
    
    const daysUntilEnd = differenceInDays(endDate, today);
    if (daysUntilEnd <= 30) {
      return 'expiring_soon';
    }
    
    return 'active';
  };

  // Fetch contracts (mock)
  const fetchContracts = async () => {
    setLoading(true);
    try {
      // Simulate API delay
    const response = await getAllContracts(state.user?.token);
      
      // Add status to each contract
      const contractsWithStatus = response.payload.map((contract: any) => {
        const today = dayjs();
        const endDate = dayjs(contract.endDate);
        const daysUntilExpiry = endDate.diff(today, "day");

        let status = contract.status;

        if (daysUntilExpiry < 0) {
          status = "expired";
        } else if (daysUntilExpiry <= 30) {
          status = "expiring";
        } else if (
          !["draft", "sent", "signed_by_employee", "terminated"].includes(
            contract.status
          )
        ) {
          status = "active";
        }

        return { ...contract, status };
      });
      
      setContracts(contractsWithStatus);
      
      // Calculate statistics
      const expiring = contractsWithStatus.filter((c: any) => 
        getContractStatus(c) === 'expiring_soon'
      ).length;
      
      const totalSalarySum = contractsWithStatus
        .filter((c: any) => getContractStatus(c) !== 'expired')
        .reduce((sum: number, c: any) => sum + Number(c.salaryAmount), 0);
      
      setExpiringContracts(expiring);
      setTotalSalary(totalSalarySum);
      
    } catch (error) {
      message.error("Failed to load contracts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success("Contract deleted successfully");
      fetchContracts();
      if (selectedContract?.id === id) {
        setViewModalOpen(false);
        setSelectedContract(null);
      }
    } catch (error) {
      message.error("Failed to delete contract");
      console.error(error);
    }
  };

  const showDeleteConfirm = (id: string) => {
    Modal.confirm({
      title: "Delete Contract",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this contract? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDelete(id);
      },
    });
  };

  // Get contract type color
  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'green';
      case 'part_time': return 'blue';
      case 'temporary': return 'orange';
      case 'intern': return 'purple';
      case 'freelance': return 'cyan';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'expiring_soon': return 'orange';
      case 'expired': return 'red';
      case 'pending': return 'blue';
      default: return 'default';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Filter and sort contracts
  const filteredContracts = contracts
    .filter(contract => {
      // Search filter
      const matchesSearch = 
        contract.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
        contract.userEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
        contract.department?.toLowerCase().includes(searchText.toLowerCase()) ||
        contract.position?.toLowerCase().includes(searchText.toLowerCase());
      
      // Contract type filter
      const matchesType = contractTypeFilter === 'all' || contract.contractType === contractTypeFilter;
      
      // Status filter
      const status = getContractStatus(contract);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange) {
        const startDate = new Date(contract.startDate);
        const rangeStart = new Date(dateRange[0]);
        const rangeEnd = new Date(dateRange[1]);
        matchesDateRange = startDate >= rangeStart && startDate <= rangeEnd;
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesDateRange;
    })

    const handleEditContract = (contract: any) => {
        setEditingContract(contract);
        form.setFieldsValue({
          ...contract,
          startDate: dayjs(contract.startDate),
          endDate: dayjs(contract.endDate),
        });
        setIsModalVisible(true);
      };
      const getStatusTag = (status: string | number) => {
        const statusConfig: any = {
          draft: { color: "default", text: "Draft" },
          sent: { color: "processing", text: "Sent" },
          signed_by_employee: {
            color: "blue",
            text: "Signed by Employee",
          },
          active: { color: "green", text: "Active" },
          expiring: { color: "orange", text: "Expiring Soon" },
          expired: { color: "red", text: "Expired" },
          terminated: { color: "volcano", text: "Terminated" },
        };
    
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      };
  // Table columns
  const columns: ColumnsType<Contract> = [
    {
      title: "Employee",
      dataIndex: "userName",
      key: "userName",
      width: 200,
      sorter: (a, b) => (a.userName || '').localeCompare(b.userName || ''),
      render: (text, record) => (
        <Space>
          <Avatar 
            size="large" 
            src={record.userAvatar}
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: !record.userAvatar ? '#1890ff' : undefined,
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.userEmail}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Position",
      key: "position",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.position}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.department}
          </div>
        </div>
      ),
    },
    {
      title: "Contract Type",
      dataIndex: "contractType",
      key: "contractType",
      width: 140,
      sorter: (a, b) => a.contractType.localeCompare(b.contractType),
      render: (type) => (
        <Tag 
          color={getContractTypeColor(type)}
          style={{ padding: '4px 12px', borderRadius: '4px' }}
        >
          {type.split('_').map((word: any) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Tag>
      ),
    },
    {
      title: "Salary",
      dataIndex: "salaryAmount",
      key: "salaryAmount",
      width: 130,
      sorter: (a, b) => a.salaryAmount - b.salaryAmount,
      render: (amount) => (
        <div style={{ fontWeight: 600, color: '#52c41a' }}>
          <DollarCircleOutlined style={{ marginRight: 8 }} />
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#722ed1' }} />
          {format(new Date(date), "MMM dd, yyyy")}
        </Space>
      ),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 150,
      render: (date, record) => {
        if (!date) {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Unlimited
            </Tag>
          );
        }
        const status = getContractStatus(record);
        return (
          <Space>
            <CalendarOutlined style={{ color: status === 'expired' ? '#f5222d' : '#fa8c16' }} />
            {format(new Date(date), "MMM dd, yyyy")}
            {status === 'expiring_soon' && (
              <Tag color="orange" >Soon</Tag>
            )}
          </Space>
        );
      },
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: any) => getStatusTag(status),
        filters: [
          { text: "Active", value: "active" },
          { text: "Expiring Soon", value: "expiring" },
          { text: "Expired", value: "expired" },
        ],
      },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedContract(record);
                setViewModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => {
                handleEditContract(record);
              }}
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
  const handleAddContract = () => {
    setEditingContract(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  // Contract details modal
  const renderContractDetails = () => {
    if (!selectedContract) return null;
    
    const status = getContractStatus(selectedContract);
    const daysRemaining = selectedContract.endDate 
      ? differenceInDays(new Date(selectedContract.endDate), new Date())
      : null;
    const contractLength = selectedContract.endDate
      ? differenceInDays(new Date(selectedContract.endDate), new Date(selectedContract.startDate))
      : null;
    const completedDays = selectedContract.endDate
      ? differenceInDays(new Date(), new Date(selectedContract.startDate))
      : null;
    const progress = contractLength && completedDays
      ? Math.min(100, Math.max(0, (completedDays / contractLength) * 100))
      : null;

    return (
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Contract Details</span>
            <Tag color={getStatusColor(status)}>
              {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Tag>
          </Space>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setViewModalOpen(false);
              setEditModalOpen(true);
            }}
          >
            Edit Contract
          </Button>
        ]}
        width={800}
      >
        <div style={{ padding: '24px 0' }}>
          {/* Employee Summary */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 24,
            padding: 16,
            backgroundColor: '#fafafa',
            borderRadius: 8
          }}>
            <Avatar 
              size={64} 
              src={selectedContract.userAvatar}
              icon={<UserOutlined />}
              style={{ marginRight: 16 }}
            />
            <div>
              <h3 style={{ margin: 0 }}>{selectedContract.userName}</h3>
              <div style={{ color: '#8c8c8c', marginTop: 4 }}>
                <MailOutlined style={{ marginRight: 8 }} />
                {selectedContract.userEmail}
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{selectedContract.department}</Tag>
                <Tag color="geekblue">{selectedContract.position}</Tag>
              </div>
            </div>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <Card title="Contract Information" size="small">
           
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Contract Type</div>
                  <Tag color={getContractTypeColor(selectedContract.contractType)}>
                    {selectedContract.contractType.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Tag>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Salary</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
                    {formatCurrency(selectedContract.salaryAmount)}
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    per year
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Created At</div>
                  <div>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {format(new Date(selectedContract.createdAt), "MMMM dd, yyyy HH:mm")}
                  </div>
                </div>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Contract Timeline" size="small">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Start Date</div>
                  <div style={{ fontWeight: 600 }}>
                    {format(new Date(selectedContract.startDate), "MMMM dd, yyyy")}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>End Date</div>
                  {selectedContract.endDate ? (
                    <>
                      <div style={{ fontWeight: 600 }}>
                        {format(new Date(selectedContract.endDate), "MMMM dd, yyyy")}
                      </div>
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <div style={{ marginTop: 4 }}>
                          <Tag color="orange">
                            {daysRemaining} days remaining
                          </Tag>
                        </div>
                      )}
                      {daysRemaining !== null && daysRemaining <= 0 && (
                        <div style={{ marginTop: 4 }}>
                          <Tag color="red">Expired</Tag>
                        </div>
                      )}
                    </>
                  ) : (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      No end date (unlimited)
                    </Tag>
                  )}
                </div>

                {progress !== null && (
                  <div>
                    <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Contract Progress</div>
                    <Progress 
                      percent={Math.round(progress)} 
                      status={progress >= 100 ? 'exception' : 'active'}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };
  const [form] = Form.useForm();
  const [editingContract, setEditingContract]: any = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingContract) {
        const newContract = {
          id: editingContract.id,
          ...values,
        };
        // Update existing contract
        const response = await updateContract(state.user?.token, newContract);
        if (response.success) {
         // getContractsData();
        }
      } else {
        // Add new contract
        const newContract = {
          ...values,
          startDate: values.startDate.format("YYYY-MM-DD"),
          endDate: values.endDate.format("YYYY-MM-DD"),
          status: "draft",
        };

        const response = await createContract(state.user?.token, newContract);
        if (response.success) {
          //getContractsData();
        }
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const [workers, setWorkers]: any = useState([]);
  const getWorkers = async () => {
    const response: any = await getAllUsers(
      state.user?.token,
    );
    setWorkers(response.payload);
  };
  useEffect(() => {
    getWorkers()
  }, [])
  const renderAddEditModal = () => {
  
    return (
        <Modal
        title={editingContract ? "Edit Contract" : "Add New Contract"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        {editingContract ? (
          <Form form={form} layout="vertical" name="contractForm">
            <Form.Item
              name="status"
              label="Contract Status"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <Select placeholder="Select status">
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="sent">Sent</Select.Option>
                <Select.Option value="signed_by_employee">
                  Signed by Employee
                </Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="expired">Expired</Select.Option>
                <Select.Option value="terminated">Terminated</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        ) : (
          <Form form={form} layout="vertical" name="contractForm">
            <Form.Item
              name="userId"
              label="Worker"
              rules={[{ required: true, message: "Please select an worker" }]}
            >
              <Select
                placeholder="Select worker"
                showSearch
                optionFilterProp="children"
              >
                {workers.map((employee: any) => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[
                    { required: true, message: "Please select end date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contractType"
                  label="Contract Type"
                  rules={[
                    { required: true, message: "Please select contract type" },
                  ]}
                >
                  <Select placeholder="Select contract type">
                    <Option value="full-time">Full Time</Option>
                    <Option value="part-time">Part Time</Option>
                    <Option value="internship">Internship</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Salary Amount"
                  name="salaryAmount"
                  rules={[
                    { required: true, message: "Department name is required" },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g. 1200"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    )
  }

  // Edit contract modal (simplified for mock)
  const renderEditModal = () => {
    if (!selectedContract) return null;
    
    return (
      <Modal
        title="Edit Contract"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="save" 
            type="primary"
            onClick={() => {
              message.success('Contract updated successfully!');
              setEditModalOpen(false);
              fetchContracts();
            }}
          >
            Save Changes
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '24px 0' }}>
          <p style={{ textAlign: 'center', color: '#8c8c8c' }}>
            This is a mock edit modal. In a real application, this would contain a form to edit contract details.
          </p>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginTop: 16 }}>
            <div><strong>Employee:</strong> {selectedContract.userName}</div>
            <div style={{ marginTop: 8 }}><strong>Current Salary:</strong> {formatCurrency(selectedContract.salaryAmount)}</div>
            <div style={{ marginTop: 8 }}><strong>Contract Type:</strong> {selectedContract.contractType}</div>
            <div style={{ marginTop: 8 }}><strong>Start Date:</strong> {format(new Date(selectedContract.startDate), "MMM dd, yyyy")}</div>
            <div style={{ marginTop: 8 }}><strong>End Date:</strong> {selectedContract.endDate ? format(new Date(selectedContract.endDate), "MMM dd, yyyy") : 'Unlimited'}</div>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, fontWeight: 600 }}>Contracts Management</h2>
            <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              Manage employee contracts, salaries, and employment terms
            </p>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddContract}
            >
              Create Contract
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Contracts"
              value={contracts.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Contracts"
              value={contracts.filter((c) => c.status === "active").length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={expiringContracts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Salary Budget"
              value={formatCurrency(totalSalary)}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={7}>
            <Search
              placeholder="Search by employee, department, position..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              enterButton
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Contract Type"
              style={{ width: '100%' }}
              value={contractTypeFilter}
              onChange={setContractTypeFilter}
              suffixIcon={<FilterOutlined />}
              allowClear
            >
              <Option value="all">All Types</Option>
              <Option value="full_time">Full Time</Option>
              <Option value="part_time">Part Time</Option>
              <Option value="temporary">Temporary</Option>
              <Option value="intern">Intern</Option>
              <Option value="freelance">Freelance</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="expiring_soon">Expiring Soon</Option>
              <Option value="expired">Expired</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Col>
          <Col span={4}>
      
            <Col span={24}>
            <RangePicker 
              placeholder={['Start Date From', 'Start Date To']}
              style={{ width: '170%' }}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.format('YYYY-MM-DD') || '',
                    dates[1]?.format('YYYY-MM-DD') || ''
                  ]);
                } else {
                  setDateRange(null);
                }
              }}
            />
          </Col>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
              <FileTextOutlined /> {filteredContracts.length} contracts
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Contracts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredContracts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${total} contracts total`,
            pageSizeOptions: ['10', '20', '50']
          }}
          rowClassName={(record) => {
            const status = getContractStatus(record);
            if (status === 'expired') return 'expired-row';
            if (status === 'expiring_soon') return 'expiring-row';
            return '';
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* Modals */}
      {renderContractDetails()}
      {renderEditModal()}
      {renderAddEditModal()}
    </div>
  );
};

export default ContractsTable;
