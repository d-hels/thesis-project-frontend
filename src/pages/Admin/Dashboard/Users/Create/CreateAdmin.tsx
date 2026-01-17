import { Form, Input, Button, Card, Typography, Select } from "antd";
import { createAdmin, getDepartments } from "../../../../../api/apiCall";
import { useAuth } from "../../../../../auth/auth";
import { useEffect, useState } from "react";

const { Title } = Typography;
const { Option } = Select;

const CreateAdminForm = () => {
    const {state} = useAuth();
    const [departments, setDepartments] = useState([]);
    const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    await createAdmin(state.user?.token, values);
  };

  const fetchDepartments = async () => {
    const response = await getDepartments(state.user?.token);
    if(response.success) {
      setDepartments(response.payload);
    }
  }

  useEffect (() => {
    fetchDepartments()
  }, [])

  return (
    <Card style={{ maxWidth: 500, margin: "0 auto" }} bordered={false}>
      <Title level={3} style={{ textAlign: "center" }}>
        Create User
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* First Name */}
        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true },
            { min: 6, message: "Minimum 6 characters" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {/* Address */}
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {/* Role */}
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role is required" }]}
        >
          <Select placeholder="Select role">
            <Option value="admin">Admin</Option>
            <Option value="manager">Manager</Option>
          </Select>
        </Form.Item>

        {/* Department – ONLY for manager */}
        <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role}>
          {({ getFieldValue }) =>
            getFieldValue("role") === "manager" ? (
              <Form.Item
                label="Department"
                name="departmentId"
                rules={[
                  { required: true, message: "Department is required for managers" },
                ]}
              >
                <Select placeholder="Select department">
                  {departments.map((value: any) => (
                    <Option value={value.id}>{value.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create User
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateAdminForm;
