import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import styles from './Login.module.scss';

interface LoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      void message.success('Добро пожаловать!');
      navigate('/');
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось войти'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🍁</div>
        <h1 className={styles.title}>Maple Leaf Admin</h1>
        <p className={styles.subtitle}>Войдите, чтобы управлять контентом</p>

        <Form<LoginForm>
          layout="vertical"
          onFinish={(values) => void handleSubmit(values)}
          autoComplete="off"
          initialValues={{ email: 'admin@maple.leaf', password: 'admin123' }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}
          >
            <Input size="large" placeholder="admin@maple.leaf" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password size="large" placeholder="••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};