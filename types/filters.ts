export type FilterOption = {
  label: string;
  value: string;
};

export type FilterControl =
  | {
      type: "search";
      key: string;
      placeholder: string;
      ariaLabel: string;
      className?: string;
    }
  | {
      type: "select";
      key: string;
      label: string;
      options: readonly FilterOption[];
      emptyLabel: string;
      className?: string;
    }
  | {
      type: "date";
      key: string;
      ariaLabel: string;
      className?: string;
    };

export type FilterValues = Record<string, string | undefined>;

export type PageSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type FilterUpdates = Record<string, string | null | undefined>;

export type UseUrlFiltersResult = {
  clearFilters: (keys: readonly string[]) => void;
  getFilterValue: (key: string) => string;
  isPending: boolean;
  scheduleSearchUpdate: (key: string, value: string) => void;
  updateFilters: (updates: FilterUpdates) => void;
};
