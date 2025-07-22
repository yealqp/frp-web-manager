import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getLogs, getConfig, FrpConfig } from '../api/frpApi';

const LogViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState<FrpConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  
  // 加载初始日志和配置信息
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    // 加载配置信息
    getConfig(id)
      .then(data => {
        setConfig(data);
      })
      .catch(error => {
        message.error('加载配置信息失败');
        console.error(error);
      });
    
    // 加载初始日志
    getLogs(id)
      .then(data => {
        setLogs(data);
      })
      .catch(error => {
        message.error('加载日志失败');
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
    
    // 建立WebSocket连接接收实时日志
    const socket = io('/', { 
      path: '/socket.io',
    });
    
    socket.on('connect', () => {
      console.log('WebSocket已连接');
    });
    
    socket.on('frp-log', (data) => {
      if (data.id === id) {
        setLogs(prev => [...prev, data.log]);
      }
    });
    
    // 清理函数
    return () => {
      socket.disconnect();
    };
  }, [id]);
  
  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);
  
  // 处理滚动事件
  const handleScroll = () => {
    if (!logContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    // 如果用户手动滚动到距离底部20px以内，启用自动滚动
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 20);
  };
  
  // 清空日志
  const handleClearLogs = () => {
    setLogs([]);
  };
  
  // 返回列表
  const handleBack = () => {
    navigate('/tunnels');
  };
  
  return (
    <div className="log-viewer">
      <Card
        title={`${config?.name || '未知'} - 日志`}
        extra={
          <>
            <Button onClick={handleClearLogs} style={{ marginRight: 8 }}>清空日志</Button>
            <Button type="primary" onClick={handleBack}>返回</Button>
          </>
        }
        style={{ width: '100%' }}
        loading={loading}
      >
        <div 
          ref={logContainerRef}
          className="log-container"
          style={{ 
            height: '70vh', 
            overflow: 'auto', 
            backgroundColor: '#1e1e1e', 
            color: '#ddd',
            padding: '10px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
          onScroll={handleScroll}
        >
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="log-line">{log}</div>
            ))
          ) : (
            <div className="no-logs">暂无日志</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LogViewer; 