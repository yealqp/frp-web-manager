import React, { Suspense } from 'react';
import { Spin } from 'antd';
import ConfigList from '../components/ConfigList';
import PageTransition from '../components/PageTransition';

const HomePage: React.FC = () => {
  return (
    <PageTransition>
      <div className="home-page page-enter">
        <Suspense fallback={<Spin size="large" />}>
          <ConfigList />
        </Suspense>
      </div>
    </PageTransition>
  );
};

export default HomePage; 