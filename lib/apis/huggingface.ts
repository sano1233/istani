import 'server-only';
import { HfInference } from '@huggingface/inference';

/**
 * Hugging Face Hub integration for AI models and datasets
 */
export const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Generate text using Hugging Face models
 */
export async function generateText(
  prompt: string,
  model: string = 'mistralai/Mistral-7B-Instruct-v0.2'
): Promise<string> {
  const result = await hf.textGeneration({
    model,
    inputs: prompt,
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
      top_p: 0.95,
      return_full_text: false,
    },
  });

  return result.generated_text;
}

/**
 * Get text embeddings for semantic search
 */
export async function getEmbeddings(
  texts: string[],
  model: string = 'sentence-transformers/all-MiniLM-L6-v2'
): Promise<number[][]> {
  const embeddings = await Promise.all(
    texts.map((text) => hf.featureExtraction({ model, inputs: text }))
  );
  return embeddings as number[][];
}

/**
 * Text classification
 */
export async function classifyText(
  text: string,
  model: string = 'distilbert-base-uncased-finetuned-sst-2-english'
): Promise<Array<{ label: string; score: number }>> {
  const result = await hf.textClassification({
    model,
    inputs: text,
  });

  return Array.isArray(result) ? result : [result];
}

/**
 * Question answering
 */
export async function answerQuestion(
  question: string,
  context: string,
  model: string = 'deepset/roberta-base-squad2'
): Promise<{ answer: string; score: number }> {
  return hf.questionAnswering({
    model,
    inputs: {
      question,
      context,
    },
  });
}

/**
 * Summarize text
 */
export async function summarizeText(
  text: string,
  model: string = 'facebook/bart-large-cnn'
): Promise<string> {
  const result = await hf.summarization({
    model,
    inputs: text,
    parameters: {
      max_length: 150,
      min_length: 30,
    },
  });

  return result.summary_text;
}

/**
 * Search Hugging Face models
 */
export async function searchModels(
  query: string,
  limit: number = 10
): Promise<any[]> {
  const response = await fetch(
    `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HF API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get model info
 */
export async function getModelInfo(modelId: string): Promise<any> {
  const response = await fetch(`https://huggingface.co/api/models/${modelId}`, {
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HF API error: ${response.statusText}`);
  }

  return response.json();
}
