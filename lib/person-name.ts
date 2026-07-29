export function normalisePersonName(value: string): string {
  const compactName = value.trim().replace(/\s+/g, " ");

  if (!compactName) {
    return "";
  }

  const lowerCaseName = compactName.toLowerCase();
  return lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.slice(1);
}

export function formatPersonName({
  firstName,
  middleName,
  lastName,
}: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): string {
  return [firstName, middleName, lastName]
    .filter((name): name is string => Boolean(name?.trim()))
    .map(normalisePersonName)
    .join(" ");
}
