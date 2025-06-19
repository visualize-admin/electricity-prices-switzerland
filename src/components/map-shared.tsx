export type HoverState =
  | {
      x: number;
      y: number;
      id: string;
      type: "municipality";
    }
  | {
      x: number;
      y: number;
      id: string;
      type: "canton";
      value: number;
      label: string;
    }
  | {
      x: number;
      y: number;
      id: string;
      type: "operator";
      values: {
        operatorName: string;
        value: number;
      }[];
    };
