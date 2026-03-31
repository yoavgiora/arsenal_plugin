function runFlowSteps(steps, stepIndex = 0) {
  if (stepIndex >= steps.length) {
    return;
  }

  const step = steps[stepIndex];

  if (step.waitMs !== undefined) {
    window.setTimeout(() => {
      runFlowSteps(steps, stepIndex + 1);
    }, step.waitMs);
    return;
  }

  const shouldContinue = step.run();

  if (shouldContinue === false) {
    return;
  }

  runFlowSteps(steps, stepIndex + 1);
}

function actionStep(run) {
  return { run };
}

function waitStep(waitMs) {
  return { waitMs };
}
