import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, Skeleton, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { editConfig, readConfigFile, getConfig, createConfig, getTemplateConfig } from '../api/frpApi';

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
  const [configType, setConfigType] = useState<'frpc' | 'frps'>('frpc');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // 如果是创建模式，加载模板配置
    if (mode === 'create') {
      setInitialLoading(true);
      getTemplateConfig('frpc')
        .then(template => {
          setContent(template);
        })
        .catch(error => {
          message.error('加载模板配置失败');
          console.error(error);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
    // 如果是编辑模式，加载配置内容和配置名称
    else if (mode === 'edit' && id) {
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
    }
  }, [mode, id]);
  
  // 加载配置内容
  const loadConfigContent = async (configId: string) => {
    try {
      const data = await readConfigFile(configId);
      setContent(data);
      return data;
    } catch (error) {
      message.error('加载配置内容失败');
      console.error(error);
      throw error;
    }
  };

  // 处理类型变更
  const handleTypeChange = (value: 'frpc' | 'frps') => {
    if (value === configType) return; // 避免重复加载
    
    setConfigType(value);
    setLoading(true);
    
    // 不立即更改内容，只设置加载状态
    // 然后异步加载模板
    getTemplateConfig(value)
      .then(template => {
        setContent(template);
      })
      .catch(error => {
        message.error('加载模板配置失败');
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // 保存配置
  const handleSave = async () => {
    if (mode === 'edit' && id) {
      setLoading(true);
      try {
        await editConfig(id, content);
        message.success('保存成功');
      } catch (error) {
        message.error('保存失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else if (mode === 'create') {
      if (!configName) {
        message.error('请输入配置名称');
        return;
      }
      setLoading(true);
      try {
        await createConfig(configName, configType, content);
        message.success('创建成功');
        navigate('/');
      } catch (error) {
        message.error('创建失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 处理文本区域内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  // 返回列表
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <div className="config-form smooth-content">
      <Card
        title={mode === 'create' ? '新建配置' : `${configName || '未知'} - 配置编辑`}
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
                      placeholder="请输入配置名称" 
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      style={{ 
                        width: 200,
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="类型" style={{ marginBottom: 16 }}>
                    <Select 
                      value={configType}
                      onChange={handleTypeChange}
                      style={{ 
                        width: 120,
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                      }}
                      disabled={loading}
                    >
                      <Option value="frpc">frpc</Option>
                      <Option value="frps">frps</Option>
                    </Select>
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
                    <Spin size="large" tip={`加载${configType}模板...`} />
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
                <TextArea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="请输入配置内容"
                  autoSize={{ minRows: 20, maxRows: 30 }}
                  style={{ 
                    width: '100%', 
                    fontFamily: 'monospace',
                    transition: 'all 0.5s var(--ease-smooth)',
                    borderColor: loading ? '#e8e8e8' : '#d9d9d9',
                    boxShadow: loading ? 'none' : '0 0 0 2px rgba(24, 144, 255, 0.0)'
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ConfigForm; 