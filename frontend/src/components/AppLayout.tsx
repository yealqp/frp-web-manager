import React from 'react';
import { Layout, Typography, Menu, Dropdown, Button, Avatar } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DownOutlined, 
  SettingOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  HomeOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { MenuProps } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'settings') {
      navigate('/settings');
    } else if (key === 'user-settings') {
      navigate('/user-settings');
    } else if (key === 'user-management') {
      navigate('/user-management');
    }
  };

  // antd v4.24+ 推荐用 menu={{ items }}
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  // 左侧侧栏菜单项
  const sideMenuItems: MenuProps['items'] = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/tunnels', icon: <FileTextOutlined />, label: '隧道列表' },
    { key: '/create', icon: <PlusOutlined />, label: '新建隧道' },
    { key: '/user-settings', icon: <UserSwitchOutlined />, label: '用户设置' },

    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <TeamOutlined />,
      label: '管理功能',
      children: [
        { key: '/user-management', icon: <TeamOutlined />, label: '用户管理' },
        { key: '/admin-tunnels', icon: <FileTextOutlined />, label: '隧道管理' },
        { key: '/admin-notice', icon: <FileTextOutlined />, label: '公告管理' },
        { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
      ]
    }] : []),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Title 
          level={3} 
          style={{ 
            margin: '16px 0',
            cursor: 'pointer',
            fontSize: '1.2rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
          onClick={() => navigate('/')}
        >
          CNOC External Gateway System  橘子云对外网关系统（用户端）
        </Title>
        <div>
          <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => handleMenuClick(key as string) }} trigger={['click']}>
            <Button type="link">
              <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              {user?.username}
              <DownOutlined style={{ fontSize: '12px', marginLeft: '5px' }} />
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          style={{ background: '#fff', minHeight: 'calc(100vh - 64px)' }}
          breakpoint="md"
          collapsedWidth={48}
          zeroWidthTriggerStyle={{ top: 70 }}
        >
          <Menu
            mode="inline"
            style={{ height: '100%', borderRight: 0 }}
            items={sideMenuItems}
            onClick={({ key }) => navigate(key)}
            selectedKeys={[location.pathname]}
          />
        </Sider>
        <Content style={{ padding: '20px 8px', minHeight: 0 }}>
        <Outlet />
      </Content>
      </Layout>
      <Footer style={{ 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        padding: '16px',
        fontSize: '0.95em',
        wordBreak: 'break-all'
      }}>
        <div>CNOC External Gateway System©{new Date().getFullYear()} CNOC 版权所有</div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;