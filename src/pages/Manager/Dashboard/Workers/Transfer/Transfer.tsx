import { Modal, Form, Select } from "antd";
import { useEffect } from "react";

type Props = {
  open: boolean;
  user: any;
  departments: any[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const TransferWorkerModal = ({
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
        departmentId: user.departmentId,
      });
    };
  }, [user, form]);

  return (
    <Modal
      title="Edit Employee"
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

export default TransferWorkerModal;
