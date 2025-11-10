"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { ProfileUpdateInput, profileUpdateSchema } from "@/lib/schemas";

export interface PersonalInfoFormHandle {
  submit: () => Promise<void>;
  reset: () => void;
}

interface PersonalInfoFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onDirtyChange?: (dirty: boolean) => void;
}

export const PersonalInfoForm = forwardRef<PersonalInfoFormHandle, PersonalInfoFormProps>(
  ({ user, onDirtyChange }, ref) => {
    const t = useTranslations("settings.profile.personalInfo");
    const router = useRouter();

    const form = useForm<ProfileUpdateInput>({
      resolver: zodResolver(profileUpdateSchema),
      defaultValues: {
        name: user.name || "",
        email: user.email || "",
      },
    });

    const baseValuesRef = useRef<ProfileUpdateInput>({
      name: user.name || "",
      email: user.email || "",
    });

    useEffect(() => {
      onDirtyChange?.(form.formState.isDirty);
    }, [form.formState.isDirty, onDirtyChange]);

    useEffect(() => {
      const nextValues: ProfileUpdateInput = {
        name: user.name || "",
        email: user.email || "",
      };
      baseValuesRef.current = nextValues;

      if (!form.formState.isDirty) {
        form.reset(nextValues);
      }
    }, [form, user.email, user.name]);

    const handleUpdateProfile = async (data: ProfileUpdateInput) => {
      if (!form.formState.isDirty) return;

      const requests = [
        authClient.updateUser({
          name: data.name,
        }),
      ];

      if (data.email !== user.email) {
        requests.push(
          authClient.changeEmail({
            newEmail: data.email,
            callbackURL: "/verify-email-success",
          })
        );
      }

      const responses = await Promise.all(requests);
      const updateResult = responses[0];
      const emailResult = responses[1] ?? { error: null };

      if (updateResult.error) {
        toast.error(updateResult.error.message || t("messages.updateFailed"));
        return;
      }

      if (emailResult.error) {
        toast.error(emailResult.error.message || t("messages.emailVerificationFailed"));
        return;
      }

      if (data.email !== user.email) {
        toast.success(t("messages.emailVerificationSent"));
      } else {
        toast.success(t("messages.updateSuccess"));
      }

      baseValuesRef.current = {
        name: data.name,
        email: data.email,
      };

      form.reset(data);
      router.refresh();
    };

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(handleUpdateProfile)(),
      reset: () => form.reset({ ...baseValuesRef.current }),
    }));

    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </header>

        <form className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input id="name" placeholder={t("namePlaceholder")} {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                {...form.register("email")}
              />
            </div>
          </div>
        </form>
      </section>
    );
  }
);

PersonalInfoForm.displayName = "PersonalInfoForm";
