import React, { useState } from 'react'

type Item = { slug: string; title: string; summary?: string; published_at?: string }

export default function SearchApp() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<Item[]>([])
  const [docs, setDocs] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setDocs(data.docs || [])
    setLoading(false)
  }

  return (
    <div className="glass-card p-6">
      <div className="flex gap-2">
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="搜索文章或文档"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') search()
          }}
        />
        <button className="button-pop rounded-md bg-black px-4 py-2 text-white" onClick={search}>
          搜索
        </button>
      </div>
      {loading && <div className="mt-4 text-sm text-slate-500">搜索中...</div>}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-500">博客</h3>
        <div className="mt-3 space-y-2">
          {posts.map((post) => (
            <a key={post.slug} className="block rounded-md p-3 hover:bg-black/5" href={`/blog/${post.slug}`}>
              <div className="font-medium">{post.title}</div>
              {post.summary && <div className="text-sm text-slate-500">{post.summary}</div>}
            </a>
          ))}
          {posts.length === 0 && !loading && <div className="text-sm text-slate-400">暂无结果</div>}
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-500">文档</h3>
        <div className="mt-3 space-y-2">
          {docs.map((doc) => (
            <a key={doc.slug} className="block rounded-md p-3 hover:bg-black/5" href={`/docs/${doc.slug}`}>
              <div className="font-medium">{doc.title}</div>
              {doc.summary && <div className="text-sm text-slate-500">{doc.summary}</div>}
            </a>
          ))}
          {docs.length === 0 && !loading && <div className="text-sm text-slate-400">暂无结果</div>}
        </div>
      </div>
    </div>
  )
}
