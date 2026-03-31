"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

type ClarityInitProps = {
  projectId: string;
};

export function ClarityInit({ projectId }: ClarityInitProps) {
  useEffect(() => {
    if (!projectId.trim()) {
      return;
    }
    Clarity.init(projectId.trim());
  }, [projectId]);

  return null;
}
