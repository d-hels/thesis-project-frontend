import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Statistic,
  Typography,
  Tag,
  Alert,
  Timeline,
  Space,
  Avatar,
  List,
  Divider,
  Badge,
  Modal,
  message,
  Spin,
  Progress
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserOutlined,
  CalendarOutlined,
  HistoryOutlined,
  BellOutlined,
  TrophyOutlined,
  CoffeeOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

// Mock current worker data
const currentWorker = {
  id: 101,
  uuid: 'user-001',
  name: 'John Doe',
  role: 'Software Developer',
  department: 'Engineering',
  avatarColor: '#1890ff'
};

// Mock recent activity
const recentActivities = [
  {
    time: 'Today, 09:00 AM',
    action: 'Checked in',
    description: 'On time arrival',
    icon: <LoginOutlined />,
    color: 'green'
  },
  {
    time: 'Yesterday, 05:30 PM',
    action: 'Checked out',
    description: 'Regular departure',
    icon: <LogoutOutlined />,
    color: 'blue'
  },
  {
    time: 'Yesterday, 01:00 PM',
    action: 'Break started',
    description: 'Lunch break',
    icon: <CoffeeOutlined />,
    color: 'orange'
  },
  {
    time: 'Jan 21, 08:55 AM',
    action: 'Checked in',
    description: 'Early arrival',
    icon: <LoginOutlined />,
    color: 'green'
  }
];

// Mock monthly stats
const monthlyStats = {
  totalWorkingDays: 18,
  presentDays: 17,
  lateDays: 1,
  averageHours: '8h 15m',
  overtimeHours: '4h 30m'
};

const WorkerDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [workDuration, setWorkDuration] = useState<string>('0h 0m');
  const [currentTime, setCurrentTime] = useState<string>(moment().format('HH:mm:ss'));
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [breakDuration, setBreakDuration] = useState<string>('0m');

  // Initialize today's record
  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');
    
    // Check if already checked in today
    const existingRecord = {
      id: 1,
      date: today,
      check_in: null,
      check_out: null,
      status: 'not_checked_in',
      breaks: []
    };
    
    setTodayRecord(existingRecord);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format('HH:mm:ss'));
      
      // Update work duration if checked in
      if (todayRecord?.check_in && !todayRecord?.check_out) {
        const start = moment(todayRecord.check_in, 'HH:mm:ss');
        const now = moment();
        const duration = moment.duration(now.diff(start));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        setWorkDuration(`${hours}h ${minutes}m`);
      }
      
      // Update break duration if on break
      if (isOnBreak && breakStartTime) {
        const start = moment(breakStartTime, 'HH:mm:ss');
        const now = moment();
        const duration = moment.duration(now.diff(start));
        const minutes = duration.minutes();
        setBreakDuration(`${minutes}m`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [todayRecord, isOnBreak, breakStartTime]);

  const handleCheckIn = () => {
    Modal.confirm({
      title: 'Check In',
      content: 'Are you sure you want to check in?',
      onOk: () => {
        setLoading(true);
        const checkInTime = moment().format('HH:mm:ss');
        
        // Determine if late (after 9:05 AM)
        const isLate = moment().isAfter(moment().set({ hour: 9, minute: 5, second: 0 }));
        
        setTimeout(() => {
          const updatedRecord = {
            ...todayRecord,
            check_in: checkInTime,
            status: isLate ? 'late' : 'present'
          };
          
          setTodayRecord(updatedRecord);
          setIsCheckingIn(true);
          setLoading(false);
          
          message.success(
            isLate ? 
            `Checked in at ${moment(checkInTime, 'HH:mm:ss').format('hh:mm A')} (Late arrival)` : 
            `Checked in at ${moment(checkInTime, 'HH:mm:ss').format('hh:mm A')} - Good morning!`
          );

          // Add to activities
          recentActivities.unshift({
            time: `Today, ${moment().format('hh:mm A')}`,
            action: 'Checked in',
            description: isLate ? 'Late arrival' : 'On time arrival',
            icon: <LoginOutlined />,
            color: isLate ? 'orange' : 'green'
          });
        }, 800);
      }
    });
  };

  const handleCheckOut = () => {
    if (!todayRecord?.check_in) {
      message.error('Please check in first!');
      return;
    }

    Modal.confirm({
      title: 'Check Out',
      content: 'Are you sure you want to check out?',
      onOk: () => {
        setLoading(true);
        const checkOutTime = moment().format('HH:mm:ss');
        
        setTimeout(() => {
          const updatedRecord = {
            ...todayRecord,
            check_out: checkOutTime,
            status: 'present'
          };
          
          setTodayRecord(updatedRecord);
          setIsCheckingOut(true);
          setLoading(false);
          
          message.success(`Checked out at ${moment(checkOutTime, 'HH:mm:ss').format('hh:mm A')} - Have a great evening!`);
          
          // Add to activities
          recentActivities.unshift({
            time: `Today, ${moment().format('hh:mm A')}`,
            action: 'Checked out',
            description: 'Regular departure',
            icon: <LogoutOutlined />,
            color: 'blue'
          });
        }, 800);
      }
    });
  };

  const handleStartBreak = () => {
    if (!todayRecord?.check_in) {
      message.error('Please check in first!');
      return;
    }
    
    if (todayRecord?.check_out) {
      message.error('Already checked out for the day');
      return;
    }
    
    setIsOnBreak(true);
    const startTime = moment().format('HH:mm:ss');
    setBreakStartTime(startTime);
    
    message.info('Break started. Remember to end your break!');
    
    // Add to activities
    recentActivities.unshift({
      time: `Today, ${moment().format('hh:mm:ss A')}`,
      action: 'Break started',
      description: 'Taking a break',
      icon: <CoffeeOutlined />,
      color: 'orange'
    });
  };

  const handleEndBreak = () => {
    if (!isOnBreak) {
      message.error('You are not on a break');
      return;
    }
    
    setIsOnBreak(false);
    const endTime = moment().format('HH:mm:ss');
    
    if (breakStartTime) {
      const start = moment(breakStartTime, 'HH:mm:ss');
      const end = moment(endTime, 'HH:mm:ss');
      const duration = moment.duration(end.diff(start));
      const minutes = duration.minutes();
      
      message.success(`Break ended. Duration: ${minutes} minutes`);
      
      // Add break to record
      const newBreak = {
        start: breakStartTime,
        end: endTime,
        duration: minutes
      };
      
      setTodayRecord({
        ...todayRecord,
        breaks: [...(todayRecord.breaks || []), newBreak]
      });
      
      // Add to activities
      recentActivities.unshift({
        time: `Today, ${moment().format('hh:mm A')}`,
        action: 'Break ended',
        description: `Break duration: ${minutes}m`,
        icon: <CoffeeOutlined />,
        color: 'green'
      });
    }
    
    setBreakStartTime(null);
    setBreakDuration('0m');
  };

  const getCurrentStatus = () => {
    if (!todayRecord?.check_in) {
      return {
        text: 'Not Checked In',
        color: 'red',
        icon: <ClockCircleOutlined />
      };
    }
    
    if (todayRecord?.check_out) {
      return {
        text: 'Checked Out',
        color: 'blue',
        icon: <LogoutOutlined />
      };
    }
    
    if (isOnBreak) {
      return {
        text: 'On Break',
        color: 'orange',
        icon: <CoffeeOutlined />
      };
    }
    
    return {
      text: 'Checked In & Working',
      color: 'green',
      icon: <CheckCircleOutlined />
    };
  };

  const status = getCurrentStatus();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Spin spinning={loading}>
        {/* Header with User Info */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Row align="middle" gutter={24}>
                <Col>
                  <Avatar 
                    size={64} 
                    style={{ backgroundColor: currentWorker.avatarColor }}
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col flex={1}>
                  <Title level={4} style={{ marginBottom: 4 }}>
                    {currentWorker.name}
                    <Tag color="blue" style={{ marginLeft: 8 }}>{currentWorker.role}</Tag>
                  </Title>
                  <Paragraph type="secondary">
                    {currentWorker.department} • ID: {currentWorker.id}
                  </Paragraph>
                  <Space size="large">
                    <Text>
                      <CalendarOutlined /> Today: {moment().format('dddd, MMMM D, YYYY')}
                    </Text>
                    <Text>
                      <DashboardOutlined /> Current Time: {currentTime}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Badge 
                    status="processing" 
                    text={
                      <Tag 
                        icon={status.icon} 
                        color={status.color}
                        style={{ fontSize: '16px', padding: '8px 16px' }}
                      >
                        {status.text}
                      </Tag>
                    } 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Main Action Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {/* Check In/Out Card */}
          <Col xs={24} md={12}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Today's Attendance</span>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Check In Time"
                            value={todayRecord?.check_in ? 
                              moment(todayRecord.check_in, 'HH:mm:ss').format('hh:mm A') : 
                              '--:--'}
                            prefix={<LoginOutlined />}
                            valueStyle={{ 
                              color: todayRecord?.check_in ? '#52c41a' : '#999' 
                            }}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Check Out Time"
                            value={todayRecord?.check_out ? 
                              moment(todayRecord.check_out, 'HH:mm:ss').format('hh:mm A') : 
                              '--:--'}
                            prefix={<LogoutOutlined />}
                            valueStyle={{ 
                              color: todayRecord?.check_out ? '#1890ff' : '#999' 
                            }}
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<LoginOutlined />}
                          onClick={handleCheckIn}
                          disabled={!!todayRecord?.check_in || loading}
                          block
                          style={{ height: '60px' }}
                        >
                          {todayRecord?.check_in ? 'Already Checked In' : 'Check In'}
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          type="default"
                          size="large"
                          icon={<LogoutOutlined />}
                          onClick={handleCheckOut}
                          disabled={!!todayRecord?.check_out || !todayRecord?.check_in || loading}
                          block
                          style={{ height: '60px' }}
                        >
                          {todayRecord?.check_out ? 'Already Checked Out' : 'Check Out'}
                        </Button>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Button
                          type={isOnBreak ? "default" : "dashed"}
                          size="large"
                          icon={<CoffeeOutlined />}
                          onClick={isOnBreak ? handleEndBreak : handleStartBreak}
                          disabled={!todayRecord?.check_in || !!todayRecord?.check_out || loading}
                          block
                          style={{ height: '50px' }}
                        >
                          {isOnBreak ? `End Break (${breakDuration})` : 'Start Break'}
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Today's Duration"
                            value={workDuration}
                            valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Monthly Stats */}
          <Col xs={24} md={12}>
            <Card 
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Monthly Performance</span>
                </Space>
              }
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>Attendance Rate</Text>
                  <Progress
                    percent={Math.round((monthlyStats.presentDays / monthlyStats.totalWorkingDays) * 100)}
                    status="active"
                    style={{ marginTop: 8 }}
                  />
                  <Text type="secondary">
                    {monthlyStats.presentDays} out of {monthlyStats.totalWorkingDays} days
                  </Text>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Average Hours/Day"
                        value={monthlyStats.averageHours}
                        valueStyle={{ fontSize: '18px' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Overtime Hours"
                        value={monthlyStats.overtimeHours}
                        valueStyle={{ color: '#faad14', fontSize: '18px' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Tag color="green" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                      <CheckCircleOutlined /> Present: {monthlyStats.presentDays} days
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Tag color="orange" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                      <ClockCircleOutlined /> Late: {monthlyStats.lateDays} day
                    </Tag>
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity and Notifications */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card 
              title={
                <Space>
                  <HistoryOutlined />
                  <span>Recent Activity</span>
                </Space>
              }
            >
              <Timeline>
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <Timeline.Item
                    key={index}
                    color={activity.color}
                    dot={activity.icon}
                  >
                    <Text strong>{activity.action}</Text>
                    <br />
                    <Text type="secondary">{activity.description}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.time}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              title={
                <Space>
                  <BellOutlined />
                  <span>Notifications & Tips</span>
                </Space>
              }
            >
              <List
                size="small"
                dataSource={[
                  {
                    title: 'Early Check-in Bonus',
                    description: 'Check in before 8:45 AM for 3 consecutive days to earn bonus points',
                    color: 'green'
                  },
                  {
                    title: 'Upcoming Holiday',
                    description: 'Company holiday next Monday. Enjoy your long weekend!',
                    color: 'blue'
                  },
                  {
                    title: 'Team Meeting',
                    description: 'Weekly team meeting today at 3:00 PM in Conference Room A',
                    color: 'orange'
                  },
                  {
                    title: 'Break Reminder',
                    description: 'Remember to take regular breaks for better productivity',
                    color: 'purple'
                  }
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: item.color
                          }} />
                          <Text strong>{item.title}</Text>
                        </Space>
                      }
                      description={<Text type="secondary">{item.description}</Text>}
                    />
                  </List.Item>
                )}
              />
              
              <Divider />
              
              <Alert
                message="Quick Tips"
                description={
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Check in within 5 minutes of arrival</li>
                    <li>Take at least 30 minutes of break for every 4 hours worked</li>
                    <li>Check out at the end of your shift</li>
                    <li>Contact HR if you need to adjust your attendance record</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Stats at Bottom */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Current Week Hours"
                value="38.5"
                suffix="hours"
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Punctuality Score"
                value="92"
                suffix="/100"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Breaks Taken Today"
                value={todayRecord?.breaks?.length || 0}
                suffix="breaks"
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Next Check-in"
                value="Tomorrow"
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default WorkerDashboard;

/**
 * import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Tag,
  Progress,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Timeline,
  Divider,
  Space,
  Descriptions,
  Badge
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  EditOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const WorkerDashboard = ({ workerId }) => {
  const [loading, setLoading] = useState(false);
  const [workerData, setWorkerData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [contractsData, setContractsData] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] = useState(false);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [attendanceForm] = Form.useForm();
  const [contractForm] = Form.useForm();

  // Mock data - in real app, this would come from API
  useEffect(() => {
    fetchWorkerData();
    fetchAttendanceData();
    fetchContractsData();
  }, [workerId]);

  const fetchWorkerData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWorkerData({
        id: workerId,
        name: 'John Doe',
        position: 'Senior Developer',
        department: 'Engineering',
        email: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY',
        hireDate: '2022-01-15',
        status: 'active',
        salary: 85000,
        avatarColor: '#1890ff',
        performance: 85,
        remainingVacation: 12,
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1 (555) 987-6543'
        }
      });
      setLoading(false);
    }, 500);
  };

  const fetchAttendanceData = () => {
    // Mock attendance data
    const mockAttendance = [
      {
        key: '1',
        date: '2024-01-15',
        checkIn: '09:00 AM',
        checkOut: '06:00 PM',
        totalHours: 9,
        status: 'present',
        notes: ''
      },
      {
        key: '2',
        date: '2024-01-14',
        checkIn: '09:15 AM',
        checkOut: '06:30 PM',
        totalHours: 9.25,
        status: 'late',
        notes: 'Traffic delay'
      },
      {
        key: '3',
        date: '2024-01-13',
        checkIn: '08:45 AM',
        checkOut: '05:45 PM',
        totalHours: 9,
        status: 'present',
        notes: ''
      },
      {
        key: '4',
        date: '2024-01-12',
        checkIn: '-',
        checkOut: '-',
        totalHours: 0,
        status: 'absent',
        notes: 'Sick leave'
      },
      {
        key: '5',
        date: '2024-01-11',
        checkIn: '09:00 AM',
        checkOut: '06:00 PM',
        totalHours: 9,
        status: 'present',
        notes: ''
      }
    ];
    setAttendanceData(mockAttendance);
  };

  const fetchContractsData = () => {
    // Mock contracts data
    const mockContracts = [
      {
        key: '1',
        contractId: 'CT-2024-001',
        type: 'Full-time',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        salary: 85000,
        status: 'active',
        signedDate: '2023-12-15',
        renewalDate: '2024-11-30'
      },
      {
        key: '2',
        contractId: 'CT-2023-001',
        type: 'Full-time',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        salary: 80000,
        status: 'completed',
        signedDate: '2022-12-15',
        renewalDate: null
      }
    ];
    setContractsData(mockContracts);
  };

  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      key: 'checkIn'
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      key: 'checkOut'
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours) => `${hours}h`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          present: { color: 'green', text: 'Present' },
          late: { color: 'orange', text: 'Late' },
          absent: { color: 'red', text: 'Absent' },
          vacation: { color: 'blue', text: 'Vacation' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes'
    }
  ];

  const contractsColumns = [
    {
      title: 'Contract ID',
      dataIndex: 'contractId',
      key: 'contractId'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `$${salary.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Active' },
          completed: { color: 'blue', text: 'Completed' },
          terminated: { color: 'red', text: 'Terminated' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const handleEditWorker = () => {
    form.setFieldsValue(workerData);
    setIsEditModalVisible(true);
  };

  const handleSaveWorker = async () => {
    try {
      const values = await form.validateFields();
      console.log('Updated worker data:', values);
      message.success('Worker information updated successfully');
      setIsEditModalVisible(false);
      fetchWorkerData(); // Refresh data
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleAddAttendance = async () => {
    try {
      const values = await attendanceForm.validateFields();
      console.log('New attendance:', values);
      message.success('Attendance record added successfully');
      setIsAttendanceModalVisible(false);
      attendanceForm.resetFields();
      fetchAttendanceData(); // Refresh data
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleAddContract = async () => {
    try {
      const values = await contractForm.validateFields();
      console.log('New contract:', values);
      message.success('Contract added successfully');
      setIsContractModalVisible(false);
      contractForm.resetFields();
      fetchContractsData(); // Refresh data
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const calculateStats = () => {
    const presentDays = attendanceData.filter(a => a.status === 'present').length;
    const lateDays = attendanceData.filter(a => a.status === 'late').length;
    const absentDays = attendanceData.filter(a => a.status === 'absent').length;
    
    return {
      presentDays,
      lateDays,
      absentDays,
      totalDays: attendanceData.length,
      attendanceRate: attendanceData.length > 0 ? 
        Math.round(((presentDays + lateDays) / attendanceData.length) * 100) : 0
    };
  };

  const stats = calculateStats();

  if (loading || !workerData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Section 
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Avatar 
              size={100} 
              style={{ 
                backgroundColor: workerData.avatarColor,
                fontSize: '36px'
              }}
            >
              {workerData.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
          </Col>
          <Col span={16}>
            <Row>
              <Col span={24}>
                <h1 style={{ marginBottom: 4 }}>{workerData.name}</h1>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {workerData.position}
                </Tag>
                <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {workerData.department}
                </Tag>
              </Col>
              <Col span={24} style={{ marginTop: 16 }}>
                <Space size="large">
                  <div>
                    <MailOutlined /> {workerData.email}
                  </div>
                  <div>
                    <PhoneOutlined /> {workerData.phone}
                  </div>
                  <div>
                    <CalendarOutlined /> Joined {dayjs(workerData.hireDate).format('MMM DD, YYYY')}
                  </div>
                </Space>
              </Col>
            </Row>
          </Col>
          <Col span={4}>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEditWorker}
            >
              Edit Profile
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats Section 
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Attendance Rate"
              value={stats.attendanceRate}
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
            <Progress percent={stats.attendanceRate} size="small" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Present Days"
              value={stats.presentDays}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Annual Salary"
              value={workerData.salary}
              prefix="$"
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vacation Days Left"
              value={workerData.remainingVacation}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs 
      <Tabs defaultActiveKey="1">
        <TabPane tab="Overview" key="1">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Recent Activity" style={{ marginBottom: 16 }}>
                <Timeline>
                  <Timeline.Item color="green">
                    <p>Completed project milestone (Jan 15, 2024)</p>
                  </Timeline.Item>
                  <Timeline.Item color="green">
                    <p>Annual performance review completed (Jan 10, 2024)</p>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p>Salary adjustment processed (Jan 1, 2024)</p>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p>New contract signed (Dec 15, 2023)</p>
                  </Timeline.Item>
                </Timeline>
              </Card>

              <Card title="Performance Metrics">
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress 
                        type="dashboard" 
                        percent={workerData.performance} 
                        width={150}
                      />
                      <p style={{ marginTop: 8 }}>Overall Performance</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '20px' }}>
                      <p><strong>Productivity:</strong> 92%</p>
                      <Progress percent={92} status="active" />
                      
                      <p style={{ marginTop: 16 }}><strong>Quality:</strong> 88%</p>
                      <Progress percent={88} status="active" />
                      
                      <p style={{ marginTop: 16 }}><strong>Teamwork:</strong> 90%</p>
                      <Progress percent={90} status="active" />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="Emergency Contact" style={{ marginBottom: 16 }}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Name">
                    {workerData.emergencyContact.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Relationship">
                    {workerData.emergencyContact.relationship}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {workerData.emergencyContact.phone}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    block
                    icon={<PlusOutlined />}
                    onClick={() => setIsAttendanceModalVisible(true)}
                  >
                    Add Attendance Record
                  </Button>
                  <Button 
                    block
                    icon={<FileTextOutlined />}
                    onClick={() => setIsContractModalVisible(true)}
                  >
                    Add New Contract
                  </Button>
                  <Button 
                    block
                    icon={<CalendarOutlined />}
                  >
                    Schedule Review
                  </Button>
                  <Button 
                    block
                    icon={<DollarOutlined />}
                  >
                    Process Bonus
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Attendance" key="2">
          <Card 
            title="Attendance Records" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsAttendanceModalVisible(true)}
              >
                Add Record
              </Button>
            }
          >
            <Table 
              columns={attendanceColumns} 
              dataSource={attendanceData}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Contracts" key="3">
          <Card 
            title="Contract History"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsContractModalVisible(true)}
              >
                Add Contract
              </Button>
            }
          >
            <Table 
              columns={contractsColumns} 
              dataSource={contractsData}
              pagination={{ pageSize: 5 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: 16 }}>
                    <p><strong>Signed Date:</strong> {dayjs(record.signedDate).format('MMM DD, YYYY')}</p>
                    {record.renewalDate && (
                      <p><strong>Renewal Date:</strong> {dayjs(record.renewalDate).format('MMM DD, YYYY')}</p>
                    )}
                    <p><strong>Status Details:</strong> This contract is {record.status}.</p>
                  </div>
                )
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Documents" key="4">
          <Card title="Worker Documents">
            <p>Contract Files, Certificates, ID Copies, etc. would be listed here.</p>
            <Button type="primary" icon={<PlusOutlined />}>
              Upload Document
            </Button>
          </Card>
        </TabPane>
      </Tabs>

      {/* Edit Worker Modal 
      <Modal
        title="Edit Worker Information"
        open={isEditModalVisible}
        onOk={handleSaveWorker}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: 'Please enter position' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select>
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="Sales">Sales</Option>
                  <Option value="HR">Human Resources</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Annual Salary"
                rules={[{ required: true, message: 'Please enter salary' }]}
              >
                <Input type="number" prefix="$" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Attendance Modal 
      <Modal
        title="Add Attendance Record"
        open={isAttendanceModalVisible}
        onOk={handleAddAttendance}
        onCancel={() => setIsAttendanceModalVisible(false)}
      >
        <Form form={attendanceForm} layout="vertical">
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkIn"
                label="Check In Time"
                rules={[{ required: true, message: 'Please enter check in time' }]}
              >
                <Input placeholder="09:00 AM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkOut"
                label="Check Out Time"
                rules={[{ required: true, message: 'Please enter check out time' }]}
              >
                <Input placeholder="06:00 PM" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="present">Present</Option>
              <Option value="late">Late</Option>
              <Option value="absent">Absent</Option>
              <Option value="vacation">Vacation</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Contract Modal 
      <Modal
        title="Add New Contract"
        open={isContractModalVisible}
        onOk={handleAddContract}
        onCancel={() => setIsContractModalVisible(false)}
        width={600}
      >
        <Form form={contractForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractId"
                label="Contract ID"
                rules={[{ required: true, message: 'Please enter contract ID' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Contract Type"
                rules={[{ required: true, message: 'Please select contract type' }]}
              >
                <Select>
                  <Option value="Full-time">Full-time</Option>
                  <Option value="Part-time">Part-time</Option>
                  <Option value="Contractor">Contractor</Option>
                  <Option value="Intern">Intern</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Salary"
                rules={[{ required: true, message: 'Please enter salary' }]}
              >
                <Input type="number" prefix="$" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="draft">Draft</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="signedDate"
            label="Signed Date"
            rules={[{ required: true, message: 'Please select signed date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkerDashboard;
 */