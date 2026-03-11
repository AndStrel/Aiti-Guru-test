import { Button, Card, Layout, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'

export function ProductsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <Layout className="products-layout">
      <Card
        className="products-card"
        title="Товары"
        extra={
          <Button onClick={handleLogout} type="default">
            Выйти
          </Button>
        }
      >
        <Typography.Paragraph>
          Заглушка страницы товаров. На следующем шаге здесь появится таблица Ant Design.
        </Typography.Paragraph>
        <Typography.Text type="secondary">
          Текущий пользователь: {user?.username ?? 'Не определен'}
        </Typography.Text>
      </Card>
    </Layout>
  )
}
