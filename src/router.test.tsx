import { act, renderHook } from "@testing-library/react-hooks";
import router, { useRouter } from "./router";
import { MemoryRouter } from "./MemoryRouter";

describe("router", () => {
  it("should export a default router", () => {
    expect(router).toBeInstanceOf(MemoryRouter);
  });

  describe("useRouter", () => {
    it("the useRouter hook should return the same instance of the router", () => {
      const { result } = renderHook(() => useRouter());

      expect(result.current).toBe(router);
    });

    it('"push" will cause a rerender with the new route', () => {
      const { result, rerender } = renderHook(() => useRouter());

      expect(result.current).toBe(router);

      act(() => {
        result.current.push("/foo?bar=baz");
      });

      expect(result.current).not.toBe(router);
      expect(result.current).toMatchObject({
        asPath: "/foo?bar=baz",
        pathname: "/foo",
        query: { bar: "baz" },
      });
    });
  });
});
