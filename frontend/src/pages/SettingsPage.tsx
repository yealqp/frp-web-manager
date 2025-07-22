import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Divider, 
  Typography, 
  Switch, 
  Space,
  Row,
  Col
} from 'antd';
import { getApiBaseUrl, setCustomApiBaseUrl, resetApiBaseUrl } from '../utils/apiConfig';
import { ArrowLeftOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查是否已有自定义API URL
    const storedUrl = localStorage.getItem('api_base_url');
    if (storedUrl) {
      setUseCustomUrl(true);
      form.setFieldsValue({ apiUrl: storedUrl });
    } else {
      form.setFieldsValue({ apiUrl: getApiBaseUrl() });
    }
  }, [form]);

  const onFinish = (values: { apiUrl: string }) => {
    if (useCustomUrl) {
      try {
        // 简单验证URL格式
        new URL(values.apiUrl);
        setCustomApiBaseUrl(values.apiUrl);
        message.success('API地址设置已保存，正在刷新...');
      } catch (e) {
        message.error('请输入有效的URL地址');
      }
    } else {
      resetApiBaseUrl();
      message.success('已重置为默认API地址，正在刷新...');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} md={20} lg={16}>
          <Card>
            <Title level={2}>系统设置</Title>
            <Divider />
            
            <Title level={4}>后端连接设置</Title>
            <Paragraph>
              当前API地址: <strong>{getApiBaseUrl()}</strong>
            </Paragraph>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item label="使用自定义API地址" name="useCustomUrl">
                <Switch 
                  checked={useCustomUrl} 
                  onChange={(checked) => setUseCustomUrl(checked)} 
                />
              </Form.Item>
              
              {useCustomUrl && (
                <Form.Item 
                  label="API地址" 
                  name="apiUrl" 
                  rules={[{ required: true, message: '请输入API地址' }]}
                  extra="例如: http://192.168.1.100:3001"
                >
                  <Input placeholder="输入完整的后端API地址" />
                </Form.Item>
              )}
              
              <Form.Item>
                <Space style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    style={{ width: '100%' }}
                  >
                    保存设置
                  </Button>
                  
                  {useCustomUrl && (
                    <Button 
                      danger 
                      icon={<UndoOutlined />} 
                      onClick={() => resetApiBaseUrl()}
                      style={{ width: '100%' }}
                    >
                      重置为默认
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage; 