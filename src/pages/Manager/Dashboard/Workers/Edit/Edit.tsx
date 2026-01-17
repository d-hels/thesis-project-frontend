import { Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { getPositionsByDepartment } from "../../../../../api/apiCall";
import { useAuth } from "../../../../../auth/auth";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  departmentId: number;
  positionId: number;
};

type Props = {
  open: boolean;
  user: User | null;
  departments: any[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const { Option } = Select;

const EditWorkerModal = ({
  open,
  user,
  departments,
  onCancel,
  onSubmit,
}: Props) => {
    const {state} = useAuth();
  const [form] = Form.useForm();
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

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
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
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
      destroyOnHidden
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
          label="Department"
          name="departmentId"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select department"
          onChange={(value) => {
            form.setFieldsValue({ positionId: undefined });
            fetchPositions(value);
          }}>
            {departments.map((dept: any) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item shouldUpdate={(prev, curr) => prev.departmentId !== curr.departmentId}>
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
      </Form>
    </Modal>
  );
};

export default EditWorkerModal;
