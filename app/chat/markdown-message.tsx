import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownMessageProps = {
  content: string;
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-[15px] font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 [&:only-child]:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-300"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-zinc-600 pl-3 text-zinc-400 last:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-2 max-w-full overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-white/10 bg-zinc-900/80">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold text-zinc-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-white/8 px-3 py-2 text-zinc-300">
      {children}
    </td>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg border border-white/10 bg-zinc-950/90 p-3 text-xs leading-relaxed last:mb-0 sm:text-[13px]">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className={`font-mono text-zinc-200 ${className ?? ""}`}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-zinc-900/90 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-200">
        {children}
      </code>
    );
  },
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
