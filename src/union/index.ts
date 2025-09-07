export namespace Union {
  // Export types directly from the namespace
  export type Definition = { [key: string]: any };
  export type Variant<TDefinition extends Definition> = { [K in keyof TDefinition]?: TDefinition[K] } & { [key: string]: any };
  export type ActiveVariantEntry<TDefinition extends Definition> = 
    | { [K in keyof TDefinition]: { tag: K; data: TDefinition[K] } }[keyof TDefinition]
    | undefined;

  export function getActiveVariant<TDefinition extends Definition>(
    unionValue: Variant<TDefinition>
  ): ActiveVariantEntry<TDefinition> {
    for (const key in unionValue) {
      if (Object.prototype.hasOwnProperty.call(unionValue, key)) {
        const tagName = key as keyof TDefinition;
        const variantData = unionValue[tagName];

        if (tagName in unionValue && variantData !== undefined) {
          return {
            tag: tagName,
            data: variantData as TDefinition[typeof tagName]
          } as ActiveVariantEntry<TDefinition>;
        }
      }
    }
    return undefined;
  }

  // Updated match with better generic constraints
  export const match = <TDefinition extends Definition, TResult>(
    handlers: { [K in keyof TDefinition]?: (data: TDefinition[K]) => TResult } | { _: (data: any) => TResult },
    unionValue: Variant<TDefinition>
  ): TResult => {
    const activeVariant = getActiveVariant(unionValue);
    
    if (activeVariant) {
      const variantHandler = (handlers as any)[activeVariant.tag];
      if (variantHandler !== undefined) {
        return variantHandler(activeVariant.data);
      }
    }
    
    if ('_' in handlers && handlers._) {
      return handlers._(activeVariant?.data as any);
    }

    const activeTag = activeVariant ? activeVariant.tag : 'none';
    throw new Error(`Handler not found for active tag "${String(activeTag)}" and no default '_' handler was provided.`);
  };
}