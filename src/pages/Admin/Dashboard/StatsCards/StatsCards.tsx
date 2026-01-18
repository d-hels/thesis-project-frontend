import { Card, Col, Row, Statistic } from "antd";
import { useEffect, useState } from "react";
import { getUsersCount } from "../../../../api/apiCall";
import { useAuth } from "../../../../auth/auth";

const StatsCards = () => {
  const { state } = useAuth();
  const [numberOfUsers, setNumberOfUsers] = useState(0);

  const getUsersNumber = async () => {
    const response = await getUsersCount(state.user?.token);
    if (response.success) {
      setNumberOfUsers(response.payload.usersCount);
    }
  };

  const stats = [
    { title: "Total Users", value: numberOfUsers },
    { title: "Active Employees", value: 112 },
    { title: "Departments", value: 8 },
    { title: "Open Positions", value: 5 },
  ];

  useEffect(() => {
    getUsersNumber();
  }, []);

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      {stats.map((item) => (
        <Col xs={24} sm={12} md={6} key={item.title}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title={item.title} value={item.value} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
