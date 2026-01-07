import React from 'react'
import Layout from '@theme/Layout'
import Comment from '@site/src/components/Comment'

export default function Guestbook(): JSX.Element {
  return (
    <Layout title="留言箱" description="欢迎留言">
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-semibold">留言箱</h1>
          <p className="text-secondary">欢迎在这里留下你的想法和建议</p>
        </div>
        
        <div className="glass-card rounded-lg p-6">
          <Comment />
        </div>
      </main>
    </Layout>
  )
}
