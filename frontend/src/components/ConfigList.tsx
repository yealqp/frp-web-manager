import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FrpConfig, getAllConfigs, deleteConfig, startFrp, stopFrp } from '../api/frpApi';

const ConfigList: React.FC = () => {
  const [configs, setConfigs] = useState<FrpConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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

  // 新建配置
  const handleCreate = () => {
    navigate('/create');
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        type === 'frpc' ? <Tag color="blue">frpc</Tag> : <Tag color="green">frps</Tag>
      ),
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
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          新建配置
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={configs} 
        rowKey="id" 
        loading={loading}
      />
    </div>
  );
};

export default ConfigList; 