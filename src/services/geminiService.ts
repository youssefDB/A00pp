

import { GoogleGenAI, Type } from "@google/genai";
import { QuizItem } from '../types';

// FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to follow coding guidelines and resolve TypeScript error.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please add it to your .env file or Vercel project settings.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const QUIZ_PROMPT = `
أنت خبير في كرة القدم. أنشئ سؤالاً واحداً صعبًا ومثيرًا للاهتمام حول كرة القدم.
يجب أن يكون السؤال باللغة العربية.
قدم ثلاثة خيارات للإجابة، واحد منها فقط صحيح.
حدد الإجابة الصحيحة.
أيضًا، قدم وصفًا باللغة الإنجليزية من 5 إلى 10 كلمات يمكن استخدامه كموجه لتوليد صورة فنية تعبر عن السؤال.
أريد أن تكون الإجابة بتنسيق JSON حصريًا. لا تقم بتضمين أي نص قبل أو بعد كائن JSON.
`;

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "سؤال كرة القدم باللغة العربية.",
    },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "مجموعة من 3 إجابات محتملة باللغة العربية.",
    },
    correctAnswer: {
      type: Type.STRING,
      description: "الإجابة الصحيحة من بين الخيارات باللغة العربية.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "موجه قصير وفني باللغة الإنجليزية لنموذج توليد الصور.",
    },
  },
  required: ["question", "options", "correctAnswer", "imagePrompt"],
};

async function generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${prompt}, dramatic, artistic, high detail`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image) {
        console.error("Image generation failed. API Response:", JSON.stringify(response, null, 2));
        throw new Error("Failed to generate image. The API returned no images.");
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function fetchQuizItem(): Promise<QuizItem> {
  console.log("Fetching new quiz item...");
  
  const textResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: QUIZ_PROMPT,
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    },
  });

  const rawJson = textResponse.text;
  
  if (!rawJson) {
    console.error("API Error: Received empty text response.", textResponse);
    throw new Error("Received an empty response from the Gemini API.");
  }

  const quizContent = JSON.parse(rawJson.trim());

  console.log("Generated quiz content:", quizContent);

  if (!quizContent.imagePrompt) {
      throw new Error("Failed to generate image prompt.");
  }
  
  const imageUrl = await generateImage(quizContent.imagePrompt);
  
  return {
    question: quizContent.question,
    options: quizContent.options,
    correctAnswer: quizContent.correctAnswer,
    imageUrl: imageUrl,
  };
}