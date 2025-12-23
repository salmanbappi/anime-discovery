# Anime Discovery (v2.9.9)

A modern, responsive anime discovery application. Now featuring infinite scrolling, a dedicated upcoming section, and optimized mobile layouts.

**Last Updated:** December 23, 2025 (v2.9.3)
**Live Demo:** [https://solarlist.vercel.app/](https://solarlist.vercel.app/)
*(Backup: [https://salmanbappi.github.io/anime-discovery/](https://salmanbappi.github.io/anime-discovery/))*

## Features

*   **Infinite Scrolling:** Seamlessly browse Trending, Popular, Upcoming, Search Results, and Filtered lists without manual pagination.
*   **Upcoming Next Season:** Dedicated section for anticipated anime releases.
*   **Optimized Grid:** Responsive layout displaying 3 items per row on mobile for a better viewing experience.
*   **Trending Now:** View the top anime currently trending.
*   **All Time Popular:** Explore the most popular anime of all time.
*   **Search Functionality:** Real-time search for specific anime titles.
*   **Responsive Design:** Fully responsive UI built with Bootstrap, optimized for mobile and desktop.
*   **Dark Mode:** Sleek dark aesthetic similar to Anilist.

## Tech Stack

*   **Frontend:** React (v19), Vite
*   **Styling:** Bootstrap 5, React Bootstrap, Custom CSS
*   **Routing:** React Router DOM (v7)
*   **Data Source:** [Anilist GraphQL API](https://github.com/AniList/ApiV2-GraphQL-Docs)
*   **Deployment:** Vercel (Recommended), Netlify, GitHub Pages

## Local Development

To run this project locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/salmanbappi/anime-discovery.git
    cd anime-discovery
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in browser:**
    Visit `http://localhost:5173`

## Deployment to GitHub Pages

This project is configured for automated deployment to GitHub Pages.

### Configuration Steps (Reference)

If you need to replicate this setup, ensure the following configurations are met:

1.  **`package.json`**:
    *   Add `"homepage": "https://<username>.github.io/<repo-name>/"`
    *   Add scripts:
        ```json
        "predeploy": "npm run build",
        "deploy": "gh-pages -d dist"
        ```

2.  **`vite.config.js`**:
    *   Set the base path to match your repository name:
        ```javascript
        export default defineConfig({
          base: '/anime-discovery/',
          plugins: [react()],
        })
        ```

3.  **`src/App.jsx`**:
    *   Pass the base URL to the Router to handle sub-directory hosting:
        ```jsx
        <Router basename={import.meta.env.BASE_URL}>
        ```

### How to Deploy

To publish changes to the live site:

```bash
npm run deploy
```

This command builds the project and pushes the `dist` folder to the `gh-pages` branch on GitHub.