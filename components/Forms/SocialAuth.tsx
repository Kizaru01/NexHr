"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toast } from "sonner";
const SocialAuth = (): React.JSX.Element => {
  const handleClick = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl: "/",
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
    <div className="mt-10 flex flex-wrap ">
      <Button
        className="background-dark400_light900 body-medium text-dark-200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5"
        onClick={() => handleClick("google")}
      >
        <Image
          src="/icons/google.svg"
          alt="google"
          width={20}
          height={20}
          className="invert-color mr-2.5 object-contain"
        />
        <span className="text-white dark:text-black ">
          Continue with Google
        </span>
      </Button>
    </div>
  );
};

export default SocialAuth;
