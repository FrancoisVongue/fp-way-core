// Final Solution Code (No Comments Included)

import { Curry } from "../core";
import { UnionTypes } from "./index.types";

export namespace Union {

  /**
   * Retrieves the active variant from a union type.
   * 
   * type UserStatus = {
   *   active: boolean;
   *   inactive: null;
   *   pending: { reason: string };
   * };
   * 
   * const status: UnionTypes.OneOf<UserStatus> = { active: true };
   * const activeVariant = getActiveVariant(status);
   * // Returns: { tag: 'active', data: true }
   * 
   * @param unionValue - The union value to extract the active variant from.
   * @returns The active variant entry, or undefined if no variant is active.
   */
  export function getActiveVariant<TDefinition extends UnionTypes.Definition>(
    unionValue: UnionTypes.Variant<TDefinition>
  ): UnionTypes.ActiveVariantEntry<TDefinition> {
    for (const key in unionValue) {
      if (Object.prototype.hasOwnProperty.call(unionValue, key)) {
        const tagName = key as keyof TDefinition;
        const variantData = unionValue[tagName];

        // We can simplify by removing Object.freeze and handling both cases in one return
        if (tagName in unionValue) {
          return {
            tag: tagName,
            data: variantData as TDefinition[typeof tagName]
          } as UnionTypes.ActiveVariantEntry<TDefinition>;
        }
      }
    }
    return undefined;
  }

  /**
   * Matches the active variant of a union type against a set of handlers.
   * 
   * type Result = {
   *   success: { data: string };
   *   error: { message: string };
   *   loading: null;
   * };
   * 
   * // Create a union value
   * const result: UnionTypes.OneOf<Result> = { success: { data: 'It worked!' } };
   * 
   * // Match against the union value
   * const output = match<Result, string>({
   *   success: (data) => `Success: ${data.data}`,
   *   error: (data) => `Error: ${data.message}`,
   *   loading: () => 'Loading...'
   * }, result);
   * // output: "Success: It worked!"
   * 
   * // Using partial handlers with a default case
   * const partialOutput = match<Result, string>({
   *   success: (data) => `Success: ${data.data}`,
   *   _: () => 'Fallback for other cases'
   * }, result);
   * 
   * @param handlers - An object containing handlers for each variant of the union type.
   * @param unionValue - The union value to match against the handlers.
   * @returns The result of the handler that matches the active variant.
   */

  export const match: UnionTypes.Match = Curry((
    handlers,
    unionValue,
  ) => {
    const activeVariant = getActiveVariant(unionValue);
    let variantHandler: ((data: any) => any) | undefined;

    if (activeVariant) {
      variantHandler = (handlers as any)[activeVariant.tag];
      if (variantHandler !== undefined) {
        // Type assertion needed for data here
        return variantHandler(activeVariant.data as any);
      }
    }
    if ('_' in handlers) {
      return handlers._(activeVariant?.data as any);
    }

    // Should be unreachable if types are correct (exhaustive provided or partial included '_')
    // Providing a runtime safeguard.
    const activeTag = activeVariant ? activeVariant.tag : 'none';
    throw new Error(`Handler not found for active tag "${String(activeTag)}" and no default '_' handler was provided.`);
  })

  export type Result<V, E> = Result.Result<V, E>;
  export namespace Result {
    type Definition<V, E> = {
      ok: V,
      err: E;
    };

    export type Result<V, E> = UnionTypes.Variant<Definition<V, E>>;

    export const Ok = <V>(value: V):
      (Result<V, never>) => ({ ok: value });
    export const Err = <E>(error: E):
      (Result<never, E>) => ({ err: error });

    export const isOk = <V, E>(result: Result<V, E>):
      result is UnionTypes.Variant<Definition<V, E>, 'ok'> =>
      result.ok !== undefined;
    export const isErr = <V, E>(result: Result<V, E>):
      result is UnionTypes.Variant<Definition<V, E>, 'err'> =>
      result.err !== undefined;
  }
}