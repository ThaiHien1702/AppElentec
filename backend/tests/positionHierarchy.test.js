import { describe, it, expect } from "vitest";
import {
  POSITION_LEVELS,
  VALID_POSITIONS,
  getPositionLevel,
  isHigherPosition,
  isAtLeastLevel,
  hasPermission,
} from "../src/utils/positionHierarchy.js";

describe("positionHierarchy", () => {
  it("orders levels Manager > Assistant Manager > Supervisor > Staff", () => {
    expect(POSITION_LEVELS.Manager).toBeGreaterThan(
      POSITION_LEVELS["Assistant Manager"],
    );
    expect(POSITION_LEVELS["Assistant Manager"]).toBeGreaterThan(
      POSITION_LEVELS.Supervisor,
    );
    expect(POSITION_LEVELS.Supervisor).toBeGreaterThan(POSITION_LEVELS.Staff);
  });

  it("exposes the four valid positions", () => {
    expect(VALID_POSITIONS).toEqual([
      "Manager",
      "Assistant Manager",
      "Supervisor",
      "Staff",
    ]);
  });

  it("getPositionLevel returns 0 for unknown/undefined", () => {
    expect(getPositionLevel("Nope")).toBe(0);
    expect(getPositionLevel(undefined)).toBe(0);
    expect(getPositionLevel("Manager")).toBe(4);
  });

  it("compares positions", () => {
    expect(isHigherPosition("Manager", "Staff")).toBe(true);
    expect(isHigherPosition("Staff", "Manager")).toBe(false);
    expect(isAtLeastLevel("Supervisor", "Supervisor")).toBe(true);
    expect(isAtLeastLevel("Staff", "Supervisor")).toBe(false);
  });

  it("maps permissions per position", () => {
    expect(hasPermission("Manager", "canManagePositions")).toBe(true);
    expect(hasPermission("Staff", "canManagePositions")).toBe(false);
    expect(hasPermission("Supervisor", "canViewReports")).toBe(true);
    expect(hasPermission("Staff", "canViewReports")).toBe(false);
    // Unknown position falls back to the most restrictive (Staff) set.
    expect(hasPermission("???", "canDeleteData")).toBe(false);
  });
});
