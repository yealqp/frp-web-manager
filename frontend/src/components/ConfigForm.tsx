import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, Skeleton, Spin, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { editConfig, readConfigFile, getConfig, createConfig, getServerList, ServerInfo, getAllConfigs, getFreePortByNodeId } from '../api/frpApi';
import axios from 'axios';

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
  
  // 校验本地IP是否合法
  const validateLocalIp = (ip: string): string | null => {
    if (!ip) return '请输入本机内网IP';
    if (!/^10\.0\.0\.[0-9]{1,3}$/.test(ip)) {
      return '只允许填写10.0.0.x网段的地址';
    }
    if (ip === '10.0.0.2') {
      return '10.0.0.2 不允许使用';
    }
    return null;
  };

  // 保存配置时组装为新格式
  const handleSave = async () => {
    const ipError = validateLocalIp(localIp);
    if (ipError) {
      message.error(ipError);
      return;
    }
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
    <div className="config-form smooth-content" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, maxWidth: 700, margin: '32px auto', border: '1px solid #f0f0f0' }}>
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>{mode === 'create' ? '新建隧道' : `${configName || '未知'} - 隧道编辑`}</span>}
        extra={
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12}>
              <Button 
                onClick={handleSave} 
                type="primary" 
                loading={loading} 
                style={{ width: '100%', fontWeight: 600, fontSize: 16, borderRadius: 6, boxShadow: '0 2px 8px rgba(24,144,255,0.08)' }}
              >
                {mode === 'create' ? '创建' : '保存'}
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button 
                onClick={handleBack}
                style={{ width: '100%', fontWeight: 600, fontSize: 16, borderRadius: 6 }}
              >
                返回
              </Button>
            </Col>
          </Row>
        }
        style={{ width: '100%', maxWidth: 700, margin: '0 auto', background: 'transparent', boxShadow: 'none', border: 'none' }}
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
              <div style={{ marginBottom: 16, animation: 'fadeIn 0.5s cubic-bezier(0.23, 1, 0.32, 1)' }}>
                <Form layout="vertical">
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>名称 <span style={{ color: '#ff4d4f' }}>*</span></span>} style={{ marginBottom: 16 }}>
                        <Input 
                          placeholder="请输入隧道名称" 
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                          style={{ width: '100%', borderRadius: 6, fontSize: 15 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
            <div className="config-content-area" style={{ minHeight: 400 }}>
              {loading && (
                <div className="loading-overlay">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'scale(1.1)', transition: 'transform 0.3s var(--ease-smooth)' }}>
                    <Spin size="large" tip={`加载模板...`} />
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                      请稍候...
                    </div>
                  </div>
                </div>
              )}
              <Form layout="vertical">
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span style={{ fontWeight: 600 }}>服务器 <span style={{ color: '#ff4d4f' }}>*</span></span>} required>
                      <Select
                        value={selectedServer ? selectedServer.name : undefined}
                        onChange={name => {
                          const s = serverList.find(item => item.name === name);
                          setSelectedServer(s || null);
                        }}
                        placeholder="请选择服务器"
                        disabled={loading}
                        style={{ width: '100%', borderRadius: 6, fontSize: 15 }}
                        dropdownStyle={{ borderRadius: 8 }}
                      >
                        {serverList.map(s => (
                          <Select.Option key={s.name} value={s.name}>{s.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} />
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span style={{ fontWeight: 600 }}>机器内网IP <span style={{ color: '#ff4d4f' }}>*</span></span>} required
                      validateStatus={validateLocalIp(localIp) ? 'error' : ''}
                      help={validateLocalIp(localIp) || <span style={{ color: '#888', fontSize: 12 }}>请填写本机内网IP（10.0.0.x win+r输入cmd，输入ipconfig，找到以10.0.0开头的地址）</span>}
                    >
                      <Input value={localIp} onChange={e => setLocalIp(e.target.value)} disabled={loading} style={{ width: '100%', borderRadius: 6, fontSize: 15 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span style={{ fontWeight: 600 }}>本地端口 <span style={{ color: '#ff4d4f' }}>*</span></span>} required>
                      <Input value={localPort} onChange={e => setLocalPort(e.target.value)} disabled={loading} style={{ width: '100%', borderRadius: 6, fontSize: 15 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span style={{ fontWeight: 600 }}>远程端口 <span style={{ color: '#ff4d4f' }}>*</span></span>} required>
                      <Input.Group compact>
                        <Input
                          value={remotePort}
                          onChange={e => setRemotePort(e.target.value)}
                          disabled={loading}
                          style={{ width: '70%', borderRadius: '6px 0 0 6px', fontSize: 15 }}
                        />
                        <Button
                          onClick={async () => {
                            if (!selectedServer || !selectedServer.nodeId) throw new Error('未选择服务器');
                            setLoading(true);
                            try {
                              const port = await getFreePortByNodeId(selectedServer.nodeId);
                              if (port) {
                                setRemotePort(String(port));
                                message.success(`已自动填充空闲端口：${port}`);
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
                          style={{ width: '30%', borderRadius: '0 6px 6px 0', fontWeight: 600, fontSize: 13 }}
                        >
                          获取空闲端口
                        </Button>
                      </Input.Group>
                      {selectedServer && Array.isArray(selectedServer.allowed_ports) && (
                        <div style={{ marginTop: 4, color: '#888', fontSize: 12 }}>
                          该节点允许远程端口范围：{selectedServer.allowed_ports[0]} - {selectedServer.allowed_ports[1]}
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span style={{ fontWeight: 600 }}>协议类型 <span style={{ color: '#ff4d4f' }}>*</span></span>} required>
                      <Select value={protocolType} onChange={v => setProtocolType(v)} disabled={loading} style={{ width: '100%', borderRadius: 6, fontSize: 15 }} dropdownStyle={{ borderRadius: 8 }}>
                        <Select.Option value="tcp">tcp</Select.Option>
                        <Select.Option value="udp">udp</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ConfigForm; 