import { apiClient } from '../api-client'

export interface Category {
  id: string
  name: string
  image: string
}

export async function getCategories() {
  const response = await apiClient.get<Array<Category>>('/category')
  return response.data
}

export async function getCategoryById(id: string) {
  const response = await apiClient.get<Category>(`/category/${id}`)
  return response.data
}

export interface CreateCategoryInput {
  name: string
  file: File
}

export async function createCategory(input: CreateCategoryInput) {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('file', input.file)

  const response = await apiClient.post<Category>('/category', formData)
  return response.data
}

export interface UpdateCategoryInput {
  id: string
  name: string
  file?: File
}

export async function updateCategory(input: UpdateCategoryInput) {
  const formData = new FormData()
  formData.append('name', input.name)
  if (input.file) {
    formData.append('file', input.file)
  }

  const response = await apiClient.patch<Category>(
    `/category/${input.id}`,
    formData,
  )
  return response.data
}

export async function deleteCategory(id: string) {
  const response = await apiClient.delete<void>(`/category/${id}`)
  return response.data
}

export const categoryApi = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}
