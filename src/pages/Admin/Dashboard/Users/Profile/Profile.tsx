import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Button,
  Divider,
  Typography,
  Space,
  Descriptions,
  Modal,
  message,
  Form,
  Input,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  EditOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { changePassword, getDepartments, getUserProfile, updateUser, updateUserStatus } from "../../../../../api/apiCall";
import { useAuth } from "../../../../../auth/auth";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import EditUserModal from "../EditUserModal/EditUserModal";

const { Title, Text, Paragraph } = Typography;

const EmployeeProfilePage: React.FC = () => {
  const { state } = useAuth();
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const getProfileData = async () => {
    const response = await getUserProfile(state.user?.token, id);
    if (response.success) {
      setEmployee(response.payload);
    }
  };

  const setUserStatus = async (user: any) => {
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
        getProfileData();
      }
    } catch (error) {
      message.error("Failed to update user status");
    }
  };

  const showSetUserStatus = (user: any) => {
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

  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
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

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handlePasswordChange = async (values: any) => {
    try {
      if (!selectedUser) return;

      if(values.newPassword === values.confirmPassword) {

      const response = await changePassword(state.user?.token, {
        id,
        password: values.confirmPassword,
      });

      if (response.success) {
        message.success("Password changed successfully");
        setPasswordModalVisible(false);
        passwordForm.resetFields();
        setSelectedUser(null);
      } else {
        message.error(response.message || "Failed to change password");
      }
    }
    } catch (error) {
      message.error("Failed to change password");
      console.error(error);
    }
  };

  const handleUpdateUser = async (values: any) => {
    try {
      if (!editingUser) return;

      await updateUser(state.user?.token, {
        id: editingUser.id,
        ...values,
      });

      message.success("User updated successfully");
      setOpen(false);
      setEditingUser(null);
      getProfileData();
    } catch {
      message.error("Failed to update user");
    }
  };

  // Skills
  const skills = ["React", "TypeScript", "Next.js", "Node.js", "AWS"];

  useEffect(() => {
    getProfileData();
    fetchDepartments();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Employee Profile</Title>
        <Text type="secondary">View and manage employee information</Text>
      </div>

      {/* Profile Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={100}
              style={{
                backgroundColor: "#1890ff",
                fontSize: 40,
              }}
              icon={<UserOutlined />}
            />
          </Col>
          <Col flex="1">
            <Title level={3} style={{ margin: 0 }}>
              {employee.firstName} {employee.lastName}
            </Title>
            <Paragraph type="secondary" style={{ margin: "8px 0" }}>
              {employee.position}
            </Paragraph>
            <Space>
              <Tag color="blue" icon={<TeamOutlined />}>
                {employee.department}
              </Tag>
              {/* <Tag color="green">
                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </Tag>
              <Tag color="orange">
                {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
              </Tag> */}

            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={24}>
        {/* Left Column - Basic Info */}
        <Col xs={24} md={12}>
          <Card title="Contact Information" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Email</Text>
                <div style={{ marginTop: 4 }}>
                  <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  <Text copyable>{employee.email}</Text>
                </div>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div>
                <Text strong>Phone</Text>
                <div style={{ marginTop: 4 }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  <Text>{employee.phone}</Text>
                </div>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div>
                <Text strong>Location</Text>
                <div style={{ marginTop: 4 }}>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>{employee.address}</Text>
                </div>
              </div>
            </Space>
          </Card>

          
        </Col>

        {/* Right Column - Additional Info */}
        <Col xs={24} md={12}>
        <Card title="Employment Details" style={{marginBottom: 24}}>
            <Descriptions column={1}>
              <Descriptions.Item label="Manager">
                <Text strong>{employee.manager}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hire Date">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {new Date(employee.hireDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {employee.lastLoginAt
                  ? format(new Date(employee.lastLoginAt), "MMM dd, yyyy HH:mm")
                  : "Never"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Quick Actions" style={{marginBottom: 24}}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<EditOutlined />} onClick={() => openEditModal(employee)}>
                Edit Profile
              </Button>
              <Button
                block
                icon={<KeyOutlined />}
                onClick={() => {
                  openPasswordModal(employee);
                }}
              >
                Change Password
              </Button>
              <Button
                block
                icon={
                  employee.isActive ? (
                    <CloseCircleOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={() => {
                  showSetUserStatus(employee);
                }}
                danger={employee.isActive}
              >
                {employee.isActive ? "Deactivate User" : "Activate User"}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Change Password</span>
          </Space>
        }
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        onOk={() => passwordForm.submit()}
        okText="Change Password"
        confirmLoading={loading}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ marginTop: 20 }}
        >
          <div
            style={{
              marginBottom: 16,
              padding: "12px",
              backgroundColor: "#f6ffed",
              borderRadius: 6,
            }}
          >
            <strong>Changing password for:</strong> {selectedUser?.firstName}{" "}
            {selectedUser?.lastName}
            <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
              {selectedUser?.email}
            </div>
          </div>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              iconRender={(visible: any) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <EditUserModal
        open={open}
        user={editingUser}
        departments={departments}
        onCancel={() => {
          setOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
};

export default EmployeeProfilePage;
