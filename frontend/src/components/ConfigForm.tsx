import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, Skeleton, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { editConfig, readConfigFile, getConfig, createConfig, getServerList, ServerInfo, getAllConfigs } from '../api/frpApi';

const { Option } = Select;
const { TextArea } = Input;

interface ConfigFormProps {
  mode: 'create' | 'edit';
}

const ConfigForm: React.FC<ConfigFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [configName, setConfigName] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  // 新增：表单字段状态
  const [serverAddr, setServerAddr] = useState('127.0.0.1');
  const [serverPort, setServerPort] = useState('7000');
  const [tokenValue, setTokenValue] = useState('12345678');
  const [localIp, setLocalIp] = useState('127.0.0.1');
  const [localPort, setLocalPort] = useState('22');
  const [remotePort, setRemotePort] = useState('6000');
  const [protocolType, setProtocolType] = useState<'tcp' | 'udp' >('tcp');
  const [serverList, setServerList] = useState<ServerInfo[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null);

  // 删除configType、content、setContent、getTemplateConfig等所有相关状态和逻辑
  // 如果是编辑模式，加载配置内容和配置名称
  useEffect(() => {
    if (mode === 'edit' && id) {
      setInitialLoading(true);
      // 加载配置信息
      Promise.all([
        getConfig(id)
          .then(data => {
            setConfigName(data.name);
          })
          .catch(error => {
            message.error('加载配置信息失败');
            console.error(error);
          }),
        // 加载配置内容
        loadConfigContent(id)
      ]).finally(() => {
        setInitialLoading(false);
      });
    } else if (mode === 'create') {
      setConfigName('');
      setServerAddr('');
      setServerPort('');
      setTokenValue('');
      setLocalIp('');
      setLocalPort('');
      setRemotePort('');
      setProtocolType('tcp');
      setSelectedServer(null);
      setInitialLoading(false);
    }
  }, [mode, id]);
  
  // 加载服务器列表
  useEffect(() => {
    getServerList().then(list => setServerList(list)).catch(() => setServerList([]));
  }, []);

  // 选择服务器后自动填充
  useEffect(() => {
    if (selectedServer) {
      setServerAddr(selectedServer.server_addr);
      setServerPort(String(selectedServer.server_port));
      setTokenValue(selectedServer.token);
    }
  }, [selectedServer]);
  
  // 加载配置内容
  const loadConfigContent = async (configId: string) => {
    try {
      const data = await readConfigFile(configId);
      setContent(data);
      // 解析配置内容，填充表单字段
      setServerAddr(data.match(/serverAddr\s*=\s*"([^"]+)"/)?.[1] || '');
      setServerPort(data.match(/serverPort\s*=\s*"?([0-9]+)"?/)?.[1] || '');
      setTokenValue(data.match(/token\s*=\s*'([^']+)'/)?.[1] || '');
      setLocalIp(data.match(/localIP\s*=\s*"([^"]+)"/)?.[1] || '');
      setLocalPort(data.match(/localPort\s*=\s*"?([0-9]+)"?/)?.[1] || '');
      setRemotePort(data.match(/remotePort\s*=\s*"?([0-9]+)"?/)?.[1] || '');
      setProtocolType(data.match(/type\s*=\s*"(\w+)"/)?.[1] as any || 'tcp');
      return data;
    } catch (error) {
      message.error('加载配置内容失败');
      console.error(error);
      throw error;
    }
  };

  // 删除handleTypeChange相关内容
  
  // 保存配置时组装为新格式
  const handleSave = async () => {
    const toml = `serverAddr = "${serverAddr}"
serverPort = ${serverPort}

[auth]
method = 'token'
token = '${tokenValue}'

[[proxies]]
name = "${configName}"
type = "${protocolType}"
localIP = "${localIp}"
localPort = ${localPort}
remotePort = ${remotePort}
`;
    if (mode === 'edit' && id) {
      setLoading(true);
      try {
        await editConfig(id, toml);
        message.success('保存成功');
      } catch (error) {
        message.error('保存失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else if (mode === 'create') {
      if (!configName) {
        message.error('请输入隧道名称');
        return;
      }
      setLoading(true);
      try {
        await createConfig(configName, 'frpc', toml, selectedServer?.nodeId);
        message.success('创建成功');
        navigate('/tunnels');
      } catch (error) {
        message.error('创建失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 返回列表
  const handleBack = () => {
    navigate('/tunnels');
  };
  
  return (
    <div className="config-form smooth-content">
      <Card
        title={mode === 'create' ? '新建隧道' : `${configName || '未知'} - 隧道编辑`}
        extra={
          <>
            <Button 
              onClick={handleSave} 
              type="primary" 
              loading={loading} 
              style={{ 
                marginRight: 8,
                transition: 'all 0.3s var(--ease-smooth)',
                transform: loading ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {mode === 'create' ? '创建' : '保存'}
            </Button>
            <Button 
              onClick={handleBack}
              style={{ 
                transition: 'all 0.3s var(--ease-smooth)'
              }}
            >
              返回
            </Button>
          </>
        }
        style={{ 
          width: '100%',
          transition: 'all 0.5s var(--ease-smooth)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '4px'
        }}
      >
        {initialLoading ? (
          <div style={{ animation: 'fadeIn 0.5s cubic-bezier(0.23, 1, 0.32, 1)' }}>
            {mode === 'create' && (
              <Skeleton.Input active style={{ width: 300, marginBottom: 16 }} />
            )}
            <Skeleton.Input active style={{ width: '100%', height: 400 }} />
          </div>
        ) : (
          <>
            {mode === 'create' && (
              <div style={{ 
                marginBottom: 16,
                animation: 'fadeIn 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
              }}>
                <Form layout="inline">
                  <Form.Item label="名称" style={{ marginBottom: 16 }}>
                    <Input 
                      placeholder="请输入隧道名称" 
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      style={{ 
                        width: 200,
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                      }}
                    />
                  </Form.Item>
                </Form>
              </div>
            )}
            <div className="config-content-area" style={{ minHeight: 400 }}>
              {loading && (
                <div className="loading-overlay">
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: 'scale(1.1)',
                    transition: 'transform 0.3s var(--ease-smooth)'
                  }}>
                    <Spin size="large" tip={`加载模板...`} />
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                      请稍候...
                    </div>
                  </div>
                </div>
              )}
              <div style={{ 
                transition: 'all 0.5s var(--ease-smooth)', 
                opacity: loading ? 0.5 : 1,
                filter: loading ? 'blur(1.5px)' : 'none',
                transform: loading ? 'scale(0.99)' : 'scale(1)'
              }}>
                <Form layout="vertical">
                  <Form.Item label="服务器" required>
                    <Select
                      value={selectedServer ? selectedServer.name : undefined}
                      onChange={name => {
                        const s = serverList.find(item => item.name === name);
                        setSelectedServer(s || null);
                      }}
                      placeholder="请选择服务器"
                      disabled={loading}
                      style={{ width: 240 }}
                    >
                      {serverList.map(s => (
                        <Select.Option key={s.name} value={s.name}>{s.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {selectedServer && selectedServer.allowed_ports && (
                    <div style={{ marginBottom: 16, color: '#888' }}>
                      该机器允许远程端口范围：{selectedServer.allowed_ports[0]} - {selectedServer.allowed_ports[1]}
                    </div>
                  )}
                  <Form.Item label="机器内网IP" required>
                    <Input value={localIp} onChange={e => setLocalIp(e.target.value)} disabled={loading} />
                  </Form.Item>
                  <Form.Item label="本地端口" required>
                    <Input value={localPort} onChange={e => setLocalPort(e.target.value)} disabled={loading} />
                  </Form.Item>
                  <Form.Item label="远程端口" required>
                    <Input
                      value={remotePort}
                      onChange={e => setRemotePort(e.target.value)}
                      disabled={loading}
                      style={{ width: 180, marginRight: 8 }}
                    />
                    <Button
                      onClick={async () => {
                        if (!selectedServer || !selectedServer.allowed_ports) {
                          message.warning('请先选择服务器');
                          return;
                        }
                        setLoading(true);
                        try {
                          const configs = await getAllConfigs();
                          // 只筛选当前服务器下的隧道，编辑模式下排除自己
                          const usedPorts = new Set(
                            configs
                              .filter(cfg => cfg.nodeId === selectedServer.nodeId && (!id || cfg.id !== id))
                              .map(cfg => Number(cfg.remotePort))
                              .filter(p => Number.isInteger(p) && p > 0)
                          );
                          const [start, end] = selectedServer.allowed_ports;
                          let found = null;
                          for (let p = start; p <= end; p++) {
                            if (!usedPorts.has(p)) {
                              found = p;
                              break;
                            }
                          }
                          if (found) {
                            setRemotePort(String(found));
                            message.success(`已自动填充空闲端口：${found}`);
                          } else {
                            message.error('没有可用的空闲端口');
                          }
                        } catch (e) {
                          message.error('获取端口信息失败');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      获取空闲端口
                    </Button>
                  </Form.Item>
                  <Form.Item label="协议类型" required>
                    <Select value={protocolType} onChange={v => setProtocolType(v)} disabled={loading} style={{ width: 120 }}>
                      <Select.Option value="tcp">tcp</Select.Option>
                      <Select.Option value="udp">udp</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ConfigForm; 