import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, message, Row, Col } from 'antd';
import {EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FrpConfig, getAllConfigs, deleteConfig, startFrp, stopFrp, readConfig, getNodeNameByNodeId } from '../api/frpApi';

const ConfigList: React.FC = () => {
  const [configs, setConfigs] = useState<FrpConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [detailModal, setDetailModal] = useState<{ visible: boolean; detail?: any }>({ visible: false });
  const [nodeNameLoading, setNodeNameLoading] = useState(false);

  // 加载配置列表
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await getAllConfigs();
      setConfigs(data);
    } catch (error) {
      message.error('加载配置列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
    // 每10秒刷新一次配置列表
    const interval = setInterval(() => {
      loadConfigs();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 删除配置
  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除配置 "${name}"？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteConfig(id);
          message.success('删除成功');
          loadConfigs();
        } catch (error) {
          message.error('删除失败');
          console.error(error);
        }
      }
    });
  };

  // 启动FRP
  const handleStart = async (id: string) => {
    try {
      await startFrp(id);
      message.success('启动成功');
      loadConfigs();
    } catch (error) {
      message.error('启动失败');
      console.error(error);
    }
  };

  // 停止FRP
  const handleStop = async (id: string) => {
    try {
      await stopFrp(id);
      message.success('停止成功');
      loadConfigs();
    } catch (error) {
      message.error('停止失败');
      console.error(error);
    }
  };

  // 查看日志
  const handleViewLogs = (id: string) => {
    navigate(`/logs/${id}`);
  };

  // 编辑配置
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
      setNodeNameLoading(true);
      let nodeName = '';
      if (record.nodeId) {
        try {
          nodeName = await getNodeNameByNodeId(record.nodeId);
        } catch { nodeName = ''; }
      }
      setNodeNameLoading(false);
      setDetailModal({ visible: true, detail: {
        name: record.name,
        protocolType,
        localPort,
        localIp,
        nodeName,
        addr: serverAddr && remotePort ? `${serverAddr}:${remotePort}` : '未知',
      }});
    } catch {
      setNodeNameLoading(false);
      setDetailModal({ visible: true, detail: undefined });
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '隧道ID',
      dataIndex: 'tunnelId',
      key: 'tunnelId',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = '未知';
        
        switch (status) {
          case 'running':
            color = 'success';
            text = '运行中';
            break;
          case 'stopped':
            color = 'default';
            text = '已停止';
            break;
          case 'error':
            color = 'error';
            text = '错误';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FrpConfig) => (
        <Space size="middle">
          {record.status === 'running' ? (
            <Button 
              type="primary" 
              danger 
              icon={<PauseCircleOutlined />} 
              onClick={() => handleStop(record.id)}
            >
              停止
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleStart(record.id)}
            >
              启动
            </Button>
          )}
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewLogs(record.id)}
          >
            日志
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.id)}
            disabled={record.status === 'running'}
          >
            编辑
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleShowDetail(record)}
          >
            详情
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id, record.name)}
            disabled={record.status === 'running'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="config-list">
      <Table 
        columns={columns} 
        dataSource={configs} 
        rowKey="id" 
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
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
            <div><b>节点名称：</b>{nodeNameLoading ? '加载中...' : detailModal.detail.nodeName || '未知'}</div>
            <div><b>连接地址：</b>{detailModal.detail.addr}</div>
          </div>
        ) : (
          <div>解析失败</div>
        )}
      </Modal>
    </div>
  );
};

export default ConfigList; 