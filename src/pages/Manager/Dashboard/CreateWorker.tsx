import { Form, Input, Button, Card, Typography, Select, message } from "antd";
import {
  createWorker,
  getDepartments,
  getPositionsByDepartment,
} from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";
import { useEffect, useState } from "react";

const { Title } = Typography;
const { Option } = Select;

const CreateWorkersForm = () => {
  const { state } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const res: any = await createWorker(state.user?.token, values);

      if (res?.data.success) {
        if (res.data.payload === "This user exists") {
          message.error(res?.message || "This user exists");
          return;
        }
        message.success("User created successfully");
      } else {
        message.error(res?.message || "This user exists");
      }
    } catch {
      message.error("Something went wrong");
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <Card style={{ maxWidth: 500, margin: "0 auto" }} bordered={false}>
      <Title level={3} style={{ textAlign: "center" }}>
        Create Worker
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* First Name */}
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
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
            { required: true, message: "Password is required" },
            { min: 6, message: "Minimum 6 characters" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Phone is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Address */}
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Department */}
        <Form.Item
          label="Department"
          name="departmentId"
          rules={[{ required: true, message: "Department is required" }]}
        >
          <Select placeholder="Select department" disabled>
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

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create Worker
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateWorkersForm;
