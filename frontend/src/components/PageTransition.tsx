import React, { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * 页面过渡组件
 * 用于包装页面内容，提供平滑的过渡效果
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div 
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
        transition: 'all 0.3s ease'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition; 