import { Modal, Form, Input, message } from "antd";
import { useEffect } from "react";
import { updateDepartment } from "../../../api/apiCall";

type Department = {
  id: number;
  name: string;
  description: string;
};

type Props = {
  open: boolean;
  token: string | undefined;
  department: Department;
  onCancel: () => void;
  onSuccess: () => void;
};

const EditDepartmentModal = ({ open, token, department, onCancel, onSuccess }: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (department) {
      form.setFieldsValue({
        name: department.name,
        description: department.description,
      });
    }
  }, [department, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateDepartment(token, { id: department.id, ...values });
      message.success("Department updated successfully");
      onSuccess();
    } catch (error) {
      message.error("Failed to update department");
      console.error(error);
    }
  };

  return (
    <Modal
      title="Edit Department"
      open={open}
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="Update"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Department Name"
          name="name"
          rules={[{ required: true, message: "Department name is required" }]}
        >
          <Input />
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

export default EditDepartmentModal;
