import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, createChildLogger } from "../../../src/lib/logger";

describe("logger", () => {
  it("should be defined", () => {
    expect(logger).toBeDefined();
  });

  it("should be a pino logger instance", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("should have child method", () => {
    expect(typeof logger.child).toBe("function");
  });

  it("should have a level property", () => {
    expect(logger.level).toBeDefined();
    expect(typeof logger.level).toBe("string");
  });

  it("should log info messages without throwing", () => {
    expect(() => logger.info("test info message")).not.toThrow();
  });

  it("should log error messages without throwing", () => {
    expect(() => logger.error("test error message")).not.toThrow();
  });

  it("should log warn messages without throwing", () => {
    expect(() => logger.warn("test warn message")).not.toThrow();
  });

  it("should log debug messages without throwing", () => {
    expect(() => logger.debug("test debug message")).not.toThrow();
  });
});

describe("createChildLogger", () => {
  it("should be a function", () => {
    expect(typeof createChildLogger).toBe("function");
  });

  it("should return a child logger", () => {
    const child = createChildLogger("test-module");
    expect(child).toBeDefined();
    expect(typeof child.info).toBe("function");
    expect(typeof child.error).toBe("function");
  });

  it("should have module property in bindings", () => {
    const child = createChildLogger("auth-module");
    const bindings = (child as any).bindings();
    expect(bindings).toBeDefined();
    expect(bindings.module).toBe("auth-module");
  });

  it("should create different loggers for different names", () => {
    const child1 = createChildLogger("module-a");
    const child2 = createChildLogger("module-b");
    const bindings1 = (child1 as any).bindings();
    const bindings2 = (child2 as any).bindings();
    expect(bindings1.module).toBe("module-a");
    expect(bindings2.module).toBe("module-b");
    expect(bindings1.module).not.toBe(bindings2.module);
  });

  it("child logger should have standard log methods", () => {
    const child = createChildLogger("test");
    expect(typeof child.info).toBe("function");
    expect(typeof child.error).toBe("function");
    expect(typeof child.warn).toBe("function");
    expect(typeof child.debug).toBe("function");
    expect(typeof child.fatal).toBe("function");
    expect(typeof child.trace).toBe("function");
  });

  it("child logger should log without throwing", () => {
    const child = createChildLogger("test-module");
    expect(() => child.info("child log message")).not.toThrow();
    expect(() => child.error("child error message")).not.toThrow();
  });

  it("child logger should accept child method for nested loggers", () => {
    const child = createChildLogger("parent");
    expect(typeof child.child).toBe("function");
    const grandchild = child.child({ sub: "nested" });
    expect(grandchild).toBeDefined();
  });
});
