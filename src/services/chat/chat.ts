import type { Document as LangchainDoc } from "langchain/document";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { pineconeIndex } from "./config";


export const splitText = async (file: File, id: string) => {
  try {
    const splitter = new RecursiveCharacterTextSplitter();
    const loader = new PDFLoader(file);
    const docs = loader.loadAndSplit(splitter)
    return docs;
  } catch (error) {
    throw Error("Error splitting text");
  }
};

export const createEmbeddings = async (docs: LangchainDoc[], embeddings: OpenAIEmbeddings) => {
  try {
    const vectorStore = await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
    });
    return vectorStore;
  } catch (error) {
    throw Error("Error creating indexes");
  }
};

export const vectorize = async (id: string, file: File, openAIApiKey: string) => {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey
  });

  let chunks = await splitText(file, id);
  chunks = chunks.map((chunk) => ({
    ...chunk,
    metadata: { ...chunk.metadata, text: chunk.pageContent, id },
  }));
  await createEmbeddings(chunks, embeddings);
  return id;
};