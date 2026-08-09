import { Form, Input, Button, Card, Typography, Select, message, Row, Col, Divider } from "antd";
import {
  createWorker,
  getDepartments,
  getPositionsByDepartment,
} from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";
import { useEffect, useState } from "react";
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const CreateWorkersForm = () => {
  const { state } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await createWorker(state.user?.token, values);

      if (res?.data.success) {
        if (res.data.payload === "This user exists") {
          message.error(res?.message || "This user exists");
          return;
        }
        message.success("User created successfully");
        form.resetFields();
      } else {
        message.error(res?.message || "This user exists");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.user?.departmentId) {
      form.setFieldsValue({
        departmentId: state.user.departmentId,
      });
      fetchPositions(state.user?.departmentId);
    }
  }, [state.user?.departmentId]);

  const fetchDepartments = async () => {
    const response = await getDepartments(state.user?.token);

    if (response.success) {
      const userDepartment = response.payload.find(
        (dept: any) => dept.id === state.user?.departmentId
      );
      setDepartments([userDepartment]);
    }
  };

  const fetchPositions = async (departmentId: any) => {
    setLoadingPositions(true);
    const response = await getPositionsByDepartment(
      state.user?.token,
      departmentId
    );

    if (response.success) {
      const payload = Array.isArray(response.payload)
        ? response.payload
        : response.payload
        ? [response.payload]
        : [];
      setPositions(payload);
    } else {
      setPositions([]);
    }

    setLoadingPositions(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <Card style={{ maxWidth: 900, margin: "0 auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>
        Add New Team Member
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          {/* Personal Information Section */}
          <Col xs={24} md={12}>
           
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input 
                  placeholder="Enter first name"
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input 
                  placeholder="Enter last name"
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input 
                  placeholder="Enter email address"
                  prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Minimum 6 characters" },
                ]}
              >
                <Input.Password 
                  placeholder="Enter password"
                />
              </Form.Item>
          </Col>

          {/* Contact & Department Section */}
          <Col xs={24} md={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: "Phone is required" }]}
              >
                <Input 
                  placeholder="Enter phone number"
                  prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input.TextArea 
                  placeholder="Enter complete address"
                  rows={2}
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Department"
                name="departmentId"
                rules={[{ required: true, message: "Department is required" }]}
              >
                <Select 
                  placeholder="Select department" 
                  disabled
                  suffixIcon={<TeamOutlined />}
                >
                  {departments.map((dept) => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                shouldUpdate={(prev, curr) => prev.departmentId !== curr.departmentId}
              >
                {({ getFieldValue }) =>
                  getFieldValue("departmentId") ? (
                    <Form.Item
                      label="Position"
                      name="positionId"
                      rules={[{ required: true, message: "Position is required" }]}
                    >
                      <Select
                        placeholder="Select position"
                        loading={loadingPositions}
                        disabled={positions.length === 0}
                        suffixIcon={<TeamOutlined />}
                      >
                        {positions?.map((pos: any) => (
                          <Option key={pos.id} value={pos.id}>
                            {pos.title}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        {/* Submit Button Section */}
        <div style={{ textAlign: "center" }}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              style={{ 
                minWidth: 200,
                height: 35,
                fontSize: 16,
                fontWeight: 500
              }}
            >
              {loading ? "Creating..." : "Add Team Member"}
            </Button>
          </Form.Item>
          {/* <p style={{ color: "#8c8c8c", marginTop: 8, fontSize: 12 }}>
            The new member will receive login credentials via email
          </p> */}
        </div>
      </Form>
    </Card>
  );
};

export default CreateWorkersForm;