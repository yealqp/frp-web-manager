import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Modal, Row, Col } from 'antd';
import { getAllConfigs } from '../api/frpApi';
import { getAllUsers } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import { readConfig, getNodeNameByNodeId, deleteConfig } from '../api/frpApi';
import { Modal as AntdModal } from 'antd';

interface Tunnel {
  id: string;
  tunnelId: number;
  name: string;
  ownerId?: string;
}

const AdminTunnelPage: React.FC = () => {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState<Record<number, { username: string; userId: number }>>({});
  const [detailModal, setDetailModal] = useState<{ visible: boolean; detail?: any; nodeNameLoading?: boolean }>({ visible: false });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllConfigs(),
      getAllUsers()
    ]).then(([configs, users]) => {
      // 构建tunnelId到owner信息的映射
      const tunnelOwnerMap: Record<number, { username: string; userId: number }> = {};
      users.forEach(u => {
        u.tunnels?.forEach(t => {
          tunnelOwnerMap[t.tunnelId] = { username: u.username, userId: u.userId! };
        });
      });
      setUserMap(tunnelOwnerMap);
      setTunnels(configs.map((c: any) => ({ ...c, owner: tunnelOwnerMap[c.tunnelId] })));
    }).catch(() => message.error('加载数据失败')).finally(() => setLoading(false));
  }, []);

  // 编辑按钮
  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  // 详情弹窗
  const handleShowDetail = async (record: any) => {
    try {
      const content = await readConfig(record.id);
      const serverAddr = content.match(/serverAddr\s*=\s*"([^"]+)"/)?.[1] || '';
      const remotePort = content.match(/remotePort\s*=\s*"?([0-9]+)"?/)?.[1] || '';
      const protocolType = content.match(/type\s*=\s*"(\w+)"/)?.[1] || '';
      const localPort = content.match(/localPort\s*=\s*"?([0-9]+)"?/)?.[1] || '';
      const localIp = content.match(/localIP\s*=\s*"([^"]+)"/)?.[1] || '';
      setDetailModal({ visible: true, nodeNameLoading: true });
      let nodeName = '';
      if (record.nodeId) {
        try {
          nodeName = await getNodeNameByNodeId(record.nodeId);
        } catch { nodeName = ''; }
      }
      setDetailModal({ visible: true, nodeNameLoading: false, detail: {
        name: record.name,
        protocolType,
        localPort,
        localIp,
        nodeName,
        addr: serverAddr && remotePort ? `${serverAddr}:${remotePort}` : '未知',
      }});
    } catch {
      setDetailModal({ visible: true, nodeNameLoading: false, detail: undefined });
    }
  };

  // 删除按钮
  const handleDelete = (id: string, name: string) => {
    AntdModal.confirm({
      title: '确认删除',
      content: `确认删除配置 "${name}"？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteConfig(id);
          message.success('删除成功');
          // 重新加载数据
          setLoading(true);
          Promise.all([
            getAllConfigs(),
            getAllUsers()
          ]).then(([configs, users]) => {
            const tunnelOwnerMap: Record<number, { username: string; userId: number }> = {};
            users.forEach(u => {
              u.tunnels?.forEach(t => {
                tunnelOwnerMap[t.tunnelId] = { username: u.username, userId: u.userId! };
              });
            });
            setUserMap(tunnelOwnerMap);
            setTunnels(configs.map((c: any) => ({ ...c, owner: tunnelOwnerMap[c.tunnelId] })));
          }).catch(() => message.error('加载数据失败')).finally(() => setLoading(false));
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const columns = [
    { title: '隧道ID', dataIndex: 'tunnelId', key: 'tunnelId' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '所有者', dataIndex: 'owner', key: 'owner', render: (owner: any) => owner ? `${owner.username}（${owner.userId}）` : <Tag>未知</Tag> },
    { title: '操作', key: 'action', render: (_: any, record: any) => (
      <span>
        <Button size="small" style={{ marginRight: 8 }} onClick={() => handleEdit(record.id)}>编辑</Button>
        <Button size="small" style={{ marginRight: 8 }} onClick={() => handleShowDetail(record)}>信息</Button>
        <Button size="small" danger onClick={() => handleDelete(record.id, record.name)}>删除</Button>
      </span>
    ) },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <h2>管理员隧道管理</h2>
        </Col>
      </Row>
      <Table columns={columns} dataSource={tunnels} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} />
      <Modal
        title="隧道详情"
        visible={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false })}
        footer={null}
        width={400}
        bodyStyle={{ padding: 24 }}
      >
        {detailModal.detail ? (
          <div style={{ lineHeight: 2 }}>
            <div><b>隧道名称：</b>{detailModal.detail.name}</div>
            <div><b>协议类型：</b>{detailModal.detail.protocolType}</div>
            <div><b>本地端口：</b>{detailModal.detail.localPort}</div>
            <div><b>本地地址：</b>{detailModal.detail.localIp}</div>
            <div><b>节点名称：</b>{detailModal.nodeNameLoading ? '加载中...' : detailModal.detail.nodeName || '未知'}</div>
            <div><b>连接地址：</b>{detailModal.detail.addr}</div>
          </div>
        ) : (
          <div>解析失败</div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTunnelPage; 