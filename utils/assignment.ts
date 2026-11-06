export const canCompleteAssignments = (
  spinners: string[],
  receivers: string[]
): boolean => {
  if (spinners.length !== receivers.length) return false;

  const receiverToSpinner = new Map<string, string>();

  const assign = (spinner: string, visited: Set<string>): boolean => {
    for (const receiver of receivers) {
      if (receiver === spinner || visited.has(receiver)) continue;
      visited.add(receiver);

      const previousSpinner = receiverToSpinner.get(receiver);
      if (!previousSpinner || assign(previousSpinner, visited)) {
        receiverToSpinner.set(receiver, spinner);
        return true;
      }
    }

    return false;
  };

  return spinners.every((spinner) => assign(spinner, new Set()));
};

export const getViableRecipients = (
  spinners: string[],
  receivers: string[],
  currentSpinner: string
): string[] => {
  if (!spinners.includes(currentSpinner)) return [];

  return receivers.filter((candidate) => {
    if (candidate === currentSpinner) return false;

    const remainingSpinners = spinners.filter((spinner) => spinner !== currentSpinner);
    const remainingReceivers = receivers.filter((receiver) => receiver !== candidate);

    return canCompleteAssignments(remainingSpinners, remainingReceivers);
  });
};