"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfilePictureSectionProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  plan: string;
}

export function ProfilePictureSection({ user, plan }: ProfilePictureSectionProps) {
  const t = useTranslations("settings.profile.profilePicture");

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="text-2xl">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity hover:opacity-100">
            <Pencil className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {plan} {t("plan")}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {t("member")}
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
