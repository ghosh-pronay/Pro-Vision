import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../ProtectedRoute";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return <div data-testid="navigate" data-to={to} />;
    },
    Outlet: () => <div data-testid="outlet" />,
  };
});

const mockUseAuthContext = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

describe("ProtectedRoute", () => {
  it("redirects to /auth when isLoading (not yet authenticated)", () => {
    mockUseAuthContext.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      isEmailVerified: false,
      hasEmail: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/auth");
  });

  it("redirects to /auth when not authenticated", () => {
    mockUseAuthContext.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      isEmailVerified: false,
      hasEmail: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/auth");
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    mockUseAuthContext.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      hasEmail: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("redirects to /auth?mode=verify when email not verified", () => {
    mockUseAuthContext.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isEmailVerified: false,
      hasEmail: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/auth?mode=verify",
    );
  });

  it("renders Outlet when no children provided (layout mode)", () => {
    mockUseAuthContext.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      hasEmail: false,
    });

    render(<ProtectedRoute />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
