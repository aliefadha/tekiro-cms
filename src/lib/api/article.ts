import { apiClient } from '../api-client'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  primaryImage: string | null
  publishedAt: string | null
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  metaTags?: {
    title?: string
    keywords?: string
    description?: string
  }
}

export async function getArticles() {
  const response = await apiClient.get<Array<Article>>('/article')
  return response.data
}

export async function getArticleById(id: string) {
  const response = await apiClient.get<Article>(`/article/${id}`)
  return response.data
}

export interface CreateArticleInput {
  title: string
  excerpt: string
  contentHtml: string
  file?: File
  publishedAt?: string | null
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  metaTags?: {
    title?: string
    description?: string
    keywords?: string
  }
}

export async function createArticle(input: CreateArticleInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('excerpt', input.excerpt)
  formData.append('contentHtml', input.contentHtml)
  if (input.file) {
    formData.append('file', input.file)
  }
  if (input.publishedAt !== undefined && input.publishedAt !== null) {
    formData.append('publishedAt', input.publishedAt)
  }
  if (input.seoTitle) {
    formData.append('seoTitle', input.seoTitle)
  }
  if (input.seoDescription) {
    formData.append('seoDescription', input.seoDescription)
  }
  if (input.seoKeywords) {
    formData.append('seoKeywords', input.seoKeywords)
  }
  if (input.metaTags) {
    formData.append('metaTags', JSON.stringify(input.metaTags))
  }

  const response = await apiClient.post<Article>('/article', formData)
  return response.data
}

export interface UpdateArticleInput {
  id: string
  title: string
  excerpt: string
  contentHtml: string
  file?: File
  publishedAt?: string | null
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  metaTags?: {
    title?: string
    description?: string
    keywords?: string
  }
}

export async function updateArticle(input: UpdateArticleInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('excerpt', input.excerpt)
  formData.append('contentHtml', input.contentHtml)
  if (input.file) {
    formData.append('file', input.file)
  }
  if (input.publishedAt !== undefined && input.publishedAt !== null) {
    formData.append('publishedAt', input.publishedAt)
  }
  if (input.seoTitle) {
    formData.append('seoTitle', input.seoTitle)
  }
  if (input.seoDescription) {
    formData.append('seoDescription', input.seoDescription)
  }
  if (input.seoKeywords) {
    formData.append('seoKeywords', input.seoKeywords)
  }
  if (input.metaTags) {
    formData.append('metaTags', JSON.stringify(input.metaTags))
  }

  const response = await apiClient.patch<Article>(
    `/article/${input.id}`,
    formData,
  )
  return response.data
}

export async function deleteArticle(id: string) {
  const response = await apiClient.delete<void>(`/article/${id}`)
  return response.data
}

export const articleApi = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
}
