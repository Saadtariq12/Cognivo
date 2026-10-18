// Maximum questions allowed in each interview stage.
// The evaluator may move to the next stage before this limit.
const STAGE_LIMITS = {
  introduction: 1,
  technical: 4,
  projects: 4,
  problem_solving: 4,
  closing: 2,
};

const STAGE_ORDER = [
  "introduction",
  "technical",
  "projects",
  "problem_solving",
  "closing",
];

const getStageQuestionLimit = (stage) => STAGE_LIMITS[stage] ?? null;

const getNextStage = (stage) => {
  const stageIndex = STAGE_ORDER.indexOf(stage);
  return stageIndex >= 0 ? STAGE_ORDER[stageIndex + 1] ?? null : null;
};

const resolveInterviewProgression = ({
  currentStage,
  evaluatorStage,
  questionsAskedInCurrentStage,
}) => {
  const selectedStage = STAGE_ORDER.includes(evaluatorStage)
    ? evaluatorStage
    : currentStage;

  // The evaluator can end a stage early. Only override it when it stays too long.
  if (selectedStage !== currentStage) {
    return {
      nextStage: selectedStage,
      finishInterview: false,
    };
  }

  const stageLimit = getStageQuestionLimit(currentStage);
  if (stageLimit && questionsAskedInCurrentStage >= stageLimit) {
    const nextStage = getNextStage(currentStage);

    // Closing has no next stage, so reuse the existing completion flow.
    return {
      nextStage,
      finishInterview: nextStage === null,
    };
  }

  return {
    nextStage: currentStage,
    finishInterview: false,
  };
};

export {
  STAGE_LIMITS,
  STAGE_ORDER,
  getNextStage,
  getStageQuestionLimit,
  resolveInterviewProgression,
};
