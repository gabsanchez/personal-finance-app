import { render, screen } from "@testing-library/react";
import { Header } from "@/components/header";

// ── Mocks ───────────────────────────────────────────────

const mockAuth = jest.fn();
const mockSignOut = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

// ── Tests ───────────────────────────────────────────────

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const { container } = render(await Header());

    expect(container.innerHTML).toBe("");
  });

  it("renders the app name when authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", email: "test@example.com" } });

    render(await Header());

    expect(screen.getByText("Pocket Detective")).toBeInTheDocument();
  });

  it("renders a sign out button when authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", email: "test@example.com" } });

    render(await Header());

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("renders inside a header element", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", email: "test@example.com" } });

    render(await Header());

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
