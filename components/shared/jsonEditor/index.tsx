import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";

type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[];

type Props = {
  value: JsonValue;
  onChange: (val: JsonValue) => void;
  height?: number;
};

export function JsonEditor({ value, onChange, height = 200 }: Props) {
  const [text, setText] = useState(JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value ?? {}, null, 2));
  }, [value]);

  const handleChange = (val: string) => {
    setText(val);

    try {
      const parsed = JSON.parse(val);
      onChange(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // ✅ syntax highlight by HTML
  const highlighted = useMemo(() => {
    try {
      const json = JSON.stringify(JSON.parse(text), null, 2);

      return json.replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+\b)/g,
        (match) => {
          let cls = "text-green-400 dark:text-green-700"; // number
          if (/^"/.test(match)) {
            cls = /:$/.test(match)
              ? "text-blue-400 dark:text-blue-700" // key
              : "text-yellow-300 dark:text-yellow-700"; // string
          } else if (/true|false/.test(match)) {
            cls = "text-purple-400 dark:text-purple-700";
          } else if (/null/.test(match)) {
            cls = "text-gray-400 dark:text-green-700";
          }

          return `<span class="${cls}">${match}</span>`;
        },
      );
    } catch {
      return text;
    }
  }, [text]);

  return (
    <div className="space-y-2">
      <div className="relative font-mono text-sm rounded-lg bg-dark text-light">
        {/* Highlight layer */}
        <pre
          className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />

        {/* Textarea */}
        <Textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          style={{ height }}
          className="relative w-full bg-transparent text-transparent caret-white p-3 resize-none outline-none"
        />
      </div>
      {error && <span className="text-error w-full text-sm">{error}</span>}
    </div>
  );
}
