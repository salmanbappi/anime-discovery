# Anime Discovery - Comprehensive Project Guide

**Total Deployments to Date:** 104
**Current Version:** 2.9.2

This guide documents the architecture, features, and usage of the Anime Discovery application. It reflects the evolution of the project from a simple listing site to a robust, feature-rich discovery platform powered by the Anilist GraphQL API.

## 🚀 Project Overview

Anime Discovery is a modern, responsive single-page application (SPA) designed to help users find, track, and explore anime. It utilizes a high-performance tech stack to deliver a seamless user experience, mimicking the depth and polish of professional streaming platforms.

### 🛠️ Technical Architecture

*   **Core Framework:** [React 19](https://react.dev/) - The latest version of the library for web and native user interfaces.
*   **Build Tool:** [Vite](https://vitejs.dev/) - Ensuring lightning-fast development server start-up and optimized production builds.
*   **Routing:** [React Router v7](https://reactrouter.com/) - Managing navigation with client-side routing.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`) & Context API (`AuthContext`).
*   **API Integration:** [Anilist GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/) - Fetched via standard `fetch` API with custom query construction.
*   **Styling:**
    *   **Bootstrap 5 & React-Bootstrap:** For responsive grid layouts and pre-built components.
    *   **Framer Motion:** For layout animations and smooth transitions.
    *   **Custom CSS:** Extensive dark-theme customization (`src/App.css`, `src/index.css`).
*   **Backend Services:**
    *   **Authentication & Database:** [Supabase](https://supabase.com/) - For user accounts and storing bookmarks (implied usage).

---

## ✨ Key Features & Evolution

This application has undergone over 100 updates to refine the user experience. Here are the standout features:

### 1. Dynamic Home Feed
The homepage is the central hub, featuring:
*   **Hero Carousel:** A large, visually striking carousel highlighting top trending anime with high-resolution backdrops and trailers.
*   **Categorized Feeds:** Distinct sections for "Trending Now", "All Time Popular", and "Upcoming Next Season".
*   **Infinite Scroll:** Gone are the days of manual pagination. The "View All" feature unlocks a seamless scrolling experience where content loads automatically as you browse.

### 2. Powerful Discovery Engine
*   **Smart Search:** Real-time search functionality that supports infinite scrolling results.
*   **Advanced Filtering:** Users can drill down content by **Genre**, **Year**, **Season**, and **Sort Order** (Popularity, Score, etc.).
*   **Responsive Grid:** A carefully calibrated layout that displays 3 items per row on mobile and scales up for larger screens, ensuring maximum visibility of cover art.

### 3. Deep Dive Details
Every anime has a dedicated details page featuring:
*   **Rich Metadata:** Synopsis, Score, Status, Format, Episodes, and Studio information.
*   **Characters:** A cast list with voice actor information (where applicable).
*   **Trailers:** Embedded YouTube players for instant previews.
*   **Recommendations:** "If you liked this..." suggestions based on user ratings.
*   **Studio Integration:** Click on a studio name to see a dedicated infinite-scrolling feed of all anime produced by that studio.

### 4. User Personalization
*   **Bookmarks:** Logged-in users can bookmark anime. These are saved to their profile and displayed on the homepage for quick access.
*   **Authentication:** Secure sign-up and login flow (powered by Supabase).

---

## 📖 User Guide

### Browsing
1.  **Home:** Start here to see what's hot. Click "View All" on any section to expand it.
2.  **Details:** Click any anime poster to view its full details.
3.  **Studio:** On a details page, click the studio name (e.g., "MAPPA") to see everything they've made.

### Searching & Filtering
1.  **Search Bar:** Located in the navbar. Type to find specific titles.
2.  **Filter Toggle:** On the homepage, click "Show Filters" to reveal dropdowns for Genre, Year, and Season. These results update instantly and support infinite scrolling.

### Bookmarking
1.  **Log In:** Ensure you are logged in via the "Login" button in the navbar.
2.  **Add:** On an anime details page, click the "Bookmark" or "Add to List" button.
3.  **Manage:** Go to your Profile or check the "Recently Bookmarked" section on the Home page.

---

## 👨‍💻 Developer Notes

### Folder Structure
*   `src/components`: Reusable UI elements (`AnimeCard`, `InfiniteScrollGrid`, `Navbar`).
*   `src/pages`: Main views (`Home`, `AnimeDetails`, `StudioDetails`, `Auth`).
*   `src/services`: API handlers (`api.js` for Anilist, `supabaseClient.js` for backend).
*   `src/context`: Global state providers (`AuthContext`).

### Deployment History
*   **Versions 1.x:** Initial setup, basic listing, and details.
*   **Versions 2.0 - 2.8:** introduced Authentication, Search, Filtering, and Dark Mode.
*   **Version 2.9.x (Latest):** Major UX overhaul introducing **Infinite Scroll** across the entire platform, optimized mobile layouts, and "Upcoming" content support.

---

*Generated for Anime Discovery Repository - 104th Deployment Milestone.*
