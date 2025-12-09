import Image from 'next/image';
import Contact from './Contact';
import RecipesSection from './RecipesSection';

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

export default function BlogDetail({ blog }: { blog: BlogItem }) {
  const author = blog.admin?.username ?? 'John Smith';
  const date = blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '';

  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-4">{blog.title}</h1>

        <div className="flex items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden" />
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{author}</div>
              <div className="text-xs">{date}</div>
            </div>
          </div>
        </div>

        {blog.notes && <p className="mt-4 text-zinc-600 dark:text-zinc-300">{blog.notes}</p>}
      </header>

      {blog.image_url && (
        <div className="mb-8 overflow-hidden rounded-2xl shadow">
          <Image src={blog.image_url} alt={blog.title} width={1200} height={600} className="object-cover w-full h-80" />
        </div>
      )}

      <div className="prose lg:prose-lg dark:prose-invert mx-auto">
        {(blog.content ?? []).map((section, idx) => (
          <section key={idx} className="mb-10">
            {section.heading && <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>}
            {section.body && <p className="text-zinc-700 dark:text-zinc-300">{section.body}</p>}
            {section.image && (
              <div className="mt-4 rounded overflow-hidden">
                <Image
                  src={section.image}
                  alt={section.heading ?? `section-${idx}`}
                  width={1200}
                  height={600}
                  className="w-full object-cover rounded-lg"
                />
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Quote / notes block */}
      {blog.notes && (
        <blockquote className="border-l-4 border-zinc-200 dark:border-zinc-700 pl-4 italic text-zinc-700 dark:text-zinc-300 my-8">
          {blog.notes}
        </blockquote>
      )}

      <Contact />
      {/* <RecipesSection /> */}
    </article>
  );
}
