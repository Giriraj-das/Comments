export const validateTags = (inputText) => {
  const allowedTags = ["a", "code", "i", "strong"];
  const tagStack = [];
  const tagRegex = /<\/?([a-z]+)(?:\s+[^>]*)?>/g;
  let match;

  while ((match = tagRegex.exec(inputText)) !== null) {
    const tag = match[1];

    if (!allowedTags.includes(tag)) {
      return `Error: tag <${tag}> not allowed. Use oly ${allowedTags.join(", ")}.`;
    }

    if (!match[0].startsWith("</")) {
      tagStack.push(tag);
    } else {
      if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tag) {
        return `Error: tag </${tag}> unclosed.`;
      }
      tagStack.pop();
    }
  }

  if (tagStack.length > 0) {
    return `Error: tag <${tagStack[tagStack.length - 1]}> unclosed.`;
  }

  return "";
};
