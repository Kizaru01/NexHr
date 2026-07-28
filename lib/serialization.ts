export function serialiseDate(value: Date): string;
export function serialiseDate(value?: Date | null): string | null;
export function serialiseDate(value?: Date | null): string | null {
  return value?.toISOString() ?? null;
}
