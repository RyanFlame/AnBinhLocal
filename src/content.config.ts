import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string(),
    author: z.string().default('Admin'),
    authorRole: z.string().default('Chăm Sóc'), // e.g. "Trị Liệu", "Thảo Dược"
    date: z.date(),
    image: image(),
    category: z.string(),
    lang: z.enum(['vi', 'en']).default('vi'),
  }),
});

export const collections = {
  'blog': blogCollection,
};
