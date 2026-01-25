import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Card, Typography } from "antd";
import { adminLogin } from "../../../api/apiCall";
import { useAuth } from "../../../auth/auth";
import { setUser } from "../../../auth/actions";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const LoginPageAdmin = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const response = await adminLogin({
      email: values.email,
      password: values.password,
    });

    if (response?.data?.success) {
      dispatch(
        setUser({
          id: response.data.payload.user.id,
          name: response.data.payload.user.first_name,
          surname: response.data.payload.user.last_name,
          email: response.data.payload.user.email,
          role: response.data.payload.user.role,
          phone: response.data.payload.user.phone,
          address: response.data.payload.user.address,
          token: response.data.payload.token,
        })
      );
      navigate("/dashboard");
    } else {
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          marginTop: "-40px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f0f5ff, #e6f4ff)",
          padding: 16,
        }}
      >
        <Card
          style={{
            width: 420,
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 4 }}>
              Welcome back
            </Title>
            <Text type="secondary">Sign in to continue to your dashboard</Text>
          </div>

          <Form
            name="login_form"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="you@example.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="••••••••"
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Text type="secondary">
                <a href="/register">Forgot password?</a>
              </Text>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  backgroundColor: "#1677ff",
                  border: "none",
                }}
              >
                Sign in
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Text type="secondary">
                Don’t have an account? <a href="/register">Create one</a>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default LoginPageAdmin;
