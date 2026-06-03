import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import { BLOG_POSTS } from "@/data/mockData";

function renderContent(content) {
  if (!content) return null;
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="font-heading text-3xl text-white tracking-wide mt-8 mb-4">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="font-heading text-2xl text-[#2EC4B6] tracking-wide mt-6 mb-3">{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <li key={i} className="text-zinc-400 text-sm leading-relaxed mb-2 ml-4">{line.slice(2)}</li>;
    if (line.match(/^\d\. /)) return <li key={i} className="text-zinc-400 text-sm leading-relaxed mb-2 ml-4">{line.slice(3)}</li>;
    if (line.trim() === "") return <br key={i} />;
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    return <p key={i} className="text-zinc-400 text-base leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

export default function BlogPost() {
  const { id } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === id || String(p.id) === id);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!post) {
    return (
      <div className="pt-24 min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-4xl text-white mb-4">POST NOT FOUND</h1>
        <p className="text-zinc-400 mb-8">This article doesn't exist or may have been removed.</p>
        <Link to="/blog" className="btn-primary text-sm">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title={post.title} description={post.excerpt} />
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link to="/blog" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors duration-200 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
      {post.cover_image && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="aspect-[21/9] overflow-hidden">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}
      <article className="max-w-4xl mx-auto px-6 pb-20">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2EC4B6]">{post.category}</span>
            <div className="flex items-center gap-1 text-zinc-600 text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white leading-none mb-4 tracking-wide">{post.title}</h1>
          <p className="text-zinc-400 text-base leading-relaxed border-l-4 border-[#2EC4B6] pl-4 mb-8">{post.excerpt}</p>
          <div className="section-divider mb-8" />
        </div>
        <div className="prose-dark">{renderContent(post.content)}</div>
        <div className="mt-16 bg-[#121212] border border-[#2EC4B6]/30 p-8">
          <h3 className="font-heading text-3xl text-white mb-3">READY TO START TRAINING?</h3>
          <p className="text-zinc-400 text-sm mb-6">Book a FREE trial session at Cali Terrain, Secunderabad.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://wa.me/918688458907?text=Hi%2C%20I%20want%20to%20book%20a%20free%20trial%20at%20Cali%20Terrain." target="_blank" rel="noopener noreferrer" className="btn-primary text-sm justify-center">Book Free Trial <ChevronRight className="w-4 h-4" /></a>
            <Link to="/blog" className="btn-secondary text-sm justify-center">More Articles</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
