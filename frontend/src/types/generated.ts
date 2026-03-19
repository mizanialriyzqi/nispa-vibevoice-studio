/**
 * Types for TTS-generated segment previews and subtitle preview data.
 */

export interface GeneratedSegment {
    index: number;
    text: string;
    audioUrl: string;
    audioBase64: string;
    voice_id: string;
    model_name: string;
    language: string;
}

export interface PreviewSegment {
    index: number;
    start_ms: number;
    end_ms: number;
    text: string;
    duration_sec?: number;
}

export interface PreviewData {
    segments: PreviewSegment[];
    original_count: number;
    final_count: number;
}
