import { useEffect } from 'react'
import { Alert, Button, Card, Checkbox, Form, Input, Layout, message } from 'antd'
import { useNavigate } from 'react-router-dom'
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
    if (isAuthenticated) {
      navigate(ROUTES.PRODUCTS, { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => clearError, [clearError])

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
              <Input autoComplete="username" placeholder="Введите логин (например, emilys)" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
            >
              <Input.Password autoComplete="current-password" placeholder="Введите пароль" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Запомнить меня</Checkbox>
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
          </Form>
        </Card>
      </Layout>
    </>
  )
}
