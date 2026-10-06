export type VideoProvider = 'youtube' | 'vimeo' | 'file'

export type PortfolioFilterCategory = 'social' | 'events' | 'image' | 'youtube'

export type ProjectItem = {
  id: string
  slug: string
  title: string
  customerName: string
  videoId?: string
  videoProvider: VideoProvider
  fileUrl?: string
  summary: string
  description?: string
  thumbnailUrl?: string
  previewDarken?: boolean
  portfolioCategories: PortfolioFilterCategory[]
  listIndex: number
}
