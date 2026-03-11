import { useState } from 'react'
import { EllipsisOutlined, LogoutOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Layout, Modal, Space, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { SortOrder, SorterResult, TableCurrentDataSource, TablePaginationConfig } from 'antd/es/table/interface'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../../../entities/product/api/productsApi'
import type { Product } from '../../../types'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'

type SortField = 'price' | 'rating'
type SortDirection = 'asc' | 'desc'

interface AddProductFormValues {
  title: string
  price: number
  brand: string
  sku: string
}

const PAGE_SIZE = 10

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sessionProducts, setSessionProducts] = useState<Product[]>([])
  const [addProductForm] = Form.useForm<AddProductFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const logout = useAuthStore((state) => state.logout)
  const searchQuery = searchParams.get('q') ?? ''
  const sortField = searchParams.get('sortBy') as SortField | null
  const sortDirection = searchParams.get('order') as SortDirection | null

  const getSortOrder = (field: SortField): SortOrder =>
    sortField === field && sortDirection ? (sortDirection === 'asc' ? 'ascend' : 'descend') : null

  const updateSearchParams = (updates: Record<string, string | null>) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          nextParams.set(key, value)
        } else {
          nextParams.delete(key)
        }
      })

      return nextParams
    }, { replace: true })
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<Product> | SorterResult<Product>[],
    extra: TableCurrentDataSource<Product>,
  ) => {
    const { field, order } = Array.isArray(sorter) ? sorter[0] : sorter

    setCurrentPage(pagination.current ?? 1)

    if (extra.action !== 'sort') {
      return
    }

    updateSearchParams({
      sortBy: (field === 'price' || field === 'rating') ? field : null,
      order: order === 'ascend' ? 'asc' : order === 'descend' ? 'desc' : null,
    })
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => fetchProducts(searchQuery),
  })

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const localProducts = sessionProducts.filter((p) => !normalizedQuery || p.title.toLowerCase().includes(normalizedQuery))
  const products = [...localProducts, ...(data ?? [])]

  if (sortField && sortDirection) {
    const factor = sortDirection === 'asc' ? 1 : -1
    products.sort((a, b) => (Number(a[sortField]) - Number(b[sortField])) * factor)
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'Наименование',
      dataIndex: 'title',
      key: 'title',
      width: 320,
      render: (_title: string, product: Product) => (
        <div className="product-name-cell">
          <div className="product-thumb">
            {product.thumbnail ? <img src={product.thumbnail} alt={product.title} /> : null}
          </div>
          <div className="product-name-meta">
            <div className="product-name-title">{product.title}</div>
            <div className="product-name-category">{product.category ?? 'Без категории'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Вендор',
      dataIndex: 'brand',
      key: 'brand',
      width: 150,
      render: (brand: Product['brand']) => <span className="product-brand">{brand ?? '—'}</span>,
    },
    {
      title: 'Артикул',
      dataIndex: 'sku',
      key: 'sku',
      width: 160,
      render: (sku: Product['sku']) => sku ?? '—',
    },
    {
      title: 'Оценка',
      dataIndex: 'rating',
      key: 'rating',
      sorter: true,
      sortOrder: getSortOrder('rating'),
      width: 120,
      render: (rating: number) => <span className={rating < 3 ? 'rating-low' : undefined}>{rating.toFixed(1)}/5</span>,
    },
    {
      title: 'Цена, ₽',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      sortOrder: getSortOrder('price'),
      width: 150,
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Количество',
      dataIndex: 'stock',
      key: 'stock',
      width: 130,
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: () => (
        <div className="product-actions">
          <Button className="product-action-add" type="primary" shape="round" icon={<PlusOutlined />} />
          <Button className="product-action-more" shape="circle" icon={<EllipsisOutlined />} />
        </div>
      ),
    },
  ]

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const handleAddModalClose = () => {
    setIsAddModalOpen(false)
    addProductForm.resetFields()
  }

  const handleAddProductFinish = (values: AddProductFormValues) => {
    setSessionProducts((previousProducts) => [
      {
        id: Date.now(),
        title: values.title.trim(),
        price: Number(values.price),
        brand: values.brand.trim(),
        sku: values.sku.trim(),
        category: 'Локально добавлено',
        rating: 0,
        stock: 0,
      },
      ...previousProducts,
    ])

    setCurrentPage(1)
    handleAddModalClose()
    messageApi.success('Товар успешно добавлен')
  }

  return (
    <>
      {contextHolder}
      <Layout className="products-layout">
        <div className="products-shell">
          <Card className="products-toolbar-card" variant="borderless">
            <div className="products-toolbar">
              <Typography.Title className="products-page-title" level={2}>
                Товары
              </Typography.Title>
              <Input
                className="products-toolbar-search"
                placeholder="Найти"
                value={searchQuery}
                allowClear
                prefix={<SearchOutlined />}
                onChange={(event) => {
                  setCurrentPage(1)
                  updateSearchParams({ q: event.target.value })
                }}
              />
              <Button className="products-logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          </Card>

          <Card className="products-list-card" variant="borderless">
            <div className="products-list-header">
              <Typography.Title className="products-list-title" level={3}>
                Все позиции
              </Typography.Title>
              <Space size={12}>
                <Button className="products-icon-button" icon={<ReloadOutlined />} onClick={() => void refetch()} />
                <Button className="products-add-button" type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                  Добавить
                </Button>
              </Space>
            </div>

            {isError ? (
              <Alert
                message="Ошибка загрузки товаров"
                description={error instanceof Error ? error.message : 'Неизвестная ошибка'}
                type="error"
                showIcon
              />
            ) : null}

            <Table<Product>
              className="products-table"
              rowKey="id"
              columns={columns}
              dataSource={products}
              loading={isLoading}
              onChange={handleTableChange}
              pagination={{
                current: currentPage,
                pageSize: PAGE_SIZE,
                total: products.length,
                showSizeChanger: false,
                onChange: setCurrentPage,
                placement: ['bottomEnd'],
              }}
              rowSelection={{ columnWidth: 46 }}
              scroll={{ x: 980 }}
              locale={{ emptyText: 'Ничего не найдено' }}
            />
          </Card>
        </div>
      </Layout>

      <Modal
        title="Добавить товар"
        open={isAddModalOpen}
        destroyOnHidden
        okText="Добавить"
        cancelText="Отмена"
        onCancel={handleAddModalClose}
        onOk={() => addProductForm.submit()}
      >
        <Form<AddProductFormValues> form={addProductForm} layout="vertical" onFinish={handleAddProductFinish}>
          <Form.Item label="Наименование" name="title" rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
            <Input placeholder="Введите наименование товара" />
          </Form.Item>

          <Form.Item label="Цена" name="price" rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="Введите цену" />
          </Form.Item>

          <Form.Item label="Вендор" name="brand" rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
            <Input placeholder="Введите вендора" />
          </Form.Item>

          <Form.Item label="Артикул" name="sku" rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
            <Input placeholder="Введите артикул" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
