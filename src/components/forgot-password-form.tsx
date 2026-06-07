"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, CloseButton } from "@heroui/react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Gagal parse JSON:", parseError);
        setAlertMessage("Server error: Invalid response");
        setAlertType("error");
        setShowAlert(true);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        setAlertMessage(
          data.message || "Reset password link has been sent to your email!",
        );
        setAlertType("success");
        setShowAlert(true);
      } else {
        const errorMessage =
          data.message || data.error || "Failed to send reset link";
        setAlertMessage(errorMessage);
        setAlertType("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Network error:", error);
      setAlertMessage(
        "Network error. Please check your connection and try again.",
      );
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-md", className)}
      {...props}
    >
      <Card className="w-full bg-black border border-white/30 shadow-2xl">
        <CardHeader className="text-center bg-black pb-6">
          <CardTitle
            className={`${inter.className} text-xl text-white font-semibold`}
          >
            Forgot Password
          </CardTitle>
          <CardDescription
            className={`${inter.className} text-sm text-white/80`}
          >
            Enter your email address and well send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAlert && (
            <div className="mb-6">
              <Alert
                className={`flex items-start gap-3 p-3 rounded-md border ${
                  alertType === "success"
                    ? "bg-green-900/40 border-green-600"
                    : "bg-red-900/40 border-red-600"
                } text-white`}
              >
                <Alert.Indicator
                  className={
                    alertType === "success" ? "text-green-400" : "text-red-400"
                  }
                />
                <div className="flex-1">
                  <Alert.Content>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Alert.Title
                          className={`font-semibold text-white ${
                            alertType === "success"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {alertType === "success" ? "Success!" : "Error"}
                        </Alert.Title>
                        <Alert.Description className="mt-1 text-sm text-white/90">
                          {alertMessage}
                        </Alert.Description>
                      </div>
                      <div className="shrink-0">
                        <CloseButton
                          aria-label="Close alert"
                          className="text-white/80 hover:text-white"
                          onClick={() => {
                            setShowAlert(false);
                            setAlertMessage("");
                          }}
                        />
                      </div>
                    </div>
                  </Alert.Content>
                </div>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel
                  className={`${inter.className} text-white`}
                  htmlFor="email"
                >
                  Email Address
                </FieldLabel>
                <Input
                  className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm`}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Button
                  className={`${inter.className} text-white w-full`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <FieldDescription
                  className={`${inter.className} text-white/70 text-center py-4`}
                >
                  Remember your password?{" "}
                  <Link href="/login" className="text-white hover:underline">
                    Back to Sign In
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
