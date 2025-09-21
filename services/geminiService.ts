import { GoogleGenAI, Type } from '@google/genai';
import { QuizItem, Language, QuizLength } from '../types';

const getTocPrompt = (lang: Language): string => {
  if (lang === Language.VI) {
    return `
      Bạn là một trợ lý chuyên gia phân tích tài liệu.
      Nhiệm vụ của bạn là phân tích các tệp được cung cấp và xác định các chương, phần hoặc chủ đề chính.
      Trả về danh sách các tiêu đề chủ đề này dưới dạng một mảng JSON gồm các chuỗi.
      Ví dụ: ["Chương 1: Giới thiệu", "Chương 2: Các khái niệm cốt lõi"].
      Giữ các tiêu đề ngắn gọn và đúng với nội dung trong tài liệu. Đảm bảo kết quả là một JSON array hợp lệ.
    `;
  }
  return `
    You are an expert document analyzer.
    Your task is to analyze the provided files and identify the main chapters, sections, or topics.
    Return a list of these topic titles as a JSON array of strings.
    For example: ["Chapter 1: Introduction", "Chapter 2: Core Concepts"].
    Keep the titles concise and true to the document's content. Ensure the output is a valid JSON array.
  `;
};

const getQuizPrompt = (lang: Language, maxQuestions: QuizLength, selectedTopics: string[]): string => {
  const topicsString = selectedTopics.join('; ');
  if (lang === Language.VI) {
    return `
      Bạn là một chuyên gia tạo nội dung giáo dục.
      Nhiệm vụ của bạn là phân tích nội dung tài liệu được cung cấp và tạo ra một bài kiểm tra trắc nghiệm.
      QUAN TRỌNG: Các câu hỏi phải CHỈ dựa trên nội dung có trong các chủ đề sau: ${topicsString}.
      Với tổng số ${maxQuestions} câu hỏi, hãy thực hiện các bước sau cho mỗi câu:
      1. Sáng tạo một câu hỏi rõ ràng, phù hợp dựa trên nội dung tài liệu.
      2. Cung cấp bốn phương án trả lời riêng biệt (A, B, C, D).
      3. Đảm bảo chỉ có một phương án đúng.
      4. Xác định chỉ số (index) của phương án đúng (0 cho A, 1 cho B, v.v.).
      5. Viết một lời giải thích ngắn gọn, súc tích về lý do tại sao đáp án đó đúng, dựa vào nội dung tài liệu.
      6. Định dạng đầu ra: Trả về kết quả dưới dạng một đối tượng JSON hợp lệ tuân thủ schema đã cho. Toàn bộ nội dung phải bằng ngôn ngữ gốc của tài liệu.
    `;
  }
  return `
    You are an expert in creating educational content.
    Your task is to analyze the provided document content and create a multiple-choice quiz.
    IMPORTANT: The quiz questions should ONLY be based on the content found under the following topics: ${topicsString}.
    For each of the ${maxQuestions} questions, please:
    1. Create a clear and relevant question based on the document's content.
    2. Provide four distinct answer options (A, B, C, D).
    3. Ensure only one option is correct.
    4. Identify the correct option's index (0 for A, 1 for B, etc.).
    5. Write a concise explanation for why the answer is correct, referencing the document's content.
    6. Format Output: Return the result as a valid JSON object that adheres to the provided schema. All content must be in the original language of the document.
  `;
};

const getTextQuizPrompt = (lang: Language, maxQuestions: QuizLength): string => {
    if (lang === Language.VI) {
      return `
        Bạn là một chuyên gia tạo nội dung giáo dục.
        Nhiệm vụ của bạn là phân tích đoạn văn bản được cung cấp và tạo ra một bài kiểm tra trắc nghiệm.
        Với tổng số ${maxQuestions} câu hỏi, hãy thực hiện các bước sau cho mỗi câu:
        1. Sáng tạo một câu hỏi rõ ràng, phù hợp dựa trên nội dung văn bản.
        2. Cung cấp bốn phương án trả lời riêng biệt (A, B, C, D).
        3. Đảm bảo chỉ có một phương án đúng.
        4. Xác định chỉ số (index) của phương án đúng (0 cho A, 1 cho B, v.v.).
        5. Viết một lời giải thích ngắn gọn, súc tích về lý do tại sao đáp án đó đúng, dựa vào nội dung văn bản.
        6. Định dạng đầu ra: Trả về kết quả dưới dạng một đối tượng JSON hợp lệ tuân thủ schema đã cho. Toàn bộ nội dung phải bằng ngôn ngữ gốc của văn bản.
      `;
    }
    return `
      You are an expert in creating educational content.
      Your task is to analyze the provided text and create a multiple-choice quiz.
      For each of the ${maxQuestions} questions, please:
      1. Create a clear and relevant question based on the text content.
      2. Provide four distinct answer options (A, B, C, D).
      3. Ensure only one option is correct.
      4. Identify the correct option's index (0 for A, 1 for B, etc.).
      5. Write a concise explanation for why the answer is correct, referencing the text content.
      6. Format Output: Return the result as a valid JSON object that adheres to the provided schema. All content must be in the original language of the text.
    `;
  };


const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctOptionIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
    },
    required: ["question", "options", "correctOptionIndex", "explanation"]
  },
};

const tocSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
};

export const generateTocFromFiles = async (
  files: { data: string; mimeType: string }[],
  lang: Language
): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fileParts = files.map(file => ({
        inlineData: { data: file.data, mimeType: file.mimeType },
    }));

    const textPart = { text: getTocPrompt(lang) };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...fileParts, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: tocSchema,
            },
        });

        const jsonString = response.text.trim();
        const tocData = JSON.parse(jsonString);

        if (Array.isArray(tocData) && tocData.every(item => typeof item === 'string')) {
            return tocData;
        } else {
            throw new Error("Invalid ToC data format received from API.");
        }
    } catch (error) {
        console.error('Error generating ToC from Gemini:', error);
        throw new Error('Failed to generate table of contents. The document might be unreadable.');
    }
};


export const generateQuizFromSelection = async (
  files: { data: string; mimeType: string }[],
  lang: Language,
  maxQuestions: QuizLength,
  selectedTopics: string[]
): Promise<QuizItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const fileParts = files.map(file => ({
    inlineData: { data: file.data, mimeType: file.mimeType },
  }));

  const textPart = { text: getQuizPrompt(lang, maxQuestions, selectedTopics) };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [...fileParts, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema,
      },
    });

    const jsonString = response.text.trim();
    const quizData = JSON.parse(jsonString);
    
    if (Array.isArray(quizData) && quizData.every(item => 'question' in item && 'options' in item)) {
        return quizData as QuizItem[];
    } else {
        throw new Error("Invalid quiz data format received from API.");
    }

  } catch (error) {
    console.error('Error generating quiz from Gemini:', error);
    throw new Error('Failed to generate quiz. The AI model may be overloaded or the document could not be processed.');
  }
};

export const generateQuizFromText = async (
    text: string,
    lang: Language,
    maxQuestions: QuizLength
  ): Promise<QuizItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
    const prompt = getTextQuizPrompt(lang, maxQuestions);
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${prompt}\n\n${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: quizSchema,
        },
      });
  
      const jsonString = response.text.trim();
      const quizData = JSON.parse(jsonString);
      
      if (Array.isArray(quizData) && quizData.every(item => 'question' in item && 'options' in item)) {
          return quizData as QuizItem[];
      } else {
          throw new Error("Invalid quiz data format received from API.");
      }
  
    } catch (error) {
      console.error('Error generating quiz from text via Gemini:', error);
      throw new Error('Failed to generate quiz from the provided text.');
    }
  };