import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Layout, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'
import { fetchProducts } from '../../../entities/product/api/productsApi'
import type { Product } from '../../../entities/product/model/product.types'

const columns: ColumnsType<Product> = [
  {
    title: 'Наименование',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Вендор',
    dataIndex: 'brand',
    key: 'brand',
    render: (brand: Product['brand']) => brand ?? '—',
  },
  {
    title: 'Артикул',
    dataIndex: 'sku',
    key: 'sku',
    render: (sku: Product['sku']) => sku ?? '—',
  },
  {
    title: 'Оценка',
    dataIndex: 'rating',
    key: 'rating',
    render: (rating: number) => (
      <span className={rating < 3 ? 'rating-low' : undefined}>
        {rating.toFixed(1)}
      </span>
    ),
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    render: (price: number) => `${price.toFixed(2)} $`,
  },
  {
    title: 'Количество',
    dataIndex: 'stock',
    key: 'stock',
  },
]

export function ProductsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

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
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            Текущий пользователь: {user?.username ?? 'Не определен'}
          </Typography.Text>

          {isError ? (
            <Alert
              message="Ошибка загрузки товаров"
              description={error instanceof Error ? error.message : 'Неизвестная ошибка'}
              type="error"
              showIcon
              action={
                <Button size="small" onClick={() => void refetch()}>
                  Повторить
                </Button>
              }
            />
          ) : null}

          <Table<Product>
            rowKey="id"
            columns={columns}
            dataSource={data ?? []}
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>
    </Layout>
  )
}
