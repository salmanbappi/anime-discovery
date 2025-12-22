import { supabase } from './supabaseClient'

export const addBookmark = async (userId, anime, status = 'Plan to watch') => {
  const animeId = parseInt(anime.id)
  const payload = { 
    user_id: userId, 
    anime_id: animeId, 
    anime_title: anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown Title', 
    anime_image: anime.coverImage?.large || anime.coverImage?.extraLarge || '',
    anime_score: anime.averageScore || null,
    anime_format: anime.format || null,
    status: status
  }
  
  const { data, error } = await supabase
    .from('bookmarks')
    .upsert(payload, { onConflict: 'user_id,anime_id' })
    .select()
    
  return { data: data ? data[0] : null, error }
}

export const getBookmarkStatus = async (userId, animeId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('status')
    .match({ user_id: userId, anime_id: parseInt(animeId) })
    .maybeSingle()
  return { data, error }
}

export const removeBookmark = async (userId, animeId) => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .match({ user_id: userId, anime_id: parseInt(animeId) })
  return { error }
}

export const isBookmarked = async (userId, animeId) => {
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .match({ user_id: userId, anime_id: parseInt(animeId) })
    .maybeSingle()
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
