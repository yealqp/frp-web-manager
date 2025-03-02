import React, { Suspense } from 'react';
import { Typography, Breadcrumb, Spin } from 'antd';
import { Link } from 'react-router-dom';
import LogViewer from '../components/LogViewer';
import PageTransition from '../components/PageTransition';

const { Title } = Typography;

const LogViewerPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="log-viewer-page page-enter">
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
          <Breadcrumb.Item>查看日志</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
          <Suspense fallback={<Spin size="large" />}>
            <LogViewer />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
};

export default LogViewerPage; 