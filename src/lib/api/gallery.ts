import { apiClient } from '../api-client'

export interface WebGalleryImage {
  id: string
  title: string
  image: string
  type: 'web'
}

export interface InstagramGalleryImage {
  id: string
  title: string
  link: string
  image: string
  type: 'instagram'
}

export type GalleryImage = WebGalleryImage | InstagramGalleryImage

export interface GalleryListResponse {
  images: Array<GalleryImage>
  total: number
}

export async function getInstagramGallery() {
  const response =
    await apiClient.get<Array<InstagramGalleryImage>>('/instagram')
  return response.data
}

export async function getWebGallery() {
  const response = await apiClient.get<Array<WebGalleryImage>>('/gallery')
  return response.data
}

export interface CreateWebImageInput {
  title: string
  file: File
}

export async function createWebImage(input: CreateWebImageInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('file', input.file)

  const response = await apiClient.post<WebGalleryImage>('/gallery', formData)
  return response.data
}

export interface CreateInstagramImageInput {
  title: string
  link: string
  file: File
}

export async function createInstagramImage(input: CreateInstagramImageInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('link', input.link)
  formData.append('file', input.file)

  const response = await apiClient.post<InstagramGalleryImage>(
    '/instagram',
    formData,
  )
  return response.data
}

export interface UpdateWebImageInput {
  id: string
  title: string
  file?: File
}

export async function updateWebImage(input: UpdateWebImageInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  if (input.file) {
    formData.append('file', input.file)
  }

  const response = await apiClient.patch<WebGalleryImage>(
    `/gallery/${input.id}`,
    formData,
  )
  return response.data
}

export interface UpdateInstagramImageInput {
  id: string
  title: string
  link: string
  file?: File
}

export async function updateInstagramImage(input: UpdateInstagramImageInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('link', input.link)
  if (input.file) {
    formData.append('file', input.file)
  }

  const response = await apiClient.patch<InstagramGalleryImage>(
    `/instagram/${input.id}`,
    formData,
  )
  return response.data
}

export async function deleteWebImage(id: string) {
  const response = await apiClient.delete<void>(`/gallery/${id}`)
  return response.data
}

export async function deleteInstagramImage(id: string) {
  const response = await apiClient.delete<void>(`/instagram/${id}`)
  return response.data
}

export const galleryApi = {
  getInstagramGallery,
  getWebGallery,
  createWebImage,
  createInstagramImage,
  updateWebImage,
  updateInstagramImage,
  deleteWebImage,
  deleteInstagramImage,
}
