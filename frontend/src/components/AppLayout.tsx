import React from 'react';
import { Layout, Typography, Menu, Dropdown, Button, Avatar } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DownOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiBaseUrl } from '../utils/apiConfig';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // 获取当前API基础URL，用于在页面底部显示
  const apiBaseUrl = getApiBaseUrl();
  
  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const userMenu = (
    <Menu onClick={({ key }) => handleMenuClick(key as string)}>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        系统设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <Title 
          level={3} 
          style={{ 
            margin: '16px 0',
            cursor: 'pointer' 
          }}
          onClick={() => navigate('/')}
        >
          FRP 管理系统
        </Title>
        
        <div>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button type="link">
              <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              {user?.username}
              <DownOutlined style={{ fontSize: '12px', marginLeft: '5px' }} />
            </Button>
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ padding: '20px 50px' }}>
        <Outlet />
      </Content>
      
      <Footer style={{ 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        padding: '16px'
      }}>
        <div>FRP 管理系统 ©{new Date().getFullYear()} yealqp 版权所有</div>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          连接至: {apiBaseUrl}
        </Text>
      </Footer>
    </Layout>
  );
};

export default AppLayout; 