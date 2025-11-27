import "better-auth";
import "better-auth/react";

declare module "better-auth" {
  export interface User {
    plan?: string;
    credits?: number;
    theme?: string;
    language?: string;
    orgRole?: "owner" | "admin" | "member" | string;
  }
}

declare module "better-auth/react" {
  export interface User {
    plan?: string;
    credits?: number;
    theme?: string;
    language?: string;
    orgRole?: "owner" | "admin" | "member" | string;
  }

  export interface Session {
    user: User;
  }
}

export {};
