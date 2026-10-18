import ollama from "ollama";

const generateWithOllama = async (prompt) => {
  const response = await ollama.chat({
    model: "qwen3:4b-instruct",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    options: {
      temperature: 0,
    },
  });

  return response.message.content;
};

export { generateWithOllama };
