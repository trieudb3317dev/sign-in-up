import axios from 'axios';
import { notFound } from 'next/navigation';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';
import BlogDetail from '@/components/BlogDetail';

type ContentItem = {
  heading?: string;
  body?: string;
  image?: string;
};

type BlogItem = {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  content: ContentItem[];
  created_at: string;
  notes?: string;
  admin: {
    id: number;
    username: string;
    avatar: string;
  };
};

export default async function Page({ params }: { params: { id: string } }) {
  const resolved = await params;
  const id = Number(resolved?.id);
  if (Number.isNaN(id)) return notFound();

  // fetch blog (expects response shape { data: {...} } or {...} )
  let blog: BlogItem | null = null;
  try {
    const res = await axios.get(`${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/blogs/${id}`);
    blog = (res.data && (res.data.data ?? res.data)) as BlogItem;
  } catch (err) {
    return notFound();
  }
  if (!blog) return notFound();

  return <BlogDetail blog={blog} />;
}
