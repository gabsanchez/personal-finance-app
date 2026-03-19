import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SigninForm } from "@/app/(auth)/signin/signin-form";

// ── Mocks ───────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockSignIn = jest.fn();
jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// ── Tests ───────────────────────────────────────────────

describe("SigninForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(<SigninForm />);

    expect(screen.getByLabelText("auth.signin.email")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.signin.password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<SigninForm />);

    expect(
      screen.getByRole("button", { name: "auth.signin.submit" })
    ).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    render(<SigninForm />);

    expect(
      screen.getByRole("button", { name: "auth.signin.google" })
    ).toBeInTheDocument();
  });

  it("renders link to sign-up page", () => {
    render(<SigninForm />);

    const link = screen.getByRole("link", { name: "auth.signin.signUp" });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("calls signIn with credentials on form submit", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<SigninForm />);

    await user.type(screen.getByLabelText("auth.signin.email"), "test@example.com");
    await user.type(screen.getByLabelText("auth.signin.password"), "password123");
    await user.click(screen.getByRole("button", { name: "auth.signin.submit" }));

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: false,
    });
  });

  it("redirects to / on successful sign-in", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<SigninForm />);

    await user.type(screen.getByLabelText("auth.signin.email"), "test@example.com");
    await user.type(screen.getByLabelText("auth.signin.password"), "password123");
    await user.click(screen.getByRole("button", { name: "auth.signin.submit" }));

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error on invalid credentials", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    const user = userEvent.setup();

    render(<SigninForm />);

    await user.type(screen.getByLabelText("auth.signin.email"), "test@example.com");
    await user.type(screen.getByLabelText("auth.signin.password"), "wrong");
    await user.click(screen.getByRole("button", { name: "auth.signin.submit" }));

    expect(screen.getByText("auth.errors.invalidCredentials")).toBeInTheDocument();
  });

  it("calls Google signIn when Google button is clicked", async () => {
    const user = userEvent.setup();

    render(<SigninForm />);

    await user.click(screen.getByRole("button", { name: "auth.signin.google" }));

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });
});
