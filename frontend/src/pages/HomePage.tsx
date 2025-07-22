import React, { Suspense, useEffect, useState } from 'react';
import { Spin, Card, Descriptions, message, Row, Col } from 'antd';
import ConfigList from '../components/ConfigList';
import PageTransition from '../components/PageTransition';
import { getCurrentUser, User, getNotice } from '../api/authApi';
import ReactMarkdown from 'react-markdown';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => message.error('获取用户信息失败')).finally(() => setLoading(false));
    getNotice().then(setNotice).catch(() => setNotice(''));
  }, []);
  return (
    <PageTransition>
      <Row gutter={[24, 24]} className="home-page-responsive">
        <Col xs={24} md={12}>
          {user && (
            <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 16, textAlign: 'left' }}>
              欢迎回来, {user.username}
      </div>
          )}
          <Card style={{ marginBottom: 24, width: '100%' }} loading={loading}>
            {user && (
              <Descriptions title="用户信息" column={1}>
                {user.userId && <Descriptions.Item label="用户ID">{user.userId}</Descriptions.Item>}
                <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                <Descriptions.Item label="权限">{user.role}</Descriptions.Item>
                {user.createdAt && <Descriptions.Item label="注册时间">{new Date(user.createdAt).toLocaleString()}</Descriptions.Item>}
                <Descriptions.Item label="隧道用量">{user.tunnels ? `${user.tunnels.length}/${user.tunnelLimit ?? 50}` : `0/${user.tunnelLimit ?? 50}`}</Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ height: 48 }} />
          <Card title="系统公告" bordered={false} style={{ width: '100%' }}>
            <ReactMarkdown>{notice || '暂无公告'}</ReactMarkdown>
          </Card>
        </Col>
      </Row>
    </PageTransition>
  );
};

export default HomePage; 