import { test, expect } from "bun:test";
import { multiply, divide } from "./math.ts";

test("multiply returns product of two positive numbers", () => {
  expect(multiply(3, 4)).toBe(12);
});

test("multiply handles negative numbers", () => {
  expect(multiply(-2, 5)).toBe(-10);
  expect(multiply(-3, -4)).toBe(12);
});

test("multiply handles zero", () => {
  expect(multiply(5, 0)).toBe(0);
  expect(multiply(0, 5)).toBe(0);
});

test("divide returns quotient of two numbers", () => {
  expect(divide(10, 2)).toBe(5);
  expect(divide(15, 3)).toBe(5);
});

test("divide handles negative numbers", () => {
  expect(divide(-10, 2)).toBe(-5);
  expect(divide(10, -2)).toBe(-5);
  expect(divide(-10, -2)).toBe(5);
});

test("divide handles decimal results", () => {
  expect(divide(7, 2)).toBe(3.5);
});

test("divide throws error when dividing by zero", () => {
  expect(() => divide(10, 0)).toThrow("Division by zero is not allowed");
});
