import { useState, useEffect } from 'react';
import type { Voice } from '../../../context/GlobalContext';

/**
 * Hook that manages the TTS voice, model, and language selections for subtitle generation.
 *
 * Auto-selects the first available voice when voices become available and none is selected.
 *
 * @param voices - Available voices from GlobalContext.
 * @returns Selected IDs and their setters.
 */
export const useTtsSelection = (voices: Voice[]) => {
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('VibeVoice-1.5B');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('Italian');

    useEffect(() => {
        if (voices.length > 0 && !selectedVoiceId) {
            setSelectedVoiceId(voices[0].id);
        }
    }, [voices, selectedVoiceId]);

    return {
        selectedVoiceId,
        setSelectedVoiceId,
        selectedModel,
        setSelectedModel,
        selectedLanguage,
        setSelectedLanguage,
    };
};
