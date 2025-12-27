import { apiClient } from '../api-client'

export interface CordlessItem {
  id: string
  title: string
  description: string
  link: string
}

export async function getCordlessList() {
  const response = await apiClient.get<Array<CordlessItem>>('/cordless')
  return response.data
}

export interface CreateCordlessInput {
  title: string
  description: string
  link: string
}

export async function createCordless(input: CreateCordlessInput) {
  const response = await apiClient.post<CordlessItem>('/cordless', input)
  return response.data
}

export interface UpdateCordlessInput {
  id: string
  title: string
  description: string
  link: string
}

export async function updateCordless(input: UpdateCordlessInput) {
  const response = await apiClient.patch<CordlessItem>(
    `/cordless/${input.id}`,
    input,
  )
  return response.data
}

export async function deleteCordless(id: string) {
  const response = await apiClient.delete<void>(`/cordless/${id}`)
  return response.data
}

export const cordlessApi = {
  getCordlessList,
  createCordless,
  updateCordless,
  deleteCordless,
}
