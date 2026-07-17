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
