import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

const prettyStream = isDevelopment
  ? {
      write(msg: string) {
        try {
          const parsed = JSON.parse(msg);
          const time = parsed.time || new Date().toISOString();
          const level = parsed.level || "INFO";
          const module = parsed.module ? `[${parsed.module}]` : "";
          const message = parsed.msg || "";
          const extra = { ...parsed };
          delete extra.time;
          delete extra.level;
          delete extra.msg;
          delete extra.module;
          delete extra.pid;
          delete extra.hostname;
          const extraStr = Object.keys(extra).length > 0 ? " " + JSON.stringify(extra) : "";
          process.stdout.write(`${time} ${level} ${module} ${message}${extraStr}\n`);
        } catch {
          process.stdout.write(msg);
        }
      },
    }
  : undefined;

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  prettyStream as any
);

export function createChildLogger(name: string) {
  return logger.child({ module: name });
}
