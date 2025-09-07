import { Union } from './index';
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
      const status: Union.Variant<UserStatus> = { active: true };
      const active = getActiveVariant(status);
      
      expect(active).toEqual({ tag: 'active', data: true });
    });

    it('should handle variants with undefined data', () => {
      // In TypeScript, this would be typed as { inactive: null }
      const status: Union.Variant<UserStatus> = { inactive: null };
      const active = getActiveVariant(status);
      
      expect(active).toEqual({ tag: 'inactive', data: null });
    });

    it('should handle complex data structures', () => {
      const pendingData = { reason: 'verification required' };
      const status: Union.Variant<UserStatus> = { pending: pendingData };
      const active = getActiveVariant(status);
      
      expect(active).toEqual({ tag: 'pending', data: pendingData });
    });

    it('should return undefined when no variant is active', () => {
      // Using type assertion to bypass type checking for this test case
      const status = {} as Union.Variant<UserStatus>;
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
      const result: Union.Variant<Result> = { success: { data: 'It worked!' } };
      
      const output = match<Result, string>({
        success: (data) => `Success: ${data.data}`,
        error: (data) => `Error: ${data.message}`,
        loading: () => 'Loading...'
      }, result);
      
      expect(output).toBe('Success: It worked!');
    });

    it('should call the default handler when using partial handlers', () => {
      const result: Union.Variant<Result> = { error: { message: 'Something went wrong' } };
      
      const output = match<Result, string>({
        success: (data) => `Success: ${data.data}`,
        _: () => 'Default handler called'
      }, result);
      
      expect(output).toBe('Default handler called');
    });

    it('should use the fallback handler when no variant matches', () => {
      const result: Union.Variant<Result> = { loading: null };
      
      const output = match<Result, string>({
        success: (data) => `Success: ${data.data}`,
        error: (data) => `Error: ${data.message}`,
        _: () => 'Fallback'
      }, result);
      
      expect(output).toBe('Fallback');
    });

    it('should throw an error when no handler matches and no default is provided', () => {
      const result: Union.Variant<Result> = { error: { message: 'Failed' } };
      
      expect(() => {
        match<Result, string>({
          success: (data) => `Success: ${data.data}`,
          loading: () => 'Loading...',
        }, result);
      }).toThrow('Handler not found for active tag "error" and no default \'_\' handler was provided.');
    });

    it('should handle empty object with default handler', () => {
      // Using type assertion to bypass type checking for this test case
      const result = {} as Union.Variant<Result>;
      
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
      const successResponse: Union.Variant<ApiResponse> = { "200": { data: "User data" } };
      const clientErrorResponse: Union.Variant<ApiResponse> = { "400": { error: "Bad request" } };
      const serverErrorResponse: Union.Variant<ApiResponse> = { "500": { serverError: "Internal error" } };
      
      const handleResponse = (response: Union.Variant<ApiResponse>): string => {
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
});
