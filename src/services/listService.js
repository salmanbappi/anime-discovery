import { supabase } from './supabaseClient'

export const getLists = async (userId) => {
  const { data, error } = await supabase
    .from('anime_lists')
    .select('*, list_items(*)')
    .eq('user_id', userId)
  return { data, error }
}

export const createList = async (userId, name, description = '') => {
  const { data, error } = await supabase
    .from('anime_lists')
    .insert([{ user_id: userId, name, description }])
    .select()
    .single()
  return { data, error }
}

export const addToList = async (userId, listId, anime) => {
  const { data, error } = await supabase
    .from('list_items')
    .insert([
      { 
        user_id: userId, 
        list_id: listId,
        anime_id: anime.id, 
        anime_title: anime.title.english || anime.title.romaji, 
        anime_image: anime.coverImage.large,
        anime_score: anime.averageScore,
        anime_format: anime.format
      }
    ])
  return { data, error }
}

export const removeFromList = async (listId, animeId) => {
  const { data, error } = await supabase
    .from('list_items')
    .delete()
    .match({ list_id: listId, anime_id: animeId })
  return { data, error }
}
