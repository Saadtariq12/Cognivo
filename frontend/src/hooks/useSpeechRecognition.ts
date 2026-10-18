import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionConstructor,
  type BrowserSpeechRecognition,
} from "../lib/speech";

type UseSpeechRecognitionOptions = {
  onFinalTranscript: (transcript: string) => void;
  disabled?: boolean;
};

export const useSpeechRecognition = ({
  onFinalTranscript,
  disabled = false,
}: UseSpeechRecognitionOptions) => {
  const [supported] = useState(() => Boolean(getSpeechRecognitionConstructor()));
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const lastFinalResultIndexRef = useRef(-1);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    if (disabled || !supported || listening) {
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    lastFinalResultIndexRef.current = -1;
    setError("");

    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal && index > lastFinalResultIndexRef.current) {
          lastFinalResultIndexRef.current = index;
          const transcript = result[0]?.transcript.trim();
          if (transcript) {
            onFinalTranscriptRef.current(transcript);
          }
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(
          event.error === "not-allowed"
            ? "Microphone permission was not granted. You can continue by typing your answer."
            : "Voice input stopped. You can continue by typing your answer.",
        );
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("Voice input could not start. You can continue by typing your answer.");
    }
  }, [disabled, listening, supported]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  useEffect(() => {
    if (disabled && listening) {
      stopListening();
    }
  }, [disabled, listening, stopListening]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    },
    [],
  );

  return {
    supported,
    listening,
    error,
    toggleListening,
    stopListening,
  };
};
