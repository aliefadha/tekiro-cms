import { apiClient } from '../api-client'

export interface Product {
  id: string
  name: string
  description: string
  images: Array<string>
  storeUrl: string
  categoryId: string
  category: {
    id: string
    name: string
  }
}

export async function getProducts() {
  const response = await apiClient.get<Array<Product>>('/product')
  return response.data
}

export async function getProductById(id: string) {
  const response = await apiClient.get<Product>(`/product/${id}`)
  return response.data
}

export interface CreateProductInput {
  name: string
  description: string
  files: Array<File>
  storeUrl?: string
  categoryId: string
}

export async function createProduct(input: CreateProductInput) {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('description', input.description)
  formData.append('categoryId', input.categoryId)
  if (input.storeUrl) {
    formData.append('storeUrl', input.storeUrl)
  }
  input.files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await apiClient.post<Product>('/product', formData)
  return response.data
}

export interface UpdateProductInput {
  id: string
  name: string
  description: string
  files?: Array<File>
  storeUrl?: string
  categoryId: string
}

export async function updateProduct(input: UpdateProductInput) {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('description', input.description)
  formData.append('categoryId', input.categoryId)
  if (input.storeUrl) {
    formData.append('storeUrl', input.storeUrl)
  }
  if (input.files && input.files.length > 0) {
    input.files.forEach((file) => {
      formData.append('files', file)
    })
  }

  const response = await apiClient.patch<Product>(
    `/product/${input.id}`,
    formData,
  )
  return response.data
}

export async function deleteProduct(id: string) {
  const response = await apiClient.delete<void>(`/product/${id}`)
  return response.data
}

export const productApi = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
