import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Alert,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  InputNumber,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createContract,
  getContracts,
  getWorkersByDepartmentId,
  sendContractPdfToUser,
  updateContract,
} from "../../../../api/apiCall";
import { useAuth } from "../../../../auth/auth";

const { Title, Text } = Typography;
const { Option } = Select;

const Contracts = () => {
  const { state } = useAuth();
  const [contracts, setContracts]: any = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContract, setEditingContract]: any = useState(null);
  const [form] = Form.useForm();
  const [workers, setWorkers]: any = useState([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const getWorkers = async () => {
    const response: any = await getWorkersByDepartmentId(
      state.user?.token,
      state.user?.departmentId
    );
    setWorkers(response.payload);
  };

  const getContractsData = async () => {
    const response = await getContracts(state.user?.token);
    if (response.success) {
      const updatedContracts = response.payload.map((contract: any) => {
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
      setContracts(updatedContracts);
    }
  };

  useEffect(() => {
    getWorkers();
    getContractsData();
  }, []);

  const getExpiringContracts = () => {
    const today = dayjs();
    const thirtyDaysFromNow = today.add(30, "day");

    return contracts.filter((contract: any) => {
      const endDate = dayjs(contract.endDate);
      const daysUntilExpiry = endDate.diff(today, "day");
      return (
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 30 &&
        contract.status !== "expired"
      );
    });
  };

  const expiringContracts = getExpiringContracts();

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

  const getContractTypeTag = (type: string | number) => {
    const typeConfig: any = {
      "full-time": { color: "blue", text: "Full Time" },
      "part-time": { color: "purple", text: "Part Time" },
      internship: { color: "cyan", text: "Internship" },
    };
    const config = typeConfig[type] || { color: "default", text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const createContractPdf = async (record: any) => {
    try {
      setLoadingIds((prev) => [...prev, record.id]);

      const response = await sendContractPdfToUser(
        state.user?.token,
        record.id,
      );

      if (response.success) {
        message.success("Email sent successfully!");
        getContractsData();
      } else {
        message.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Something went wrong while generating the PDF");
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== record.id));
    }
  };

  const columns: any = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: any, record: any) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (
        date: string | number | dayjs.Dayjs | Date | null | undefined
      ) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD/MM/YYYY")}
        </Space>
      ),
      sorter: (
        a: {
          startDate: string | number | dayjs.Dayjs | Date | null | undefined;
        },
        b: {
          startDate: string | number | dayjs.Dayjs | Date | null | undefined;
        }
      ) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (
        date: string | number | dayjs.Dayjs | Date | null | undefined,
        record: { status: string }
      ) => (
        <Space>
          <CalendarOutlined />
          <Text
            style={{
              color: record.status === "expired" ? "#ff4d4f" : "inherit",
            }}
          >
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
        </Space>
      ),
      sorter: (
        a: { endDate: string | number | dayjs.Dayjs | Date | null | undefined },
        b: { endDate: string | number | dayjs.Dayjs | Date | null | undefined }
      ) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
    },
    {
      title: "Contract Type",
      dataIndex: "contractType",
      key: "contractType",
      render: (type: any) => getContractTypeTag(type),
      filters: [
        { text: "Full Time", value: "full-time" },
        { text: "Part Time", value: "part-time" },
        { text: "Internship", value: "internship" },
      ],
      onFilter: (value: any, record: { contractType: any }) =>
        record.contractType === value,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: any) => getStatusTag(status),
      filters: [
        { text: "Active", value: "active" },
        { text: "Expiring Soon", value: "expiring" },
        { text: "Expired", value: "expired" },
      ],
      onFilter: (value: any, record: { status: any }) =>
        record.status === value,
    },
    {
      title: "Days Remaining",
      key: "daysRemaining",
      render: (
        _: any,
        record: {
          endDate: string | number | dayjs.Dayjs | Date | null | undefined;
        }
      ) => {
        const endDate = dayjs(record.endDate);
        const today = dayjs();
        const daysRemaining = endDate.diff(today, "day");

        if (daysRemaining < 0) {
          return <Tag color="red">Expired</Tag>;
        } else if (daysRemaining <= 30) {
          return <Tag color="orange">{daysRemaining} days</Tag>;
        } else {
          return <Tag color="green">{daysRemaining} days</Tag>;
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewContract(record)}
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            loading={loadingIds.includes(record.id)}
            onClick={() => createContractPdf(record)}
          />

          <Button type="text" onClick={() => handleEditContract(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddContract = () => {
    setEditingContract(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditContract = (contract: any) => {
    setEditingContract(contract);
    form.setFieldsValue({
      ...contract,
      startDate: dayjs(contract.startDate),
      endDate: dayjs(contract.endDate),
    });
    setIsModalVisible(true);
  };

  const handleViewContract = (contract: any) => {
    Modal.info({
      title: "Contract Details",
      width: 600,
      content: (
        <div style={{ padding: "20px 0" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Employee: </Text>
              <Text>{contract.employeeName}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Employee ID: </Text>
              <Text>{contract.employeeId}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Start Date: </Text>
              <Text>{dayjs(contract.startDate).format("DD/MM/YYYY")}</Text>
            </Col>
            <Col span={12}>
              <Text strong>End Date: </Text>
              <Text>{dayjs(contract.endDate).format("DD/MM/YYYY")}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Contract Type: </Text>
              {getContractTypeTag(contract.contractType)}
            </Col>
            <Col span={12}>
              <Text strong>Status: </Text>
              {getStatusTag(contract.status)}
            </Col>
          </Row>
        </div>
      ),
    });
  };

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
          getContractsData();
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
          getContractsData();
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

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{ marginBottom: 24, display: "flex", flexDirection: "column" }}
      >
        <Space align="center" style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Contract Management
          </Title>
        </Space>

        <Text type="secondary">
          Manage all employee contracts and track expirations
        </Text>
      </div>

      {/* Role toggle for demo purposes */}
      <div style={{ marginBottom: 16 }}></div>

      {/* Expiring Contracts Warning */}
      {expiringContracts.length > 0 && (
        <Alert
          message={
            <Space>
              <ExclamationCircleOutlined />
              <Text strong>Contracts expiring in next 30 days</Text>
            </Space>
          }
          description={`${expiringContracts.length} contract(s) will expire soon. Please review and take action.`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button type="link" size="small">
              View All
            </Button>
          }
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Contracts" value={contracts.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={expiringContracts.length}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Active Contracts"
              value={contracts.filter((c) => c.status === "active").length}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Expired Contracts"
              value={contracts.filter((c) => c.status === "expired").length}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Contract Table */}
      <Card
        title={
          <Space>
            <span>All Contracts</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddContract}
          >
            Add New Contract
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Contract Modal */}
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
    </div>
  );
};

export default Contracts;
