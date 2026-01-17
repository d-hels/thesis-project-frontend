import { Modal, Form, Input, Select, message } from "antd";
import { useEffect } from "react";
import { updatePosition } from "../../../api/apiCall";

type Position = {
  id: number;
  title: string;
  description: string;
  departmentName: string;
  departmentId: number;
  createdAt: Date;
};

type Props = {
  open: boolean;
  position: Position;
  departments: any[];
  token: string | undefined;
  onCancel: () => void;
  onSuccess: () => void;
};

const EditPositionModal = ({ open, position, departments, token, onCancel, onSuccess }: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (position) {
      form.setFieldsValue({
        title: position.title,
        description: position.description,
        departmentId: position.departmentId,
      });
    }
  }, [position, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updatePosition(token, { id: position.id, ...values });
      message.success("Position updated successfully");
      onSuccess();
    } catch {
      message.error("Failed to update position");
    }
  };

  return (
    <Modal
      title="Edit Position"
      open={open}
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="Update"
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Department" name="departmentId" rules={[{ required: true }]}>
          <Select placeholder="Select department">
            {departments.map((dept: any) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default EditPositionModal;
