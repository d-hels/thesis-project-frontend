import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Space,
  Button,
  DatePicker,
  Input,
  Select,
  Badge,
  Typography,
  message,
  Spin,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getAttendanceWorkersByDepartment,
  getDepartmentAttendanceByDateRange,
} from "../../../../api/apiCall";
import { useAuth } from "../../../../auth/auth";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendanceDashboard: React.FC = ({ stats }: any) => {
  const { state } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState<any[]>();
  const [dateRange, setDateRange] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getAttendanceData = async () => {
    const response = await getAttendanceWorkersByDepartment(
      state.user?.token,
      state.user?.departmentId
    );
    setAttendanceData(response.payload);
  };

  const calculateStats = () => {
    const today = moment().format("YYYY-MM-DD");
    const todayData: any = attendanceData.filter(
      (item: any) => moment(item.createdAt).format("YYYY-MM-DD") === today
    );

    const activeCount = todayData.filter(
      (item: any) => item.status === "present"
    ).length;
    const lateCount = todayData.filter(
      (item: any) => item.status === "late"
    ).length;
    const absentCount = todayData.filter(
      (item: any) => item.status === "absent"
    ).length;
    const totalWorkers = todayData.length;

    return { activeCount, lateCount, absentCount, totalWorkers };
  };

  const statistics = calculateStats();

  const filterByDate = async () => {
    if (dateRange?.length === 2) {
      const start = dateRange[0].format("YYYY-MM-DD");
      const end = dateRange[1].format("YYYY-MM-DD");
    const response = await getDepartmentAttendanceByDateRange(state.user?.token, state.user?.departmentId, start, end )
    setFilteredData(response.payload)
    }
  }

useEffect(() => {filterByDate();}, [dateRange])
  // Filter data based on search and filters
  useEffect(() => {
    let filtered: any = [...attendanceData];
    filtered = filtered.map((item: any) => {
      return {
        ...item,
        createdAt: moment(item.createdAt).format("YYYY-MM-DDTHH:mm:ss"), // remove Z, convert to local
      };
    });

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter((item: any) => {
        const itemDate = moment(item.createdAt);
        return itemDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
      });
    }

    // if (dateRange?.length === 2) {
    //   const start = dateRange[0].format("YYYY-MM-DD");
    //   const end = dateRange[1].format("YYYY-MM-DD");
    
    //   filtered = filtered.filter((item: any) => {
    //     const itemDate = moment(item.createdAt).format("YYYY-MM-DD");
    
    //     return (
    //       itemDate >= start &&
    //       itemDate <= end
    //     );
    //   });
    // }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item: any) => item.status === statusFilter);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (item: any) =>
          item.fullName.toString().includes(searchText) ||
          item.fullName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [attendanceData, dateRange, statusFilter, searchText]);

  useEffect(() => {
    getAttendanceData();
  }, []);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a: any, b: any) => a.fullName - b.fullName,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
      sorter: (a: any, b: any) =>
        moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (time: string | null) =>
        time ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            {moment(time, "HH:mm:ss").format("hh:mm A")}
          </Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Not checked in
          </Tag>
        ),
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (time: string | null) =>
        time ? (
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            {moment(time, "HH:mm:ss").format("hh:mm A")}
          </Tag>
        ) : (
          <Tag color="orange">Still Active</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "";
        let icon = null;

        switch (status) {
          case "present":
            color = "success";
            icon = <CheckCircleOutlined />;
            break;
          case "active":
            color = "processing";
            icon = <ClockCircleOutlined />;
            break;
          case "late":
            color = "warning";
            icon = <ClockCircleOutlined />;
            break;
          case "absent":
            color = "error";
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = "default";
        }

        return (
          <Tag color={color} icon={icon}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
      filters: [
        { text: "Present", value: "present" },
        { text: "Active", value: "active" },
        { text: "Late", value: "late" },
        { text: "Absent", value: "absent" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Duration",
      key: "duration",
      render: (record: any) => {
        console.log(record, "res");
        if (record.checkIn && record.checkOut) {
          const checkIn = moment(record.checkIn, "HH:mm");
          const checkOut = moment(record.checkOut, "HH:mm");
          const duration = moment.duration(checkOut.diff(checkIn));
          const hours = Math.floor(duration.asHours());
          const minutes = duration.minutes();
          return `${hours}h ${minutes}m`;
        }
        return "-";
      },
    },
    // {
    //   title: "Last Updated",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   render: (timestamp: string) => moment(timestamp).format("hh:mm A"),
    //   sorter: (a: any, b: any) =>
    //     moment(a.updatedAt).unix() - moment(b.updatedAt).unix(),
    // },
  ];

  const handleExportData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("Data exported successfully");
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call to refresh data
    setTimeout(() => {
      setLoading(false);
      message.success("Data refreshed successfully");
    }, 1000);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px", marginTop: -10 }}>
        <Col span={24}>
          <Title level={3}>Worker Attendance</Title>
          <Text type="secondary">
            Monitor and manage worker check-ins and check-outs
          </Text>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Present Today"
              value={attendanceData.length}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
              suffix={`/ ${stats.totalWorkers}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Currently Active"
              value={stats.presentWorkers}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Late Arrivals"
              value={statistics.lateCount}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Absent Today"
              value={stats.absentWorkers}
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search by Name"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={setDateRange}
              allowClear
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="present">Present</Option>
              <Option value="active">Active</Option>
              <Option value="late">Late</Option>
              <Option value="absent">Absent</Option>
            </Select>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setDateRange(null);
                  setStatusFilter("all");
                  setSearchText("");
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportData}
                loading={loading}
              >
                Export Data
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Attendance Records</span>
            <Badge count={filteredData?.length} showZero />
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="uuid"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} records`,
            }}
            scroll={{ x: true }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default AttendanceDashboard;
