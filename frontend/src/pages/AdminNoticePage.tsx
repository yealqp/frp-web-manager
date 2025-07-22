import React, { useEffect, useState } from 'react';
import { Card, Input, Button, message, Row, Col } from 'antd';
import { getNotice, setNotice } from '../api/authApi';
import ReactMarkdown from 'react-markdown';

const { TextArea } = Input;

const AdminNoticePage: React.FC = () => {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNotice().then(setContent).catch(() => setContent(''));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setNotice(content);
      message.success('公告已保存');
    } catch {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ margin: '32px 0' }}>
      <Col xs={24} md={20} lg={16}>
        <Card title="编辑系统公告" style={{ width: '100%' }}>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={8}>
              <Button onClick={() => setPreview(!preview)} style={{ marginBottom: 16, width: '100%' }}>
                {preview ? '编辑模式' : '预览模式'}
              </Button>
            </Col>
            <Col xs={24} sm={16} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={handleSave} loading={loading} style={{ width: '100%' }}>
                保存公告
              </Button>
            </Col>
          </Row>
          {preview ? (
            <div style={{ minHeight: 200, border: '1px solid #eee', padding: 16, marginTop: 16 }}>
              <ReactMarkdown>{content || '暂无公告'}</ReactMarkdown>
            </div>
          ) : (
            <TextArea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              placeholder="支持Markdown语法"
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default AdminNoticePage; 