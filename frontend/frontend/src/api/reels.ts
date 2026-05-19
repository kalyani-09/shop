import api from './axios'

export interface ProductBrief {
  id: number
  name: string
  price: number
  imageUrl: string
  imageURL?: string
}

export interface ReelResponse {
  id: number
  videoUrl: string
  caption: string
  productId: number
  userId: string
  likeCount: number
  likedByMe: boolean
  createdAt: string
  product: ProductBrief
}

export interface LikeResponse {
  liked: boolean
  likeCount: number
}

export const getReels = (page = 0, size = 10) =>
  api.get<ReelResponse[]>(`/reels?page=${page}&size=${size}`)

export const getReel = (id: number) =>
  api.get<ReelResponse>(`/reels/${id}`)

export const uploadReel = (formData: FormData) =>
  api.post<ReelResponse>('/reels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteReel = (id: number) =>
  api.delete(`/reels/${id}`)

export const toggleLike = (id: number) =>
  api.post<LikeResponse>(`/reels/${id}/like`)
