import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Checkbox, Divider, Form, Input, Layout, Typography, message } from 'antd'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'

const REQUIRED_FIELD_MESSAGE = 'Поле обязательно для заполнения'

interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const { mutateAsync: performLogin, isPending: isLoading, error, reset: clearError } = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      await login(
        {
          username: values.email.trim(),
          password: values.password,
        },
        values.remember,
      )
    },
    onError: (authError) => {
      const errorText = authError instanceof Error ? authError.message : 'Не удалось выполнить вход'
      messageApi.error(errorText)
    },
  })

  const handleFinish = async (values: LoginFormValues): Promise<void> => {
    await performLogin(values)
  }

  const handleValuesChange = () => {
    if (error) {
      clearError()
    }
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.PRODUCTS} replace />
  }

  return (
    <>
      {contextHolder}
      <Layout className="login-layout">
        <Card className="login-card">
          <div className="auth-header">
            <div className="auth-logo" aria-hidden="true" />
            <Typography.Title level={1} className="auth-title">
              Добро пожаловать!
            </Typography.Title>
            <Typography.Paragraph className="auth-subtitle">
              Пожалуйста, авторизуйтесь
            </Typography.Paragraph>
          </div>

          <Form<LoginFormValues>
            className="auth-form"
            form={form}
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={handleFinish}
            onValuesChange={handleValuesChange}
          >
            <Form.Item label="Почта" name="email" rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}>
              <Input
                className="auth-input"
                autoComplete="email"
                placeholder="Введите почту"
                prefix={<UserOutlined />}
                allowClear
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
            >
              <Input.Password
                className="auth-input"
                autoComplete="current-password"
                placeholder="Введите пароль"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item className="auth-checkbox-item" name="remember" valuePropName="checked">
              <Checkbox>Запомнить данные</Checkbox>
            </Form.Item>

            {error ? (
              <Form.Item>
                <Alert message={error instanceof Error ? error.message : 'Ошибка входа'} type="error" showIcon />
              </Form.Item>
            ) : null}

            <Form.Item>
              <Button className="auth-submit-button" type="primary" htmlType="submit" loading={isLoading} block>
                Войти
              </Button>
            </Form.Item>

            <Divider className="auth-divider" plain>
              или
            </Divider>

            <div className="auth-switch">
              <Typography.Text type="secondary">Нет аккаунта?</Typography.Text>{' '}
              <Link to={ROUTES.REGISTER}>Создать</Link>
            </div>
          </Form>
        </Card>
      </Layout>
    </>
  )
}
