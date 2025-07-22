import React, { Suspense, useEffect, useState } from 'react';
import { Spin, Card, Descriptions, message } from 'antd';
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
      <div className="home-page page-enter" style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {user && (
            <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 16, textAlign: 'left' }}>
              欢迎回来, {user.username}
            </div>
          )}
          <Card style={{ marginBottom: 24, width: '100%', flex: 1 }} loading={loading}>
            {user && (
              <Descriptions title="用户信息" column={2}>
                {user.userId && <Descriptions.Item label="用户ID">{user.userId}</Descriptions.Item>}
                <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                <Descriptions.Item label="权限">{user.role}</Descriptions.Item>
                {user.createdAt && <Descriptions.Item label="注册时间">{new Date(user.createdAt).toLocaleString()}</Descriptions.Item>}
                <Descriptions.Item label="隧道用量">{user.tunnels ? `${user.tunnels.length}/${user.tunnelLimit ?? 50}` : `0/${user.tunnelLimit ?? 50}`}</Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 48 }} />
          <Card title="系统公告" bordered={false} style={{ height: '100%', width: '100%', flex: 1 }}>
            <ReactMarkdown>{notice || '暂无公告'}</ReactMarkdown>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage; 