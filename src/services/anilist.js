const ANILIST_API_URL = 'https://graphql.anilist.co';

export const fetchHomeData = async (trendingPage = 1, popularPage = 1) => {
  const query = `
    query ($trendingPage: Int, $popularPage: Int) {
      trending: Page(page: $trendingPage, perPage: 12) {
        pageInfo {
          hasNextPage
        }
        media(sort: TRENDING_DESC, type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
            large
          }
          bannerImage
          averageScore
          genres
          episodes
          format
          description
        }
      }
      popular: Page(page: $popularPage, perPage: 12) {
        pageInfo {
          hasNextPage
        }
        media(sort: POPULARITY_DESC, type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
            large
          }
          bannerImage
          averageScore
          genres
          episodes
          format
        }
      }
    }
  `;

  const variables = { trendingPage, popularPage };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  };

  try {
    const response = await fetch(ANILIST_API_URL, options);
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    return data.data;
  } catch (error) {
    console.error("Error fetching data from Anilist:", error);
    return null;
  }
};

export const searchAnime = async (search) => {
    const query = `
    query ($search: String) {
      Page(page: 1, perPage: 20) {
        media(search: $search, sort: POPULARITY_DESC, type: ANIME) {
           id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          genres
          episodes
          format
        }
      }
    }
    `;
    const variables = { search };
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
      };
    
      try {
        const response = await fetch(ANILIST_API_URL, options);
        const data = await response.json();
        return data.data.Page.media;
      } catch (error) {
        console.error("Error searching anime:", error);
        return [];
      }
}

export const fetchAdvancedData = async ({ page = 1, genre, year, season, sort = "POPULARITY_DESC" }) => {
  const query = `
    query ($page: Int, $genre: String, $year: Int, $season: MediaSeason, $sort: [MediaSort]) {
      Page(page: $page, perPage: 24) {
        pageInfo {
          hasNextPage
        }
        media(genre: $genre, seasonYear: $year, season: $season, sort: $sort, type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
            large
          }
          averageScore
          genres
          episodes
          format
        }
      }
    }
  `;

  const variables = { page, genre, year, season, sort: [sort] };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  };

  try {
    const response = await fetch(ANILIST_API_URL, options);
    const data = await response.json();
    return data.data.Page;
  } catch (error) {
    console.error("Error fetching filtered data:", error);
    return null;
  }
};

export const fetchAnimeDetails = async (id) => {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
        description(asHtml: false)
        format
        episodes
        duration
        status
        startDate {
          year
          month
          day
        }
        season
        seasonYear
        averageScore
        genres
        studios(isMain: true) {
          nodes {
            name
          }
        }
        trailer {
          id
          site
        }
        recommendations(sort: RATING_DESC, perPage: 6) {
          nodes {
            mediaRecommendation {
              id
              title {
                english
                romaji
              }
              coverImage {
                large
              }
            }
          }
        }
        characters(sort: ROLE, perPage: 6) {
          edges {
            role
            node {
              id
              name {
                full
              }
              image {
                medium
              }
            }
          }
        }
      }
    }
  `;

  const variables = { id };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  };

  try {
    const response = await fetch(ANILIST_API_URL, options);
    const data = await response.json();
    return data.data.Media;
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
};
