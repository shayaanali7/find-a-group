export interface User {
    id: string | undefined
}

export interface UserProfile {
  id: string
  created_at: string
  username: string
  name: string
  year: string
  major: string
  bio: string
  email?: string
  profile_picture_url?: string
  github_url?: string
  instagram_url?: string
  posts_count?: number
  groups_count?: number
  reputation?: number
}