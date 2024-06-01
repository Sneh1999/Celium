import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useIsMounted } from "@/hooks/useIsMounted";
import { trpc } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { getAuthOptions } from "./api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions(context.req)
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (session && session.user.emailVerified) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default function LinkEmailPage() {
  const isMounted = useIsMounted();
  const router = useRouter();
  const session = useSession();

  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [token, setToken] = useState("");

  const linkEmailRequest = trpc.linkEmail.linkEmailRequest.useMutation();
  const verifyLinkEmailRequest =
    trpc.linkEmail.verifyLinkEmailRequest.useMutation();

  async function handleSubmit() {
    try {
      if (!sentEmail) {
        await linkEmailRequest.mutateAsync({ email });

        toast.success("Check your email", {
          description: "Input the OTP code to verify your email.",
        });

        setSentEmail(true);
      } else {
        if (token.length !== 6) {
          toast.error("Invalid OTP code", {
            description: "Input the correct OTP code to verify your email.",
          });
          return;
        }

        await verifyLinkEmailRequest.mutateAsync({ token });
        await session.update();

        toast.success("Email verified", {
          description: "Your email has been verified.",
        });

        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (e) {
      if (e instanceof TRPCError) {
        return toast.error(e.code, {
          description: e.message,
        });
      }

      toast.error("Could not link email", {
        description: (e as Error).message,
      });
    }
  }

  if (!isMounted) return null;

  return (
    <Dialog open={true}>
      <DialogContent hideClose>
        <DialogTitle>Link Email</DialogTitle>
        <DialogDescription>
          Link your email with your Celium account to get notified about
          potentially suspicious activity on your wallets.
        </DialogDescription>

        <div className="flex flex-col gap-4">
          {sentEmail ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="otp">OTP</Label>
              <InputOTP
                maxLength={6}
                size={20}
                id="otp"
                name="otp"
                value={token}
                onChange={(value) => setToken(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={handleSubmit}
              variant="secondary"
              isLoading={
                linkEmailRequest.isPending || verifyLinkEmailRequest.isPending
              }
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
