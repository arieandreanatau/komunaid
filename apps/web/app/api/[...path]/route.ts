import { handle } from "hono/vercel";

let handler: ReturnType<typeof handle>;

function getHandler() {
  if (!handler) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../../../../api/src/app").default;
    handler = handle(app);
  }
  return handler;
}

export async function GET(request: Request) {
  return getHandler()(request);
}
export async function POST(request: Request) {
  return getHandler()(request);
}
export async function PUT(request: Request) {
  return getHandler()(request);
}
export async function DELETE(request: Request) {
  return getHandler()(request);
}
export async function PATCH(request: Request) {
  return getHandler()(request);
}
export async function OPTIONS(request: Request) {
  return getHandler()(request);
}
