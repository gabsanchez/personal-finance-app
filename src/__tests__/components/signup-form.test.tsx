import { render, screen } from "@testing-library/react";
import { SignupForm } from "@/app/(auth)/signup/signup-form";

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

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/lib/actions/auth", () => ({
  signup: jest.fn(),
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: jest.fn().mockReturnValue([{}, jest.fn(), false]),
}));

// ── Tests ───────────────────────────────────────────────

describe("SignupForm", () => {
  it("renders all form fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("auth.signup.name")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.signup.email")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.signup.password")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.signup.confirmPassword")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.signup.language")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<SignupForm />);

    const button = screen.getByRole("button", { name: "auth.signup.submit" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("renders Google sign-in button", () => {
    render(<SignupForm />);

    expect(
      screen.getByRole("button", { name: "auth.signup.google" })
    ).toBeInTheDocument();
  });

  it("renders link to sign-in page", () => {
    render(<SignupForm />);

    const link = screen.getByRole("link", { name: "auth.signup.signIn" });
    expect(link).toHaveAttribute("href", "/signin");
  });

  it("disables submit button when pending", () => {
    const react = require("react");
    react.useActionState.mockReturnValue([{}, jest.fn(), true]);

    render(<SignupForm />);

    expect(screen.getByRole("button", { name: "auth.signup.submit" })).toBeDisabled();

    react.useActionState.mockReturnValue([{}, jest.fn(), false]);
  });

  it("displays error message when state has error", () => {
    const react = require("react");
    react.useActionState.mockReturnValue([{ error: "emailExists" }, jest.fn(), false]);

    render(<SignupForm />);

    expect(screen.getByText("auth.errors.emailExists")).toBeInTheDocument();

    react.useActionState.mockReturnValue([{}, jest.fn(), false]);
  });
});
