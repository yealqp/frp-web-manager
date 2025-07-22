import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message } from 'antd';
import { getAllConfigs } from '../api/frpApi';
import { getAllUsers } from '../api/userApi';

interface Tunnel {
  id: string;
  tunnelId: number;
  name: string;
  ownerId?: string;
}

const AdminTunnelPage: React.FC = () => {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllConfigs(),
      getAllUsers()
    ]).then(([configs, users]) => {
      // 构建tunnelId到ownerId的映射
      const tunnelOwnerMap: Record<number, string> = {};
      users.forEach(u => {
        u.tunnels?.forEach(t => {
          tunnelOwnerMap[t.tunnelId] = String(u.userId);
        });
      });
      setUserMap(tunnelOwnerMap);
      setTunnels(configs.map((c: any) => ({ ...c, ownerId: tunnelOwnerMap[c.tunnelId] })));
    }).catch(() => message.error('加载数据失败')).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '隧道ID', dataIndex: 'tunnelId', key: 'tunnelId' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '所有者ID', dataIndex: 'ownerId', key: 'ownerId', render: (id: string) => id || <Tag>未知</Tag> },
    // 可扩展更多权限操作按钮
    { title: '操作', key: 'action', render: (_: any, record: Tunnel) => (
      <span>
        <Button size="small" style={{ marginRight: 8 }}>编辑</Button>
        <Button size="small" danger>删除</Button>
      </span>
    ) },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>管理员隧道管理</h2>
      <Table columns={columns} dataSource={tunnels} rowKey="id" loading={loading} />
    </div>
  );
};

export default AdminTunnelPage; 