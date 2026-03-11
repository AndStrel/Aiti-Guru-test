import type { Product, ProductsResponse } from '../model/product.types'

const PRODUCTS_URL = 'https://dummyjson.com/products'

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(PRODUCTS_URL)

  if (!response.ok) {
    throw new Error('Не удалось загрузить список товаров')
  }

  const payload = (await response.json()) as ProductsResponse

  if (!Array.isArray(payload.products)) {
    throw new Error('Сервер вернул некорректный формат товаров')
  }

  return payload.products
}
