import React, { Suspense } from 'react';
import {Breadcrumb, Spin, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import LogViewer from '../components/LogViewer';
import PageTransition from '../components/PageTransition';

const LogViewerPage: React.FC = () => {
  return (
    <PageTransition>
      <Row justify="center" style={{ margin: 0 }}>
        <Col xs={24} md={20} lg={16}>
          <div className="log-viewer-page page-enter">
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
              <Breadcrumb.Item>查看日志</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 16, minHeight: 360 }}>
              <Suspense fallback={<Spin size="large" />}>
                <LogViewer />
              </Suspense>
            </div>
          </div>
        </Col>
      </Row>
    </PageTransition>
  );
};

export default LogViewerPage; 