import React, { useEffect, useState } from 'react';
import { Card, Input, Button, message } from 'antd';
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
    <Card title="编辑系统公告" style={{ maxWidth: 800, margin: '32px auto' }}>
      <Button onClick={() => setPreview(!preview)} style={{ marginBottom: 16 }}>
        {preview ? '编辑模式' : '预览模式'}
      </Button>
      {preview ? (
        <div style={{ minHeight: 200, border: '1px solid #eee', padding: 16 }}>
          <ReactMarkdown>{content || '暂无公告'}</ReactMarkdown>
        </div>
      ) : (
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          placeholder="支持Markdown语法"
        />
      )}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button type="primary" onClick={handleSave} loading={loading}>
          保存公告
        </Button>
      </div>
    </Card>
  );
};

export default AdminNoticePage; 