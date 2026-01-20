import { apiClient } from '../api-client'

export interface ArticleImage {
  id: string
  url: string
  createdAt?: string
  updatedAt?: string
}

export async function uploadArticleImage(file: File): Promise<ArticleImage> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ArticleImage>(
    '/article/upload-image',
    formData,
  )
  return response.data
}

export async function getArticleImages(): Promise<Array<ArticleImage>> {
  const response = await apiClient.get<Array<ArticleImage>>(
    '/article/image-article',
  )
  return response.data
}

export async function deleteArticleImage(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`/article/image/${id}`)
  return response.data
}

export const articleImageApi = {
  uploadArticleImage,
  getArticleImages,
  deleteArticleImage,
}
