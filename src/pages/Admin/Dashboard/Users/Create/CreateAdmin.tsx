import { Form, Input, Button, Card, Typography, Select, message, Divider } from "antd";
import {
  createAdmin,
  getDepartments,
  getPositionsByDepartment,
} from "../../../../../api/apiCall";
import { useAuth } from "../../../../../auth/auth";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

const CreateAdminForm = ({ setActiveMenu }: any) => {
  const { state } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const res: any = await createAdmin(state.user?.token, values);

      if (res?.data.success) {
        if (res.data.payload === "This user exists") {
          message.error(res?.message || "This user exists");
          return;
        }
        message.success("User created successfully");
        setActiveMenu("users-list");
      } else {
        message.error(res?.message || "This user exists");
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const fetchDepartments = async () => {
    const response = await getDepartments(state.user?.token);
    if (response.success) {
      setDepartments(response.payload);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchPositions = async (departmentId: number) => {
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

  return (
    <Card style={{ maxWidth: 600, margin: "0 auto" }} bordered={false}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Create User
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Section 1: Personal Information */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
            Personal Information
          </Text>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* First Name */}
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true, message: "First name is required" }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>

            {/* Last Name */}
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            
            rules={[
              { required: true },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Password */}
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true },
                { min: 6, message: "Minimum 6 characters" },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

          {/* Address */}
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>
        </div>

        <Divider style={{ margin: '0 0 24px 0' }} />

        {/* Section 2: Role & Assignment */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
            Role & Assignment
          </Text>

          {/* Role */}
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select
              placeholder="Select role"
              onChange={() => {
                form.setFieldsValue({
                  departmentId: undefined,
                  positionId: undefined,
                });
                setPositions([]);
              }}
            >
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
            </Select>
          </Form.Item>

          {/* Department – ONLY for manager */}
          <Form.Item
            shouldUpdate={(prev, curr) => prev.role !== curr.role}
            noStyle
          >
            {({ getFieldValue }) =>
              getFieldValue("role") === "manager" ? (
                <Form.Item
                  label="Department"
                  name="departmentId"
                  rules={[
                    {
                      required: true,
                      message: "Department is required for managers",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select department"
                    onChange={(value) => {
                      form.setFieldsValue({ positionId: undefined });
                      fetchPositions(value);
                    }}
                  >
                    {departments.map((dep: any) => (
                      <Option key={dep.id} value={dep.id}>
                        {dep.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {/* Position – ONLY when department is selected */}
          <Form.Item
            shouldUpdate={(prev, curr) => prev.departmentId !== curr.departmentId}
            noStyle
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
                  >
                    {positions.map((pos: any) => (
                      <Option key={pos.id} value={pos.id}>
                        {pos.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </div>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Create User
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateAdminForm;