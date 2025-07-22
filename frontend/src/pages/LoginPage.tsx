import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Spin, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // 如果已经登录，则重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 处理登录
  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    const success = await login(values.username, values.password);
    setLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f0f2f5',
      animation: 'fadeIn 0.4s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Row justify="center" style={{ width: '100%' }}>
        <Col xs={24} sm={16} md={12} lg={8} xl={6}>
          <Card 
            style={{ 
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              margin: '0 auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2}>FRP 管理系统</Title>
            </div>
            <Form
              name="login"
              onFinish={handleLogin}
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ width: '100%' }}
                  size="large"
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;