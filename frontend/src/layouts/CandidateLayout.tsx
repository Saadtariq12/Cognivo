import type { ReactNode } from "react";
import { CognivoMark } from "../components/brand/CognivoMark";

type CandidateLayoutProps = {
  children: ReactNode;
};

export const CandidateLayout = ({ children }: CandidateLayoutProps) => {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-sky-soft via-white to-peach-soft" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute top-10 right-0 h-64 w-64 rounded-full bg-peach/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-magenta/10 blur-3xl" />
        <div className="absolute right-[18%] bottom-10 hidden h-40 w-40 rounded-full bg-cyan/15 blur-3xl sm:block" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[40rem] flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex items-center justify-center gap-2.5 sm:mb-10">
          <CognivoMark />
          <p className="text-lg font-semibold tracking-[-0.04em] text-ink">
            Cognivo
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
