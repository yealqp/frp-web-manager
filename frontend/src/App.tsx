import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import CreateConfigPage from './pages/CreateConfigPage';
import EditConfigPage from './pages/EditConfigPage';
import LogViewerPage from './pages/LogViewerPage';
import SettingsPage from './pages/SettingsPage';
import UserSettingsPage from './pages/UserSettingsPage';
import LoginPage from './pages/LoginPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 需要认证的路由 */}
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateConfigPage />} />
                <Route path="/edit/:id" element={<EditConfigPage />} />
                <Route path="/logs/:id" element={<LogViewerPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/user-settings" element={<UserSettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App; 