import { apiClient } from '../api-client'

export interface Catalog {
  id: string
  title: string
  file: string
  categoryId: string
  category: {
    id: string
    name: string
    image: string
  }
}

export async function getCatalogs() {
  const response = await apiClient.get<Array<Catalog>>('/catalogue')
  return response.data
}

export async function getCatalogById(id: string) {
  const response = await apiClient.get<Catalog>(`/catalogue/${id}`)
  return response.data
}

export interface CreateCatalogInput {
  title: string
  categoryId: string
  file: File
}

export async function createCatalog(input: CreateCatalogInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('categoryId', input.categoryId)
  formData.append('file', input.file)

  const response = await apiClient.post<Catalog>('/catalogue', formData)
  return response.data
}

export interface UpdateCatalogInput {
  id: string
  title: string
  categoryId: string
  file?: File
}

export async function updateCatalog(input: UpdateCatalogInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('categoryId', input.categoryId)
  if (input.file) {
    formData.append('file', input.file)
  }

  const response = await apiClient.patch<Catalog>(
    `/catalogue/${input.id}`,
    formData,
  )
  return response.data
}

export async function deleteCatalog(id: string) {
  const response = await apiClient.delete<void>(`/catalogue/${id}`)
  return response.data
}

export const catalogApi = {
  getCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog,
}
