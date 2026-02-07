import { useState, useEffect } from "react";
import { Form, Input, message, Select, Modal } from "antd";
import { createPosition, getDepartments } from "../../../api/apiCall";

type Props = {
    open: boolean;
    token: string | undefined;
    onCancel: () => void;
    onSuccess: () => void;
  };

const CreatePositionForm = ({ open, token, onCancel, onSuccess }: Props) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetchDepartments = async () => {
    const response = await getDepartments(token);
    if (response.success) setDepartments(response.payload);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const res: any = await createPosition(token, values);
      if (res.data.success) {
        message.success("Position created successfully");
        form.resetFields();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      message.error("Failed to create position");
    }
  };

  return (
    <Modal
      title="Create Position"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Create"
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Position name is required" }]}
        >
          <Input placeholder="e.g. Software Developer" />
        </Form.Item>

        <Form.Item
          label="Department"
          name="departmentId"
          rules={[{ required: true, message: "Department is required" }]}
        >
          <Select placeholder="Select department">
            {departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
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

export default CreatePositionForm;
