const ANILIST_API_URL = 'https://graphql.anilist.co';

export const fetchHomeData = async () => {
  const query = `
    query {
      trending: Page(page: 1, perPage: 10) {
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
          averageScore
          genres
          episodes
          format
        }
      }
      popular: Page(page: 1, perPage: 10) {
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
          averageScore
          genres
          episodes
          format
        }
      }
    }
  `;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query })
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
