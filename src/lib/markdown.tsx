import type { ReactNode } from 'react';

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      tokens.push(<strong key={`${keyPrefix}-b-${i++}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      tokens.push(<em key={`${keyPrefix}-i-${i++}`}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      tokens.push(<code key={`${keyPrefix}-c-${i++}`}>{match[4]}</code>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

export function SimpleMarkdown({ text }: { text: string }) {
  if (!text.trim()) return null;
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length) {
      const items = listBuffer;
      blocks.push(
        <ul key={key}>
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item, `${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
    } else {
      flushList(`list-${idx}`);
      if (trimmed.length === 0) {
        blocks.push(<br key={`br-${idx}`} />);
      } else {
        blocks.push(<p key={`p-${idx}`}>{parseInline(trimmed, `p-${idx}`)}</p>);
      }
    }
  });
  flushList('list-end');

  return <div className="markdown-preview">{blocks}</div>;
}
