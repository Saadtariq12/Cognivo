import type { ReactNode } from "react";
import { CognivoMark } from "../components/brand/CognivoMark";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-dvh bg-white lg:grid lg:grid-cols-[minmax(280px,1.05fr)_minmax(360px,0.95fr)]">
      <section className="relative isolate overflow-x-clip bg-linear-to-br from-sky-soft via-white to-peach-soft px-5 py-6 sm:px-8 sm:py-8 lg:flex lg:min-h-dvh lg:items-center lg:overflow-hidden lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-16 -left-10 h-90 w-130 rounded-full bg-sky/52 blur-3xl" />
          <div className="absolute top-20 right-4 h-70 w-80 rounded-full bg-peach/70 blur-3xl" />
          <div className="absolute bottom-6 left-2 h-100 w-90 rounded-full bg-magenta/40 blur-3xl" />
          <div className="absolute right-14 bottom-20 hidden h-50 w-80 rounded-full bg-cyan/60 blur-3xl sm:block" />
        </div>

        <div className="relative z-10 w-full min-w-0 max-w-md">
          <div className="flex items-center gap-2.5">
            <CognivoMark />
            <p className="text-[1.5rem] font-semibold tracking-[-0.04em] text-ink">
              Cognivo
            </p>
          </div>

          <p className="mt-5 w-full text-[1.22rem] leading-7 font-semibold tracking-[-0.03em] text-ink sm:mt-7 sm:text-[1.85rem] sm:leading-snug lg:text-[2.05rem] lg:leading-[1.25]">
            Screen smarter, Hire faster.
          </p>
          <p className="mt-3 w-full text-[14px] leading-6 text-ink-soft sm:mt-4 sm:text-[15.5px] sm:leading-7 lg:text-[16.5px] lg:leading-8">
            Turn every candidate conversation into
            <br className="sm:hidden" /> clearer hiring insight.
          </p>
          <div className="mt-5 hidden h-px w-24 bg-linear-to-r from-sky via-magenta/70 to-peach lg:block" />
        </div>
      </section>

      <main className="flex items-start justify-center px-5 py-7 sm:px-8 sm:py-10 lg:items-center lg:px-12 lg:py-12">
        <div className="w-full max-w-[420px] min-w-0">
          <h1 className="text-[1.55rem] leading-tight font-semibold tracking-[-0.03em] text-wrap text-ink sm:text-[1.7rem]">
            {title}
          </h1>
          <p className="mt-2 w-full text-sm leading-6 text-ink-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-sm text-ink-soft">{footer}</div>
        </div>
      </main>
    </div>
  );
};
