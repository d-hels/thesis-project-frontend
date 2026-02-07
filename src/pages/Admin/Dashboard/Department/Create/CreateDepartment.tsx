import { useEffect } from "react";
import { Form, Input, message, Modal } from "antd";
import { createDepartment } from "../../../../../api/apiCall";

type Props = {
  open: boolean;
  token: string | undefined;
  onCancel: () => void;
  onSuccess: () => void;
};

const CreateDepartmentForm = ({ open, token, onCancel, onSuccess }: Props) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const res: any = await createDepartment(token, values);
      if (res.data.success) {
        message.success("Department created successfully");
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      message.error("Failed to create department");
    }
  };

  // Optional: reset form when modal closes
  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  return (
    <Modal
      title="Create Department"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Create"
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Department Name"
          name="name"
          rules={[{ required: true, message: "Department name is required" }]}
        >
          <Input placeholder="e.g. Human Resources" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDepartmentForm;
