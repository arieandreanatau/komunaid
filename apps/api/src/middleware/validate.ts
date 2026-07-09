import { Context, Next } from "hono";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "param" = "body") {
  return async (c: Context, next: Next) => {
    let data: unknown;

    if (source === "body") {
      data = await c.req.json();
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
            error: "Validation Error",
            details: error.errors.map((e) => ({
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
