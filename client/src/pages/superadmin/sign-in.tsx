import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, Info } from "lucide-react";
import { EngageXLogo } from "@/components/engagex-logo";
import {
  superAdminAuthenticate,
  setSuperAdminAuthenticated,
  SUPERADMIN_CREDENTIALS,
} from "@/lib/account";
import { BRAND } from "@/lib/brand";

export default function SuperAdminSignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (superAdminAuthenticate(email, password)) {
        setSuperAdminAuthenticated(true);
        navigate("/superadmin");
      } else {
        setError("Invalid super admin credentials.");
        setLoading(false);
      }
    }, 500);
  }

  function fillDemoCredentials() {
    setEmail(SUPERADMIN_CREDENTIALS.email);
    setPassword(SUPERADMIN_CREDENTIALS.password);
    setError("");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted grain-texture px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <EngageXLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{BRAND.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Admin Console
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/15">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-primary">
            <p className="font-medium">Internal-only access</p>
            <p className="text-primary mt-0.5">
              This page provisions customer accounts for the {BRAND.name} platform. Sign in with your super admin credentials.
            </p>
          </div>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Super admin email</Label>
                <Input
                  type="email"
                  placeholder="superadmin@engagex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm border-border"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 text-sm border-border pr-9"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/15 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
              >
                {loading ? "Signing in…" : "Sign in to Super Admin"}
              </Button>
            </form>

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Demo credentials</p>
              <div className="space-y-1 text-xs font-mono text-muted-foreground bg-muted border border-border rounded-lg p-2.5">
                <p>Email: {SUPERADMIN_CREDENTIALS.email}</p>
                <p>Password: {SUPERADMIN_CREDENTIALS.password}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fillDemoCredentials}
                className="w-full mt-2 h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Fill demo credentials
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.copyright}. {BRAND.tagline}.
        </p>
      </div>
    </div>
  );
}
