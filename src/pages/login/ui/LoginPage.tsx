import { useEffect } from 'react'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Checkbox, Divider, Form, Input, Layout, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'

const REQUIRED_FIELD_MESSAGE = 'Поле обязательно для заполнения'

interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  useEffect(() => {
    clearError()
    return clearError
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.PRODUCTS, { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleFinish = async (values: LoginFormValues): Promise<void> => {
    try {
      await login(
        {
          username: values.email.trim(),
          password: values.password,
        },
        values.remember,
      )

      navigate(ROUTES.PRODUCTS, { replace: true })
    } catch (authError) {
      const errorText = authError instanceof Error ? authError.message : 'Не удалось выполнить вход'
      messageApi.error(errorText)
    }
  }

  const handleValuesChange = () => {
    if (error) {
      clearError()
    }
  }

  return (
    <>
      {contextHolder}
      <Layout className="login-layout">
        <Card className="login-card" title="Авторизация">
          <Form<LoginFormValues>
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
                autoComplete="email"
                placeholder="Введите почту (для теста: emilys)"
                prefix={<MailOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
            >
              <Input.Password autoComplete="current-password" placeholder="Введите пароль" prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Запомнить данные</Checkbox>
            </Form.Item>

            {error ? (
              <Form.Item>
                <Alert message={error} type="error" showIcon />
              </Form.Item>
            ) : null}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading} block>
                Войти
              </Button>
            </Form.Item>

            <Divider plain>или</Divider>

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
