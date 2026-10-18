import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Navigate, useParams } from "react-router-dom";
import { startInterview, submitInterviewAnswer, type InterviewQuestion } from "../api/interview";
import { ApiError } from "../api/client";
import { readCandidateInterviewAccess } from "../auth/candidateInterview";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { CandidateLayout } from "../layouts/CandidateLayout";
import { speakText, stopSpeech } from "../lib/speech";

const getQuestion = (value: unknown): InterviewQuestion | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const question = value as Partial<InterviewQuestion>;
  return typeof question.id === "string" && typeof question.question === "string"
    ? { id: question.id, question: question.question }
    : null;
};

const questionStorageKey = (sessionId: string) =>
  `cognivo.candidate.interview.question.${sessionId}`;

type CachedInterviewState = {
  question: InterviewQuestion;
  previousAnswerId?: string;
};

const readCachedInterviewState = (sessionId: string): CachedInterviewState | null => {
  try {
    const cached = sessionStorage.getItem(questionStorageKey(sessionId));
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached) as { question?: unknown; previousAnswerId?: unknown };
    const cachedQuestion = getQuestion(parsed.question ?? parsed);
    return cachedQuestion
      ? {
          question: cachedQuestion,
          previousAnswerId:
            typeof parsed.previousAnswerId === "string" ? parsed.previousAnswerId : undefined,
        }
      : null;
  } catch {
    sessionStorage.removeItem(questionStorageKey(sessionId));
    return null;
  }
};

const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 4 16 8-16 8 3-8-3-8Z" />
    <path d="M7 12h13" />
  </svg>
);

const SpeakerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10v4h3l4 3V7l-4 3H4Z" />
    <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="8" y="3" width="8" height="12" rx="4" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
  </svg>
);

const LoadingState = ({ children }: { children: string }) => (
  <div className="flex min-h-44 items-center justify-center rounded-2xl border border-line bg-white/85 px-6 text-center shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)]">
    <p className="flex items-center gap-2.5 text-sm font-medium text-ink-soft" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-royal/25 border-t-royal" aria-hidden="true" />
      {children}
    </p>
  </div>
);

export const CandidateWelcomePage = () => {
  const { token } = useParams();
  const access = readCandidateInterviewAccess();
  const cachedInterviewState = access ? readCachedInterviewState(access.session_id) : null;
  const [question, setQuestion] = useState<InterviewQuestion | null>(() =>
    cachedInterviewState?.question ?? null,
  );
  const [answer, setAnswer] = useState("");
  const [starting, setStarting] = useState(() => !access || !cachedInterviewState);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [previousAnswerId, setPreviousAnswerId] = useState<string | undefined>(
    () => cachedInterviewState?.previousAnswerId,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startAttemptedRef = useRef(false);
  const appendTranscript = useCallback((transcript: string) => {
    setAnswer((currentAnswer) =>
      currentAnswer.trim() ? `${currentAnswer.trimEnd()} ${transcript}` : transcript,
    );
  }, []);
  const {
    supported: speechInputSupported,
    listening: speechListening,
    error: speechError,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    onFinalTranscript: appendTranscript,
    disabled: starting || submitting || completed || !question,
  });

  const loadQuestion = useCallback(async () => {
    if (!access) {
      return;
    }

    setStarting(true);
    setError("");
    try {
      const response = await startInterview(access);
      const nextQuestion = getQuestion(response.data.stored_question);
      if (!nextQuestion) {
        throw new Error("The interview question was not returned.");
      }
      setQuestion(nextQuestion);
      sessionStorage.setItem(
        questionStorageKey(access.session_id),
        JSON.stringify({ question: nextQuestion }),
      );
    } catch {
      setError("We couldn't start your interview. Please try again.");
    } finally {
      setStarting(false);
    }
  }, [access]);

  useEffect(() => {
    if (!access || question || startAttemptedRef.current) {
      return;
    }
    startAttemptedRef.current = true;

    void loadQuestion();
  }, [access, loadQuestion, question]);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [answer]);

  useEffect(() => {
    if (question && !submitting) {
      textareaRef.current?.focus();
    }
  }, [question, submitting]);

  useEffect(() => {
    if (!question || starting || completed) {
      return;
    }

    speakText(question.question);
    return stopSpeech;
  }, [completed, question, starting]);

  useEffect(() => {
    if (completed) {
      stopListening();
      stopSpeech();
    }
  }, [completed, stopListening]);

  if (!access) {
    return <Navigate to={token ? `/interview/${token}` : "/login"} replace />;
  }

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedAnswer = answer.trim();
    if (!question || submitting || !trimmedAnswer) {
      return;
    }

    stopListening();
    setSubmitting(true);
    setError("");
    try {
      const response = await submitInterviewAnswer({
        access,
        questionId: question.id,
        answer: trimmedAnswer,
        previousAnswerId,
      });

      if (response.interviewCompleted) {
        stopListening();
        stopSpeech();
        setCompleted(true);
        setQuestion(null);
        sessionStorage.removeItem(questionStorageKey(access.session_id));
        return;
      }

      const nextQuestion = getQuestion(response.data.question);
      if (!nextQuestion) {
        throw new Error("The next interview question was not returned.");
      }
      setPreviousAnswerId(question.id);
      setQuestion(nextQuestion);
      setAnswer("");
      sessionStorage.setItem(
        questionStorageKey(access.session_id),
        JSON.stringify({ question: nextQuestion, previousAnswerId: question.id }),
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof ApiError && submissionError.status === 401
          ? "Your interview access has expired. Please reopen your invitation to continue."
          : "We couldn't submit your answer. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const handleVoiceToggle = () => {
    if (!speechListening) {
      // Stop any remaining question speech before opening the microphone.
      stopSpeech();
    }
    toggleListening();
  };

  return (
    <CandidateLayout>
      <div className="flex flex-1 flex-col justify-center pb-8 sm:pb-12">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-royal uppercase">
            Interview in progress
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-[1.75rem]">
            Take your time with each answer
          </h1>
        </div>

        {completed ? (
          <div className="rounded-2xl border border-line bg-white/90 px-6 py-12 text-center shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)] sm:px-10">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sky-soft text-royal" aria-hidden="true">✓</div>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-ink">Interview completed</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
              Thank you for completing your interview. Your responses have been submitted successfully.
            </p>
          </div>
        ) : starting ? (
          <LoadingState>Preparing your first question...</LoadingState>
        ) : error && !question ? (
          <div className="rounded-2xl border border-line bg-white/90 px-6 py-10 text-center shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)] sm:px-10">
            <p className="text-sm leading-6 text-magenta">{error}</p>
            <button type="button" onClick={() => { startAttemptedRef.current = true; void loadQuestion(); }} className="mt-5 rounded-[10px] bg-linear-to-r from-royal to-indigo px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(47,91,234,0.7)] transition hover:from-[#2751d6] hover:to-[#5b3ad0] focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:ring-offset-2 focus-visible:outline-none">
              Try again
            </button>
          </div>
        ) : question ? (
          <>
            <section className="rounded-2xl border border-line bg-white/90 px-6 py-8 shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)] sm:px-10 sm:py-10" aria-live="polite" aria-label="Current interview question">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft/75 uppercase">Question</p>
                <button type="button" onClick={() => { speakText(question.question); }} aria-label="Replay question aloud" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-white text-royal transition hover:border-royal/30 hover:bg-sky-soft focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:ring-offset-2 focus-visible:outline-none">
                  <SpeakerIcon />
                </button>
              </div>
              <p className="mt-4 text-[1.15rem] leading-8 font-medium tracking-[-0.02em] text-ink sm:text-[1.3rem] sm:leading-9">{question.question}</p>
            </section>

            <form onSubmit={handleSubmit} className="mt-5" noValidate>
              <div className="rounded-2xl border border-line bg-white/95 p-2 shadow-[0_16px_40px_-28px_rgba(18,26,51,0.4)] transition focus-within:border-royal/50 focus-within:ring-4 focus-within:ring-sky/15">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  aria-label="Your answer"
                  disabled={submitting}
                  rows={1}
                  className="block max-h-45 min-h-12 w-full resize-none overflow-y-auto bg-transparent px-3 py-3 text-[15px] leading-6 text-ink outline-none placeholder:text-ink-soft/55 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="flex items-center justify-between gap-3 px-2 pb-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <button type="button" onClick={handleVoiceToggle} disabled={!speechInputSupported || starting || submitting || completed} aria-label={speechListening ? "Stop listening" : "Start voice input"} aria-pressed={speechListening} className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] px-2.5 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:ring-offset-2 focus-visible:outline-none ${speechListening ? "bg-peach-soft text-magenta" : "border border-line bg-white text-royal hover:border-royal/30 hover:bg-sky-soft"} disabled:cursor-not-allowed disabled:opacity-45`}>
                      <MicrophoneIcon />
                      <span className="hidden sm:inline">{speechListening ? "Listening..." : "Speak"}</span>
                    </button>
                    <p className="truncate text-[11px] text-ink-soft/70">{speechListening ? "Speak your answer, then stop listening." : "Shift + Enter for a new line"}</p>
                  </div>
                  <button type="submit" disabled={submitting || !answer.trim()} aria-label="Send answer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-royal text-white transition hover:bg-indigo focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-royal/35">
                    <SendIcon />
                  </button>
                </div>
              </div>
              {!speechInputSupported ? <p className="mt-3 text-center text-xs text-ink-soft">Voice input is not supported in this browser. You can continue by typing your answer.</p> : null}
              {speechError ? <p className="mt-3 rounded-[10px] border border-magenta/20 bg-peach-soft px-3 py-2.5 text-center text-[13px] text-magenta" role="alert">{speechError}</p> : null}
              {submitting ? <p className="mt-3 text-center text-xs text-ink-soft" role="status" aria-live="polite">Reviewing your response and preparing the next question...</p> : null}
              {error ? <p className="mt-3 rounded-[10px] border border-magenta/20 bg-peach-soft px-3 py-2.5 text-center text-[13px] text-magenta" role="alert">{error}</p> : null}
            </form>
          </>
        ) : null}
      </div>
    </CandidateLayout>
  );
};
