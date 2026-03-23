// src/utils/assets.ts
import type { ImageMetadata } from 'astro';

/**
 * ELITE BULK ASSET LOADER
 * This uses Vite's glob feature to import all images from the src/assets folder
 * in one single bulk operation. It automatically identifies all supported formats.
 */

// 1. Bulk import all images in src/assets and any subfolders (glob recursive **)
// We use { eager: true } to get the metadata immediately for use in Astro frontmatter.
const allImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{png,jpg,jpeg,webp,avif}', { eager: true });

/**
 * Get an image from the assets folder by its relative path
 * @param path The relative path to the image, e.g., 'Med.webp' or 'Ingri/Ginseng.webp'
 */
export function getImageByPath(path: string): any {
  // Normalize the query path to match the glob structure
  const normalizedPath = `/src/assets/${path.startsWith('/') ? path.slice(1) : path}`;
  
  if (!allImages[normalizedPath]) {
    console.warn(`[AssetLoader] Image not found: ${normalizedPath}. Please check the filename in your assets folder.`);
    return null;
  }
  
  return allImages[normalizedPath].default;
}

/**
 * Access the entire collection directly if needed
 */
export const assetLibrary = allImages;
