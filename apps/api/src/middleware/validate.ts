import { Context, Next } from "hono";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "param" = "body") {
  return async (c: Context, next: Next) => {
    let data: unknown;

    if (source === "body") {
      try {
        data = await c.req.json();
      } catch {
        return c.json(
          {
            success: false,
            message: "Validation Error",
            errors: [{ field: "body", message: "Invalid JSON body" }],
          },
          400
        );
      }
    } else if (source === "query") {
      const url = new URL(c.req.url);
      data = Object.fromEntries(url.searchParams);
    } else if (source === "param") {
      data = c.req.param();
    }

    try {
      const validated = schema.parse(data);
      c.set("validated", validated);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: "Validation Error",
            errors: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          400
        );
      }
      throw error;
    }
  };
}
