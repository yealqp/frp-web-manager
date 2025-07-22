import React, { Suspense } from 'react';
import { Breadcrumb, Spin } from 'antd';
import { Link } from 'react-router-dom';
import ConfigForm from '../components/ConfigForm';
import PageTransition from '../components/PageTransition';

const CreateConfigPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="create-config-page page-enter">
        <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
          <Suspense fallback={<Spin size="large" />}>
            <ConfigForm mode="create" />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateConfigPage; 