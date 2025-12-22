import { supabase } from './supabaseClient'

export const addBookmark = async (userId, anime, status = 'Plan to watch') => {
  const { data, error } = await supabase
    .from('bookmarks')
    .upsert({ 
      user_id: userId, 
      anime_id: anime.id, 
      anime_title: anime.title.english || anime.title.romaji, 
      anime_image: anime.coverImage.large,
      anime_score: anime.averageScore,
      anime_format: anime.format,
      status: status,
      updated_at: new Date()
    }, { onConflict: 'user_id, anime_id' })
    .select()
    .single()
  return { data, error }
}

export const getBookmarkStatus = async (userId, animeId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('status')
    .match({ user_id: userId, anime_id: animeId })
    .single()
  return { data, error }
}

export const removeBookmark = async (userId, animeId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .delete()
    .match({ user_id: userId, anime_id: animeId })
  return { data, error }
}

export const isBookmarked = async (userId, animeId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .match({ user_id: userId, anime_id: animeId })
    .single()
  return !!data
}

export const getBookmarks = async (userId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}
