"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
] as const;

const THEMES = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type PreferencesFormValues = {
  theme: (typeof THEMES)[number]["value"];
  language: (typeof LANGUAGES)[number]["value"];
};

export interface PreferencesSectionHandle {
  submit: () => Promise<void>;
  reset: () => void;
}

interface PreferencesSectionProps {
  initialTheme: PreferencesFormValues["theme"];
  initialLanguage: PreferencesFormValues["language"];
  onDirtyChange?: (dirty: boolean) => void;
}

export const PreferencesSection = forwardRef<PreferencesSectionHandle, PreferencesSectionProps>(
  ({ initialTheme, initialLanguage, onDirtyChange }, ref) => {
    const queryClient = useQueryClient();
    const { router, pathname, locale } = useLocaleRouting();
    const { setTheme } = useTheme();

    const form = useForm<PreferencesFormValues>({
      defaultValues: {
        theme: initialTheme,
        language: initialLanguage,
      },
    });

    const baseValuesRef = useRef<PreferencesFormValues>({
      theme: initialTheme,
      language: initialLanguage,
    });

    useEffect(() => {
      onDirtyChange?.(form.formState.isDirty);
    }, [form.formState.isDirty, onDirtyChange]);

    useEffect(() => {
      const nextValues: PreferencesFormValues = {
        theme: initialTheme,
        language: initialLanguage,
      };
      baseValuesRef.current = nextValues;

      if (!form.formState.isDirty) {
        form.reset(nextValues);
      }
    }, [form, initialLanguage, initialTheme]);

    const updatePreferences = useMutation({
      mutationFn: async (values: PreferencesFormValues) => {
        const res = await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || "Failed to update preferences");
        }

        return (await res.json()) as PreferencesFormValues;
      },
      onSuccess: async (data) => {
        const nextTheme = data.theme;
        const nextLanguage = data.language;

        baseValuesRef.current = data;
        form.reset(data);
        toast.success("Preferences updated");

        if (nextTheme) {
          setTheme(nextTheme);
        }

        if (nextLanguage && nextLanguage !== locale) {
          const normalizedPath = pathname.startsWith(`/${locale}`)
            ? pathname.slice(locale.length + 1) || "/"
            : pathname || "/";
          await router.replace(normalizedPath, { locale: nextLanguage });
        }

        queryClient.invalidateQueries({ queryKey: ["session"] });
      },
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Failed to update preferences");
      },
    });

    const handleSubmit = async (values: PreferencesFormValues) => {
      if (!form.formState.isDirty) return;
      await updatePreferences.mutateAsync(values);
    };

    const theme = form.watch("theme");
    const language = form.watch("language");

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(handleSubmit)(),
      reset: () => form.reset(baseValuesRef.current),
    }));

    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Manage your interface language and appearance settings.
          </p>
        </header>

        <form className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Theme</label>
            <Select
              value={theme}
              onValueChange={(value: PreferencesFormValues["theme"]) =>
                form.setValue("theme", value, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Language</label>
            <Select
              value={language}
              onValueChange={(value: PreferencesFormValues["language"]) =>
                form.setValue("language", value, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </section>
    );
  }
);

PreferencesSection.displayName = "PreferencesSection";
