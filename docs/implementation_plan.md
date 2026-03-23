# Blog Pagination Restructuring Plan

This plan outlines the architectural changes necessary to convert the client-side "Show More" JavaScript functionality into a robust, SEO-friendly, statically paginated system using Astro.

## Proposed Changes

### [Core Routing & Pagination Engine]

#### [DELETE] [blog.astro](file:///c:/Users/ryang/Downloads/PK%20Dad%20Final/src/pages/blog.astro)
Remove the old route which relied on client-side JavaScript for revealing hidden posts.

#### [NEW] [blog/[...page].astro](file:///c:/Users/ryang/Downloads/PK%20Dad%20Final/src/pages/blog/[...page].astro)
Create a new dynamic catch-all route for the blog.
- **`getStaticPaths` Implementation:**
  ```javascript
  export async function getStaticPaths({ paginate }) {
    // 1. Fetch content (mocked or from collections)
    const allPosts = await getCollection("blog"); // Assuming a blog collection exists, or we use the data array
    // 2. Sort content by date (newest first)
    const sortedPosts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
    // 3. Paginate
    return paginate(sortedPosts, { pageSize: 6 });
  }
  ```
- **Conditional Layout:**
  Wrap the Hero slider and Featured posts inside a `{page.currentPage === 1 && ( ... )}` check to ensure these elements do not duplicate across paginated pages and dilute SEO semantics.
- **Rendering Layer:**
  Replace the hardcoded list of `article` elements and the `hidden-post` CSS-based hiding mechanism with dynamic rendering:
  ```javascript
  {page.data.map(post => (
    <article class="post-card main-feature">
       ...
    </article>
  ))}
  ```
- **Pagination Navigation:**
  Replace the `<button id="showMoreBtn">` with semantic `<nav>` and real `<a>` tags for crawlers to follow.
  ```html
  <nav class="pagination-nav" aria-label="Blog Pagination">
    {page.url.prev ? <a href={page.url.prev}>← Trang trước</a> : <span class="disabled">← Trang trước</span>}
    {page.url.next ? <a href={page.url.next}>Trang sau →</a> : <span class="disabled">Trang sau →</span>}
  </nav>
  ```

### [Layouts]

#### [MODIFY] [BlogLayout.astro](file:///c:/Users/ryang/Downloads/PK%20Dad%20Final/src/layouts/BlogLayout.astro)
- Add conditional canonical tags to prevent duplicate indexing on page 1.
  ```javascript
  <link rel="canonical" href={Astro.url.pathname === '/blog/1' ? '/blog' : Astro.url.pathname} />
  ```

## Verification Plan

### Automated/Simulation Verification
- Run `npm run build` to verify that `[...page].astro` generates the correct static HTML files (`/blog`, `/blog/2`, etc.).

### Manual Verification
- **Test `/blog`:** Confirm that it renders the Hero, Featured section, and the first 6 latest posts.
- **Test `/blog/2`:** Confirm that it renders ONLY the next 6 posts and the Hero/Featured sections are hidden.
- **Disable JS Test:** Turn off JavaScript in the browser and verify that navigating to page 2 and 3 works flawlessly via the real `<a href="... ">` links.
- **View Source code:** Ensure that the HTML output displays the complete list of posts for the given page directly (no client-side hydration required for visibility) and all images use `<Image />` for lazy loading.

---

## Risk & Mitigation Analysis

### 1. User Experience (UX) Flow
- **Risk:** "Show More" feels more modern as it appends content without a page reload. Traditional pagination can feel "stiff."
- **Mitigation:** Implement **Astro View Transitions**. This provides a seamless, app-like feel where only the content area updates, while maintaining a unique URL for SEO.

### 2. Build Scalability (Long Run)
- **Risk:** If the site reaches thousands of posts, build times increase (e.g., 1000 posts = 167 pages to generate).
- **Mitigation:** For a clinic blog, you'll likely never reach this scale. If you do, Astro supports Hybrid/SSR modes that can generate pages on-demand.

### 3. State Management
- **Risk:** Filtered states or scroll positions might be lost when moving between pages.
- **Mitigation:** Ensure any future filters use URL parameters. Use "scroll-restoration" techniques to keep the user's place.

### 4. SEO Strategy (Short-term)
- **Risk:** Potential for "Duplicate Content" if `/blog/1` and `/blog` are indexed separately.
- **Mitigation:** Included in the plan: strict canonical tags and `[...page].astro` logic that defaults the first page to the root `/blog`.

### Summary of Comparison
| Feature | Static Pagination (Proposed) | "Show More" (Current) |
| :--- | :--- | :--- |
| **SEO Indexing** | **Excellent** (Bots see all posts) | **Poor** (Bots only see first 4-8) |
| **Initial Hydration**| **Fast** (Small DOM) | **Slow** (Hidden content still loads) |
| **Mobile UX** | Good (Standard) | Excellent (Frictionless) |
| **Crawl Budget** | Optimized | Wasted (bots index page but miss content) |
| **Scalability** | High | Low (DOM bloat eventually kills performance)|

