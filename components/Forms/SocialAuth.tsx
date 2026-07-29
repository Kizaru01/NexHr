"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toast } from "sonner";

type SocialAuthProps = {
  callbackUrl?: string;
};

const SocialAuth = ({
  callbackUrl = "/",
}: SocialAuthProps): React.JSX.Element => {
  const handleClick = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl,
      });
    } catch (error) {
      toast("Sign in failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occured during sign-in",
      });
    }
  };
  return (
    <div className="mt-8 flex flex-wrap">
      <Button
        className="min-h-11 flex-1"
        onClick={() => handleClick("google")}
      >
        <Image
          src="/icons/google.svg"
          alt=""
          width={20}
          height={20}
          className="mr-1 object-contain"
        />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
};

export default SocialAuth;
