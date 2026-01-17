import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Divider,
  Tag,
  Space,
  Form,
  Input,
  Button,
  message,
  Spin,
} from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";
//import { getMyProfile, updateMyProfile } from "../../api/apiCall";
import { useAuth } from "../../auth/auth";

const { Title, Text } = Typography;

// type UserProfile = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone?: string;
//   address?: string;
//   role: string;
//   created_at: string;
// };

const ProfileDashboard = () => {
  const { state } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchProfile = async () => {
    try {
      //const res = await getMyProfile(token);
      setProfile(state.user);
      form.setFieldsValue(state.user);
    } catch {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSave = async () => {
    try {
      //const values = await form.validateFields();
      //await updateMyProfile(token, values);
      message.success("Profile updated successfully");
      fetchProfile();
    } catch {
      message.error("Update failed");
    }
  };

  if (loading || !profile) return <Spin />;

  return (
    <Row gutter={[24, 24]} style={{padding: 20}}>
      {/* LEFT: PROFILE SUMMARY */}
      <Col xs={24} lg={8}>
        <Card>
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <Avatar
              size={96}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1677ff" }}
            />

            <Title level={4}>
              {profile.name} {profile.surname}
            </Title>

            <Text type="secondary">{profile.email}</Text>

            <Tag color="blue">{profile.role.toUpperCase()}</Tag>
          </Space>

          <Divider />

          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong>Phone</Text>
            <Text>{profile.phone || "-"}</Text>

            <Text strong>Address</Text>
            <Text>{profile.address || "-"}</Text>

            <Text strong>Member Since</Text>
            <Text>
              {new Date(profile.created_at).toLocaleDateString()}
            </Text>
          </Space>
        </Card>
      </Col>

      {/* RIGHT: PROFILE SETTINGS */}
      <Col xs={24} lg={16}>
        <Card
          title="Profile Settings"
          extra={
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSave}
            >
              Save Changes
            </Button>
          }
        >
          <Form layout="vertical" form={form}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="surname"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Phone" name="phone">
                <Input />
            </Form.Item>

            <Form.Item label="Address" name="address">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ProfileDashboard;
