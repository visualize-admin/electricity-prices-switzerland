import * as d3Array from "d3-array";

declare module "d3-array" {
  export function groups<TObject, TKey>(
    a: Iterable<TObject>,
    key: (value: TObject) => TKey,
    key?: (value: TObject) => TKey
  ): Array<TKey, TObject[]>;
}
