import type { Product, ProductsResponse } from '../../../types'

const PRODUCTS_URL = 'https://dummyjson.com/products'
const SEARCH_PRODUCTS_URL = 'https://dummyjson.com/products/search'

export async function fetchProducts(searchQuery = ''): Promise<Product[]> {
  const normalizedQuery = searchQuery.trim()
  const requestUrl = normalizedQuery
    ? `${SEARCH_PRODUCTS_URL}?q=${encodeURIComponent(normalizedQuery)}`
    : PRODUCTS_URL

  const response = await fetch(requestUrl)

  if (!response.ok) {
    throw new Error('Не удалось загрузить список товаров')
  }

  const payload = (await response.json()) as ProductsResponse

  if (!Array.isArray(payload.products)) {
    throw new Error('Сервер вернул некорректный формат товаров')
  }

  return payload.products
}
