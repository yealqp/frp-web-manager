import React, { Suspense } from 'react';
import { Breadcrumb, Spin } from 'antd';
import { Link } from 'react-router-dom';
import ConfigForm from '../components/ConfigForm';
import PageTransition from '../components/PageTransition';

const EditConfigPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="edit-config-page page-enter">
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
          <Breadcrumb.Item>编辑配置</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
          <Suspense fallback={<Spin size="large" />}>
            <ConfigForm mode="edit" />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
};

export default EditConfigPage; 