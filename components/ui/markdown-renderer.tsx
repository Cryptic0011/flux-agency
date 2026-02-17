import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-neon-purple prose-strong:text-white prose-code:text-purple-300 prose-code:bg-dark-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-dark-700 prose-pre:border prose-pre:border-dark-600 prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:text-gray-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
