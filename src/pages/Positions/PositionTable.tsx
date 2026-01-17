import { useEffect, useState } from "react";
import { Table, message, Button, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import CreatePositionForm from "./Create/Create";

import {
  getPositions,
  getDepartments,
  deletePosition,
} from "../../api/apiCall";
import { useAuth } from "../../auth/auth";
import EditPositionModal from "./Edit/Edit";

type Position = {
  id: number;
  title: string;
  description: string;
  departmentName: string;
  departmentId: number;
  createdAt: Date;
};

const PositionsTable = () => {
  const { state } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Fetch departments
  const fetchDepartments = async () => {
    const response = await getDepartments(state.user?.token);
    if (response.success) setDepartments(response.payload);
  };

  // Fetch positions
  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res: any = await getPositions(state.user?.token);
      setPositions(res.payload);
    } catch {
      message.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      await deletePosition(state.user?.token, id);
      message.success("Position deleted successfully");
      fetchPositions();
    } catch (error) {
      message.error("Failed to delete position");
      console.error(error);
    }
  };

  const showDeleteConfirm = (id: number) => {
    Modal.confirm({
      title: "Are you sure?",
      icon: <ExclamationCircleOutlined />,
      content: "This action will permanently delete the position.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDelete(id);
      },
    });
  };

  const openEditModal = (position: Position) => {
    setSelectedPosition(position);
    setEditModalOpen(true);
  };

  const columns: ColumnsType<Position> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Department",
      dataIndex: "departmentname",
      key: "departmentname",
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
      <div style={{ display: "flex", justifyContent: "flex-end",padding: "25px", paddingBottom: 0}}>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          Create Position
        </Button>
      </div>

      <div style={{ padding: "30px" }}>
        <Table
          style={{ width: 1500, margin: "0 auto" }}
          columns={columns}
          dataSource={positions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

        <CreatePositionForm
          open={createModalOpen}
          token={state.user?.token}
          onCancel={() => setCreateModalOpen(false)}
          onSuccess={() => { fetchPositions(); setCreateModalOpen(false); }}
        />

      {selectedPosition && (
        <EditPositionModal
          open={editModalOpen}
          position={selectedPosition}
          departments={departments}
          token={state.user?.token}
          onCancel={() => setEditModalOpen(false)}
          onSuccess={() => { fetchPositions(); setEditModalOpen(false); }}
        />
      )}
    </>
  );
};

export default PositionsTable;
