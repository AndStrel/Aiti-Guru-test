import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Layout, Modal, Space, Table, Typography, message } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import type { SortOrder, SorterResult } from 'antd/es/table/interface'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../../shared/config/routes'
import { fetchProducts } from '../../../entities/product/api/productsApi'
import type { Product } from '../../../entities/product/model/product.types'

type SortField = 'price' | 'rating'
type SortDirection = 'asc' | 'desc'

interface AddProductFormValues {
  title: string
  price: number
  brand: string
  sku: string
}

function parseSortField(value: string | null): SortField | null {
  return value === 'price' || value === 'rating' ? value : null
}

function parseSortDirection(value: string | null): SortDirection | null {
  return value === 'asc' || value === 'desc' ? value : null
}

function toSortOrder(sortField: SortField | null, sortDirection: SortDirection | null, field: SortField): SortOrder {
  if (sortField !== field || !sortDirection) {
    return null
  }

  return sortDirection === 'asc' ? 'ascend' : 'descend'
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [sessionProducts, setSessionProducts] = useState<Product[]>([])
  const [addProductForm] = Form.useForm<AddProductFormValues>()
  const [messageApi, contextHolder] = message.useMessage()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const searchQuery = searchParams.get('q') ?? ''
  const sortField = parseSortField(searchParams.get('sortBy'))
  const sortDirection = parseSortDirection(searchParams.get('order'))

  const updateSearchParams = (updates: Record<string, string | null>) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          nextParams.delete(key)
          return
        }

        nextParams.set(key, value)
      })

      return nextParams
    }, { replace: true })
  }

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    updateSearchParams({ q: event.target.value })
  }

  const handleTableChange: TableProps<Product>['onChange'] = (_pagination, _filters, sorter) => {
    const nextSorter = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<Product> | undefined

    if (!nextSorter || !nextSorter.order) {
      updateSearchParams({ sortBy: null, order: null })
      return
    }

    const candidateField = nextSorter.field ?? nextSorter.columnKey
    const resolvedField = candidateField === 'price' || candidateField === 'rating' ? candidateField : null
    const resolvedOrder = nextSorter.order === 'ascend' ? 'asc' : nextSorter.order === 'descend' ? 'desc' : null

    if (!resolvedField || !resolvedOrder) {
      updateSearchParams({ sortBy: null, order: null })
      return
    }

    updateSearchParams({ sortBy: resolvedField, order: resolvedOrder })
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => fetchProducts(searchQuery),
  })

  const visibleSessionProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return sessionProducts
    }

    return sessionProducts.filter((product) => product.title.toLowerCase().includes(normalizedQuery))
  }, [searchQuery, sessionProducts])

  const mergedProducts = useMemo(() => {
    return [...visibleSessionProducts, ...(data ?? [])]
  }, [data, visibleSessionProducts])

  const sortedProducts = useMemo(() => {
    if (!sortField || !sortDirection) {
      return mergedProducts
    }

    const sortFactor = sortDirection === 'asc' ? 1 : -1
    return [...mergedProducts].sort((firstProduct, secondProduct) => {
      const firstValue = firstProduct[sortField]
      const secondValue = secondProduct[sortField]
      return (firstValue - secondValue) * sortFactor
    })
  }, [mergedProducts, sortDirection, sortField])

  const columns = useMemo<ColumnsType<Product>>(
    () => [
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
        sorter: true,
        sortOrder: toSortOrder(sortField, sortDirection, 'rating'),
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
        sorter: true,
        sortOrder: toSortOrder(sortField, sortDirection, 'price'),
        render: (price: number) => `${price.toFixed(2)} $`,
      },
      {
        title: 'Количество',
        dataIndex: 'stock',
        key: 'stock',
      },
    ],
    [sortDirection, sortField],
  )

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const openAddModal = () => {
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    addProductForm.resetFields()
  }

  const handleAddProductFinish = (values: AddProductFormValues) => {
    const createdProduct: Product = {
      id: Date.now(),
      title: values.title.trim(),
      brand: values.brand.trim(),
      sku: values.sku.trim(),
      rating: 0,
      price: Number(values.price),
      stock: 0,
    }

    setSessionProducts((previousProducts) => [createdProduct, ...previousProducts])
    setIsAddModalOpen(false)
    addProductForm.resetFields()
    messageApi.success('Товар успешно добавлен')
  }

  return (
    <>
      {contextHolder}
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

            <div className="products-controls">
              <Input
                className="products-search"
                placeholder="Поиск по наименованию товара"
                value={searchQuery}
                allowClear
                onChange={handleSearchChange}
              />
              <Button type="primary" onClick={openAddModal}>
                Добавить
              </Button>
            </div>

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
              dataSource={sortedProducts}
              loading={isLoading}
              onChange={handleTableChange}
              pagination={{ pageSize: 10 }}
            />
          </Space>
        </Card>
      </Layout>

      <Modal
        title="Добавить товар"
        open={isAddModalOpen}
        destroyOnClose
        okText="Добавить"
        cancelText="Отмена"
        onCancel={closeAddModal}
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
