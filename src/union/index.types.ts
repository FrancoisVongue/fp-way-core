import { Unary } from "../core.types";

export namespace UnionTypes {
  export type Definition = Record<string, unknown>;

  export type Variant<T extends Definition, TKeys extends keyof T = keyof T> = {
    [K in TKeys]:
    & Pick<T, K>
    & Partial<Record<Exclude<TKeys, K>, undefined>>
  }[TKeys];
  
  export type OneOf<T extends Definition, K extends keyof T = keyof T> = Variant<T, K>

  export type ActiveVariantEntry<TDefinition extends Definition> = {
    [K in keyof TDefinition]: Readonly<{ tag: K; data: TDefinition[K] }>;
  }[keyof TDefinition] | undefined;

  // exhaustive must be used for exhaustive match
  export type ExhaustiveMatchHandlers<TDefinition extends Definition, TResult> = {
    [K in keyof TDefinition]-?: (data: TDefinition[K]) => TResult;
  };
  export type PartialMatchHandlers<TDefinition extends Definition, TResult> =
    Partial<{ [K in keyof TDefinition]: (data: TDefinition[K]) => TResult; }>
    & { _: (data: TDefinition[keyof TDefinition]) => TResult }; // Default handler receives variant data

  export interface Match {
    <TDefinition extends UnionTypes.Definition, TResult>(
      handlers: UnionTypes.ExhaustiveMatchHandlers<TDefinition, TResult>
        | UnionTypes.PartialMatchHandlers<TDefinition, TResult>,
      unionValue: UnionTypes.Variant<TDefinition>
    ): TResult;
    <TDefinition extends UnionTypes.Definition, TResult>(
      handlers: UnionTypes.ExhaustiveMatchHandlers<TDefinition, TResult>
        | UnionTypes.PartialMatchHandlers<TDefinition, TResult>,
    ): Unary<UnionTypes.Variant<TDefinition>, TResult>;
  }
}
