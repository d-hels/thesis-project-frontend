import { Modal, Form, Input, Select } from "antd";
import { useEffect } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  departmentId: number;
};

type Props = {
  open: boolean;
  user: User | null;
  departments: any[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const EditUserModal = ({
  open,
  user,
  departments,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        departmentId: user.departmentId,
      });
    }
  }, [user, form]);

  return (
    <Modal
      title="Edit User"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Update"
      destroyOnClose
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onSubmit}
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select placeholder="Select Role">
                <Select.Option value="worker">Worker</Select.Option>
                <Select.Option value="manager">Manager</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>

        <Form.Item
          label="Department"
          name="departmentId"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select department">
            {departments.map((dept: any) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
