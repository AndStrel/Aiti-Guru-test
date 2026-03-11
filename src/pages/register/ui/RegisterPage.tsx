import { useEffect } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Checkbox, Divider, Form, Input, Layout, Typography, message } from 'antd'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'

const REQUIRED_FIELD_MESSAGE = 'Поле обязательно для заполнения'

interface RegisterFormValues {
  username: string
  password: string
  confirmPassword: string
  remember: boolean
}

export function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  useEffect(() => {
    clearError()
    return clearError
  }, [clearError])

  const handleFinish = async (values: RegisterFormValues): Promise<void> => {
    try {
      await register(
        {
          username: values.username.trim(),
          password: values.password,
        },
        values.remember,
      )
    } catch (registerError) {
      const errorText =
        registerError instanceof Error ? registerError.message : 'Не удалось зарегистрироваться'
      messageApi.error(errorText)
    }
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
            <Typography.Title level={1} className="auth-title auth-title-small">
              Создать аккаунт
            </Typography.Title>
            <Typography.Paragraph className="auth-subtitle auth-subtitle-small">
              Заполните поля для регистрации
            </Typography.Paragraph>
          </div>

          <Form<RegisterFormValues>
            className="auth-form"
            form={form}
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={handleFinish}
            onValuesChange={handleValuesChange}
          >
            <Form.Item label="Логин" name="username" rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}>
              <Input className="auth-input" autoComplete="username" placeholder="Введите логин" prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: REQUIRED_FIELD_MESSAGE },
                { min: 4, message: 'Минимум 4 символа' },
              ]}
            >
              <Input.Password
                className="auth-input"
                autoComplete="new-password"
                placeholder="Введите пароль"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Повторите пароль"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: REQUIRED_FIELD_MESSAGE },
                ({ getFieldValue }) => ({
                  validator(_rule, value: string) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }

                    return Promise.reject(new Error('Пароли не совпадают'))
                  },
                }),
              ]}
            >
              <Input.Password
                className="auth-input"
                autoComplete="new-password"
                placeholder="Повторите пароль"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item className="auth-checkbox-item" name="remember" valuePropName="checked">
              <Checkbox>Запомнить данные</Checkbox>
            </Form.Item>

            {error ? (
              <Form.Item>
                <Alert message={error} type="error" showIcon />
              </Form.Item>
            ) : null}

            <Form.Item>
              <Button className="auth-submit-button" type="primary" htmlType="submit" loading={isLoading} block>
                Создать аккаунт
              </Button>
            </Form.Item>

            <Divider className="auth-divider" plain>
              или
            </Divider>

            <div className="auth-switch">
              <Typography.Text type="secondary">Уже есть аккаунт?</Typography.Text>{' '}
              <Link to={ROUTES.LOGIN}>Войти</Link>
            </div>
          </Form>
        </Card>
      </Layout>
    </>
  )
}
