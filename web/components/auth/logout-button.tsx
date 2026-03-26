"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  children?: ReactNode;
};

export function LogoutButton({ children }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);

    try {
      await authClient.signOut();
    } finally {
      router.push("/login");
      router.refresh();
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Signing out..." : (children ?? "Sign out")}
    </Button>
  );
}
