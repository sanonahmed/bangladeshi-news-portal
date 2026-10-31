import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("CSS Classname Merge Utility (cn)", () => {
  it("merges standard classnames together", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes accurately", () => {
    const isPrimary = true;
    const isOutlined = false;
    expect(
      cn("base-btn", isPrimary && "bg-news-red text-white", isOutlined && "border")
    ).toBe("base-btn bg-news-red text-white");
  });

  it("resolves Tailwind conflicting classes intelligently with tailwind-merge", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });
});
