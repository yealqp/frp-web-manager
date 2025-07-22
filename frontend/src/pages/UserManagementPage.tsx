import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllUsers, createUser, deleteUser, updateUserPassword, setTunnelLimit } from '../api/userApi'; // 需要创建 userApi
import { User } from '../api/authApi';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [resetPwdModal, setResetPwdModal] = useState<{ visible: boolean; userId?: string }>({ visible: false });
  const [resetPwdForm] = Form.useForm();
  const [tunnelLimitModal, setTunnelLimitModal] = useState<{ visible: boolean; userId?: string }>({ visible: false });
  const [tunnelLimitForm] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      message.error('获取用户列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showAddUserModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleAddUser = async (values: any) => {
    try {
      await createUser(values.username, values.password, values.source);
      message.success('用户创建成功');
      fetchUsers();
      handleCancel();
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建用户失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success('用户删除成功');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除用户失败');
    }
  };

  const handleResetPwd = async (userId: string) => {
    setResetPwdModal({ visible: true, userId });
    resetPwdForm.resetFields();
  };
  const handleResetPwdOk = async () => {
    const values = await resetPwdForm.validateFields();
    try {
      await updateUserPassword(resetPwdModal.userId!, values.newPassword);
      message.success('密码重置成功');
      setResetPwdModal({ visible: false });
    } catch (error: any) {
      message.error(error.response?.data?.message || '重置密码失败');
    }
  };
  const handleResetPwdCancel = () => {
    setResetPwdModal({ visible: false });
  };

  // 设置隧道上限弹窗
  const handleSetTunnelLimit = (userId: string) => {
    setTunnelLimitModal({ visible: true, userId });
    tunnelLimitForm.setFieldsValue({ tunnelLimit: '' });
  };

  const handleTunnelLimitOk = async () => {
    try {
      const values = await tunnelLimitForm.validateFields();
      const tunnelLimit = Number(values.tunnelLimit);
      if (!Number.isInteger(tunnelLimit) || tunnelLimit < 1) {
        message.error('请输入正整数');
        return;
      }
      await setTunnelLimit(tunnelLimitModal.userId!, tunnelLimit);
      message.success('隧道上限已更新');
      setTunnelLimitModal({ visible: false });
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '设置失败');
    }
  };
  const handleSetTunnelLimitCancel = () => {
    setTunnelLimitModal({ visible: false });
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '隧道用量',
      dataIndex: 'tunnels',
      key: 'tunnels',
      render: (tunnels: any) => `${tunnels ? tunnels.length : 0}/20`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <>
          <Button style={{ marginRight: 8 }} onClick={() => handleResetPwd(record.id)}>
            重置密码
          </Button>
          <Button style={{ marginRight: 8 }} onClick={() => handleSetTunnelLimit(record.id)}>
            设置隧道上限
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showAddUserModal}
        style={{ marginBottom: 16 }}
      >
        添加用户
      </Button>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
      <Modal
        title="添加新用户"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleAddUser} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码长度不能小于6位' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="source"
            label="来源"
            rules={[{ required: true, message: '请输入来源' }]}
            initialValue="手动添加"
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="重置用户密码"
        visible={resetPwdModal.visible}
        onCancel={handleResetPwdCancel}
        onOk={handleResetPwdOk}
        okText="确定"
        cancelText="取消"
      >
        <Form form={resetPwdForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度不能小于6位' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="设置隧道上限"
        visible={tunnelLimitModal.visible}
        onCancel={() => setTunnelLimitModal({ visible: false })}
        onOk={handleTunnelLimitOk}
        okText="确定"
        cancelText="取消"
      >
        <Form form={tunnelLimitForm} layout="vertical">
          <Form.Item
            name="tunnelLimit"
            label="隧道上限"
            rules={[{ required: true, message: '请输入正整数' }]}
          >
            <Input placeholder="请输入正整数" type="number" min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;