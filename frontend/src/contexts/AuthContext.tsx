import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getStoredUser, User } from '../api/authApi';
import { message } from 'antd';

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshUser: () => {}
});

// 认证提供者属性类型
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // 从localStorage加载用户信息
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await apiLogin(username, password);
      setUser(userData);
      message.success('登录成功');
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '登录失败';
      message.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await apiRegister(username, password);
      setUser(userData);
      message.success('注册成功');
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '注册失败';
      message.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    apiLogout();
    setUser(null);
    message.success('已退出登录');
  };
  
  const refreshUser = () => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register, 
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 自定义hook用于在组件中使用认证上下文
export const useAuth = () => useContext(AuthContext); 