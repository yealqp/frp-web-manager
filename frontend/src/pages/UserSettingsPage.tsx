import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Divider, 
  Typography, 
  Space,
  Tabs,
  Row,
  Col
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserInfo } from '../api/authApi';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const UserSettingsPage: React.FC = () => {
  const [usernameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const onUpdateUsername = async (values: { newUsername: string }) => {
    setLoading(true);
    try {
      await updateUserInfo({ newUsername: values.newUsername });
      message.success('用户名已成功更新');
      refreshUser(); // 刷新用户信息
      usernameForm.resetFields();
    } catch (error) {
      message.error('更新用户名失败');
      console.error('更新用户名错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async (values: { currentPassword: string, newPassword: string }) => {
    setLoading(true);
    try {
      await updateUserInfo({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      message.success('密码已成功更新');
      passwordForm.resetFields();
    } catch (error) {
      message.error('更新密码失败');
      console.error('更新密码错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} md={20} lg={16}>
          <Card>
            <Title level={2}>用户设置</Title>
            <Paragraph>您可以在此更新您的用户信息。</Paragraph>
            <Divider />
            <Tabs defaultActiveKey="username">
              <TabPane 
                tab={<span><UserOutlined />修改用户名</span>} 
                key="username"
              >
                <Form
                  form={usernameForm}
                  layout="vertical"
                  onFinish={onUpdateUsername}
                >
                  <Form.Item label="当前用户名">
                    <Input disabled value={user?.username} />
                  </Form.Item>
                  <Form.Item
                    name="newUsername"
                    label="新用户名"
                    rules={[
                      { required: true, message: '请输入新用户名' },
                      { min: 3, message: '用户名长度不能少于3个字符' }
                    ]}
                  >
                    <Input placeholder="输入新用户名" />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      loading={loading}
                      style={{ width: '100%' }}
                    >
                      保存用户名
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              <TabPane 
                tab={<span><LockOutlined />修改密码</span>} 
                key="password"
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={onUpdatePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="当前密码"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password placeholder="输入当前密码" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码长度不能少于6个字符' }
                    ]}
                  >
                    <Input.Password placeholder="输入新密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请确认新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不匹配'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="再次输入新密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<LockOutlined />}
                      loading={loading}
                      style={{ width: '100%' }}
                    >
                      更新密码
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserSettingsPage; 