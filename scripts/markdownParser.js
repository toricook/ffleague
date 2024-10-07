import { marked } from 'https://esm.sh/marked@4.0.0';
import { load } from 'https://esm.sh/js-yaml@4.1.0';

export const parseMarkdown = (markdown) => {
    const parts = markdown.split('---');
    let metadata = {};
    let content = markdown;

    if (parts.length > 1) {
        try {
            metadata = load(parts[1]);
            content = parts.slice(2).join('---').trim();
        } catch (e) {
            console.error('Error parsing YAML front matter:', e);
        }
    }

    const htmlContent = marked.parse(content);

    return { ...metadata, content: htmlContent };
};