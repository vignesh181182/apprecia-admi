import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail } from "lucide-react";
import { EngageXLogo } from "@/components/engagex-logo";
import {
  findInvite,
  getAccount,
  createAccountFromInvite,
  setAuthenticated,
} from "@/lib/account";
import { BRAND } from "@/lib/brand";

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const invite = inviteToken ? findInvite(inviteToken) : undefined;

  const [email, setEmail] = useState(invite?.adminEmail ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invite?.adminEmail && !email) {
      setEmail(invite.adminEmail);
    }
  }, [invite, email]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (invite && email.toLowerCase() !== invite.adminEmail.toLowerCase()) {
      setError("This invite was sent to a different email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let account = getAccount();

      if (invite && (!account || account.accountId !== invite.accountId)) {
        account = createAccountFromInvite(invite);
      }

      setAuthenticated(true);
      if (rememberMe) localStorage.setItem("engagex_email", email);

      if (account && !account.setupCompleted) {
        navigate("/onboarding/welcome");
      } else {
        navigate("/");
      }
    }, 600);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 grain-texture px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <EngageXLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{BRAND.name}</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to the {BRAND.tagline}</p>
        </div>

        {invite && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-stone-100 border border-stone-200">
            <Mail className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700">
              <p className="font-medium">Invitation from {BRAND.name}</p>
              <p className="text-stone-600 mt-0.5">
                Welcome, {invite.adminName.split(" ")[0]}! Sign in to finish setting up{" "}
                <span className="font-medium">{invite.companyName}</span>.
              </p>
            </div>
          </div>
        )}

        <Card className="border border-stone-200 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Email</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm border-stone-200"
                  autoComplete="email"
                  readOnly={!!invite}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-stone-700">
                    {invite ? "Set a password" : "Password"}
                  </Label>
                  {!invite && (
                    <button type="button" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={invite ? "Choose a strong password" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 text-sm border-stone-200 pr-9"
                    autoComplete={invite ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!invite && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v as boolean)}
                  />
                  <Label htmlFor="remember" className="text-xs text-stone-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-stone-900 hover:bg-stone-700 text-white text-sm"
              >
                {loading ? "Signing in…" : invite ? "Sign in & continue setup" : "Sign In"}
              </Button>
            </form>

            {!invite && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-xs text-stone-400">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-9 text-sm border-stone-200 gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="h-9 text-sm border-stone-200 gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-stone-500">
          © {new Date().getFullYear()} {BRAND.copyright}. {BRAND.tagline}.
        </p>
      </div>
    </div>
  );
}
