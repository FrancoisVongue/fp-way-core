import { Union } from './index';
import { UnionTypes } from './index.types';
const { getActiveVariant, match } = Union;

describe('TaggedUnion', () => {
  // Test type definitions
  type UserStatus = {
    active: boolean;
    inactive: null;
    pending: { reason: string };
  };

  describe('getActiveVariant', () => {
    it('should return the active variant with its data', () => {
      const status: UnionTypes.Variant<UserStatus> = { active: true };
      const active = getActiveVariant(status);
      
      expect(active).toEqual({ tag: 'active', data: true });
    });

    it('should handle variants with undefined data', () => {
      // In TypeScript, this would be typed as { inactive: null }
      const status: UnionTypes.Variant<UserStatus> = { inactive: null };
      const active = getActiveVariant(status);
      
      expect(active).toEqual({ tag: 'inactive', data: null });
    });

    it('should handle complex data structures', () => {
      const pendingData = { reason: 'verification required' };
      const status: UnionTypes.Variant<UserStatus> = { pending: pendingData };
      const active = getActiveVariant(status);
      
      expect(active).toEqual({ tag: 'pending', data: pendingData });
    });

    it('should return undefined when no variant is active', () => {
      // Using type assertion to bypass type checking for this test case
      const status = {} as UnionTypes.Variant<UserStatus>;
      const active = getActiveVariant(status);
      
      expect(active).toBeUndefined();
    });
  });

  describe('match function', () => {
    type Result = {
      success: { data: string };
      error: { message: string };
      loading: null;
    };

    it('should call the right handler for the active variant with exhaustive handlers', () => {
      const result: UnionTypes.Variant<Result> = { success: { data: 'It worked!' } };
      
      const output = match<Result, string>({
        success: (data) => `Success: ${data.data}`,
        error: (data) => `Error: ${data.message}`,
        loading: () => 'Loading...'
      }, result);
      
      expect(output).toBe('Success: It worked!');
    });

    it('should call the default handler when using partial handlers', () => {
      const result: UnionTypes.Variant<Result> = { error: { message: 'Something went wrong' } };
      
      const output = match<Result, string>({
        success: (data) => `Success: ${data.data}`,
        _: () => 'Default handler called'
      }, result);
      
      expect(output).toBe('Default handler called');
    });

    it('should use the fallback handler when no variant matches', () => {
      const result: UnionTypes.Variant<Result> = { loading: null };
      
      const output = match<Result, string>({
        success: (data) => `Success: ${data.data}`,
        error: (data) => `Error: ${data.message}`,
        _: () => 'Fallback'
      }, result);
      
      expect(output).toBe('Fallback');
    });

    it('should throw an error when no handler matches and no default is provided', () => {
      const result: UnionTypes.Variant<Result> = { error: { message: 'Failed' } };
      
      expect(() => {
        // @ts-expect-error - This should throw an error
        match<Result, string>({
          success: (data) => `Success: ${data.data}`,
          loading: () => 'Loading...',
        }, result);
      }).toThrow('Handler not found for active tag "error" and no default \'_\' handler was provided.');
    });

    it('should handle empty object with default handler', () => {
      // Using type assertion to bypass type checking for this test case
      const result = {} as UnionTypes.Variant<Result>;
      
      const output = match<Result, string>({
        _: () => 'No active variant'
      }, result);
      
      expect(output).toBe('No active variant');
    });
  });

  describe('practical examples', () => {
    type ApiResponse = {
      "200": { data: string };
      "400": { error: string };
      "500": { serverError: string };
    };

    it('should handle API response pattern', () => {
      const successResponse: UnionTypes.Variant<ApiResponse> = { "200": { data: "User data" } };
      const clientErrorResponse: UnionTypes.Variant<ApiResponse> = { "400": { error: "Bad request" } };
      const serverErrorResponse: UnionTypes.Variant<ApiResponse> = { "500": { serverError: "Internal error" } };
      
      const handleResponse = (response: UnionTypes.Variant<ApiResponse>): string => {
        return match<ApiResponse, string>({
          "200": (data) => `Success: ${data.data}`,
          "400": (data) => `Client error: ${data.error}`,
          "500": (data) => `Server error: ${data.serverError}`
        }, response);
      };
      
      expect(handleResponse(successResponse)).toBe("Success: User data");
      expect(handleResponse(clientErrorResponse)).toBe("Client error: Bad request");
      expect(handleResponse(serverErrorResponse)).toBe("Server error: Internal error");
    });
  });

  describe('Result', () => {
    describe('creation and type guards', () => {
      it('should create Ok variant correctly', () => {
        const ok = Union.Result.Ok('success');
        expect(Union.Result.isOk(ok)).toBe(true);
        expect(Union.Result.isErr(ok)).toBe(false);
        expect(ok.ok).toBe('success');
      });

      it('should create Err variant correctly', () => {
        const err = Union.Result.Err(new Error('failure'));
        expect(Union.Result.isOk(err)).toBe(false);
        expect(Union.Result.isErr(err)).toBe(true);
        expect(err.err).toBeInstanceOf(Error);
        if(Union.Result.isErr(err)) {
          expect(err.err.message).toBe('failure');
        }
      });
    });

    describe('type inference and pattern matching', () => {
      function divide(a: number, b: number): Union.Result<number, Error> {
        if (b === 0) {
          return Union.Result.Err(new Error('Division by zero'));
        }
        return Union.Result.Ok(a / b);
      }

      it('should handle successful computation', () => {
        const result = divide(10, 2);
        
        if (Union.Result.isOk(result)) {
          expect(result.ok).toBe(5);
        } else {
          fail('Expected Ok variant');
        }
      });

      it('should handle error cases', () => {
        const result = divide(10, 0);
        
        if (Union.Result.isErr(result)) {
          expect(result.err.message).toBe('Division by zero');
        } else {
          fail('Expected Err variant');
        }
      });

      it('should work with Union.match', () => {
        const result = divide(10, 2);
        
        const output = match({
          ok: (value) => `Result: ${value}`,
          err: (error) => `Error: ${(error as Error).message}`,
        }, result as any); // Type assertion needed due to type system limitations

        expect(output).toBe('Result: 5');
      });
    });
  });
});
