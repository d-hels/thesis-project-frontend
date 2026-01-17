import { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";

import CreateDepartmentForm from "./Create/CreateDepartment";
import EditDepartmentModal from "./Edit/EditDepartmentModal";
import { useAuth } from "../../auth/auth";
import { getDepartments, deleteDepartment } from "../../api/apiCall";

type Department = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
};

const DepartmentsTable = () => {
  const { state } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res: any = await getDepartments(state.user?.token);
      setDepartments(res.payload);
    } catch {
      message.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Delete department
  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(state.user?.token, id);
      message.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      message.error("Failed to delete department");
      console.error(error);
    }
  };

  const showDeleteConfirm = (id: number) => {
    Modal.confirm({
      title: "Are you sure?",
      icon: <ExclamationCircleOutlined />,
      content: "This action will permanently delete the department.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDelete(id);
      },
    });
  };

  // Open edit modal
  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setEditModalOpen(true);
  };

  // Table columns
  const columns: ColumnsType<Department> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => format(new Date(date), "dd/MM/yyyy"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button type="link" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => showDeleteConfirm(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "25px", paddingBottom: 0 }}>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          Create Department
        </Button>
      </div>

      <div style={{ padding: "30px" }}>
        <Table
          style={{ width: 1500, margin: "0 auto" }}
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Create Department Modal */}
      <CreateDepartmentForm
        open={createModalOpen}
        token={state.user?.token}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => { fetchDepartments(); setCreateModalOpen(false); }}
      />

      {/* Edit Department Modal */}
      {selectedDepartment && (
        <EditDepartmentModal
          open={editModalOpen}
          token={state.user?.token}
          department={selectedDepartment}
          onCancel={() => setEditModalOpen(false)}
          onSuccess={() => { fetchDepartments(); setEditModalOpen(false); }}
        />
      )}
    </>
  );
};

export default DepartmentsTable;
