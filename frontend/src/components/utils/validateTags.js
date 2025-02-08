export const validateTags = (inputText) => {
  const allowedTags = ["a", "code", "i", "strong"]; // Разрешенные теги
  const tagStack = [];
  const tagRegex = /<\/?([a-z]+)(?:\s+[^>]*)?>/g;
  let match;

  while ((match = tagRegex.exec(inputText)) !== null) {
    const tag = match[1];

    if (!allowedTags.includes(tag)) {
      return `Ошибка: Тег <${tag}> не разрешен. Используйте только ${allowedTags.join(", ")}.`;
    }

    if (!match[0].startsWith("</")) {
      // Открывающий тег
      tagStack.push(tag);
    } else {
      // Закрывающий тег
      if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tag) {
        return `Ошибка: Тег </${tag}> не закрывает соответствующий открывающий тег.`;
      }
      tagStack.pop();
    }
  }

  // Если остались незакрытые теги
  if (tagStack.length > 0) {
    return `Ошибка: Тег <${tagStack[tagStack.length - 1]}> не закрыт.`;
  }

  return ""; // Ошибок нет
};
