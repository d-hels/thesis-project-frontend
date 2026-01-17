import { useEffect, useState } from "react";
import {
  Table,
  message,
  Button,
  Tag,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { format } from "date-fns";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../../../auth/auth";
import {
  deleteUser,
  getDepartments,
  getUsers,
  updateUser,
} from "../../../../api/apiCall";
import EditUserModal from "./EditUserModal/EditUserModal";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  departmentId: number;
  departmentName: string;
  createdAt: string;
};

const UsersTable = () => {
  const { state } = useAuth();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await getUsers(state.user?.token);
      setData(res.payload);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    const response = await getDepartments(state.user?.token);
    if (response.success) {
      setDepartments(response.payload);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleUpdateUser = async (values: any) => {
    try {
      if (!editingUser) return;

      await updateUser(state.user?.token, {
        id: editingUser.id,
        ...values,
      });

      message.success("User updated successfully");
      setOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch {
      message.error("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(state.user?.token, userId);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    }
  };

  const showDeleteConfirm = (id: string) => {
    Modal.confirm({
      title: "Are you sure?",
      icon: <ExclamationCircleOutlined />,
      content: "This action will permanently delete the user.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDelete(id);
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: "Full Name",
      key: "fullName",
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
      render: (_, record) =>
        `${record.firstName} ${record.lastName}`,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Department Name",
      dataIndex: "departmentName",
      key: "departmentName",
      ellipsis: true,
    },
    {
      title: "Role",
      key: "role",
      render: (_, { role }) => {
        let color = "blue";
        if (role === "admin") color = "green";
        if (role === "manager") color = "gold";

        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        format(new Date(date), "dd/MM/yyyy"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex" }}>
          <Button type="link" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => showDeleteConfirm(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "30px" }}>
        <Table
          style={{ width: 1700, margin: "0 auto" }}
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <EditUserModal
        open={open}
        user={editingUser}
        departments={departments}
        onCancel={() => {
          setOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUpdateUser}
      />
    </>
  );
};

export default UsersTable;
