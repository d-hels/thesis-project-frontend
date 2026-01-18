import { useState } from "react";
import { Input, Button, message, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { adminGate } from "../../../api/apiCall";

const { Title, Text } = Typography;

const ADMIN_GATE_PASSWORD = "super-secret-123";
const GATE_TIMEOUT = 5   * 60 * 1000;

export default function AdminGate() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (password === ADMIN_GATE_PASSWORD) {
      const res = await adminGate({ password });

      sessionStorage.setItem("admin_gate_token", res?.data.gateToken);

      setTimeout(() => {
        sessionStorage.removeItem("admin_gate_token");
        // window.location.href = "/admin";
      }, GATE_TIMEOUT);

      navigate("/admin/login");
    } else {
      message.error("Wrong password");
    }
  };

  return (
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
        <Title level={4} style={{ marginBottom: 8 }}>
          Admin Access
        </Title>
        <Text type="secondary">Enter the admin password to continue</Text>

        <Input.Password
          style={{ marginTop: 16 }}
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleSubmit}
        />

        <Button
          type="primary"
          block
          style={{ marginTop: 16 }}
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </Card>
    </div>
  );
}
