const API_URL = 'https://graphql.anilist.co';
const homeCache = new Map();

export const fetchHomeData = async (trendingPage = 1, popularPage = 1, upcomingPage = 1) => {
  const cacheKey = `${trendingPage}-${popularPage}-${upcomingPage}`;
  if (homeCache.has(cacheKey)) {
    return homeCache.get(cacheKey);
  }

  const query = `
    query ($trendingPage: Int, $popularPage: Int, $upcomingPage: Int) {
      trending: Page(page: $trendingPage, perPage: 24) {
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
          description(asHtml: false)
          trailer {
            id
            site
          }
        }
      }
      popular: Page(page: $popularPage, perPage: 24) {
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
      upcoming: Page(page: $upcomingPage, perPage: 24) {
        pageInfo {
          hasNextPage
        }
        media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED) {
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
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  const variables = { trendingPage, popularPage, upcomingPage };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  };

  try {
    const response = await fetch(API_URL, options);
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    homeCache.set(cacheKey, data.data);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const searchAnime = async (search, page = 1) => {
    const query = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 24) {
        pageInfo {
          hasNextPage
        }
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
    const variables = { search, page };
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
      };
    
      try {
        const response = await fetch(API_URL, options);
        const data = await response.json();
        return data.data.Page;
      } catch (error) {
        console.error("Error searching anime:", error);
        return { media: [], pageInfo: { hasNextPage: false } };
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
    const response = await fetch(API_URL, options);
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
        description(asHtml: true)
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
            id
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
        characters(sort: ROLE, perPage: 25) {
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
    const response = await fetch(API_URL, options);
    const data = await response.json();
    return data.data.Media;
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
};

export const fetchCharacterDetails = async (id) => {
  const query = `
    query ($id: Int) {
      Character(id: $id) {
        id
        name {
          full
          native
        }
        image {
          large
          medium
        }
        description(asHtml: true)
        gender
        dateOfBirth {
          year
          month
          day
        }
        age
        bloodType
        media(type: ANIME, sort: POPULARITY_DESC, perPage: 24) {
          nodes {
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
    const response = await fetch(API_URL, options);
    const data = await response.json();
    return data.data.Character;
  } catch (error) {
    console.error("Error fetching character details:", error);
    return null;
  }
};

export const fetchStudioDetails = async ({ id, page = 1, sort = "POPULARITY_DESC" }) => {
  const query = `
    query ($id: Int, $page: Int, $sort: [MediaSort]) {
      Studio(id: $id) {
        id
        name
        isAnimationStudio
        media(page: $page, perPage: 20, sort: $sort, isMain: true) {
          pageInfo {
            hasNextPage
            lastPage
          }
          nodes {
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
            startDate {
              year
            }
          }
        }
      }
    }
  `;

  const variables = { id, page, sort: [sort] };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  };

  try {
    const response = await fetch(API_URL, options);
    const data = await response.json();
    return data.data.Studio;
  } catch (error) {
    console.error("Error fetching studio details:", error);
    return null;
  }
};
