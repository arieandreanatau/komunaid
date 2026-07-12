import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../../lib/auth";
import type { User } from "../../lib/auth";

const mockUser: User = {
  id: "1",
  name: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  avatar: "https://example.com/avatar.jpg",
  phone: "+1234567890",
  bio: "A bio",
  location: "NYC",
  roles: ["user"],
  interests: ["coding"],
  communitiesCount: 5,
  organizationsCount: 2,
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe("initial state", () => {
    it("has user as null", () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("has isAuthenticated as false", () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("has isLoading as true", () => {
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe("setUser", () => {
    it("sets user, isAuthenticated=true, isLoading=false when given a user", () => {
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("clears user, isAuthenticated=false, isLoading=false when given null", () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(null);
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("replaces previous user when called again", () => {
      const user2: User = { ...mockUser, id: "2", name: "Jane Doe" };
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(user2);
      expect(useAuthStore.getState().user).toEqual(user2);
    });
  });

  describe("setLoading", () => {
    it("sets isLoading to true", () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("sets isLoading to false", () => {
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("toggles isLoading", () => {
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe("updateUser", () => {
    it("merges data with existing user", () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().updateUser({ name: "Jane Doe", location: "LA" });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe("Jane Doe");
      expect(state.user?.location).toBe("LA");
      expect(state.user?.id).toBe("1");
      expect(state.user?.email).toBe("john@example.com");
    });

    it("does nothing when user is null", () => {
      useAuthStore.getState().updateUser({ name: "Test" });
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("can update roles array", () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().updateUser({ roles: ["admin"] });
      expect(useAuthStore.getState().user?.roles).toEqual(["admin"]);
    });

    it("can update optional fields to null", () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().updateUser({ avatar: null, phone: null });
      const state = useAuthStore.getState();
      expect(state.user?.avatar).toBeNull();
      expect(state.user?.phone).toBeNull();
    });

    it("does not affect isAuthenticated or isLoading", () => {
      useAuthStore.getState().setUser(mockUser);
      const before = { isAuthenticated: useAuthStore.getState().isAuthenticated, isLoading: useAuthStore.getState().isLoading };
      useAuthStore.getState().updateUser({ name: "Changed" });
      expect(useAuthStore.getState().isAuthenticated).toBe(before.isAuthenticated);
      expect(useAuthStore.getState().isLoading).toBe(before.isLoading);
    });
  });
});
