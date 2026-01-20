import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function isImageUsedInContent(
  imageUrl: string,
  content: string,
): boolean {
  if (!imageUrl || !content) return false

  const normalizedUrl = imageUrl.replace(/^\/+/, '')

  return content.includes(imageUrl) || content.includes(normalizedUrl)
}
