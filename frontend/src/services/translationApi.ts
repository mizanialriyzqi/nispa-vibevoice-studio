import { apiPostForm, apiGet } from './apiClient';

export interface TranslationSegment {
    index: number;
    start_ms: number;
    end_ms: number;
    text: string;
    original_text?: string;
    is_translated?: boolean;
}

export interface TranslateBatchResponse {
    segments: TranslationSegment[];
}

export interface OllamaModelsResponse {
    models: string[];
}

export const translationApi = {
    translateBatch: (body: FormData) =>
        apiPostForm<TranslateBatchResponse>('/api/translate-batch', body),

    getOllamaModels: () => apiGet<OllamaModelsResponse>('/api/ollama/models'),
};
