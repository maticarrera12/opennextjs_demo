"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Column } from "./types";
import { createTask, updateTask } from "@/actions/task-actions";
import { uploadImage } from "@/actions/upload-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTaskModal } from "@/hooks/use-task-modal";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.string(),
  priority: z.string(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

interface TaskModalProps {
  columns: Column[];
}

export function TaskModal({ columns }: TaskModalProps) {
  const { isOpen, onClose, type, data } = useTaskModal();
  const t = useTranslations("admin"); // Assuming you have translations, or fallback strings
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get default status from first column or provided data
  const getDefaultStatus = () => {
    if (data?.status) return data.status;
    if (columns.length > 0) return columns[0].id;
    return "";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      status: getDefaultStatus(),
      priority: "medium",
      dueDate: "",
      description: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (isOpen && data) {
      // Parse tags from JSON if they exist
      let tagsString = "";
      if (data.tags && typeof data.tags === "object" && Array.isArray(data.tags)) {
        tagsString = (data.tags as Array<{ label: string }>).map((tag) => tag.label).join(", ");
      }

      // Use status from data, or default to first column if status doesn't exist in columns
      const statusValue =
        data.status && columns.some((c) => c.id === data.status)
          ? data.status
          : columns.length > 0
            ? columns[0].id
            : "";

      form.reset({
        title: data.title,
        status: statusValue,
        priority: data.priority || "medium",
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "",
        description: (data as any).description || "",
        tags: tagsString,
      });

      // Set image preview if exists
      if (data.image) {
        setImagePreview(data.image);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      // When creating new task, use status from data if provided (e.g., when clicking "Add New Task" from a column)
      const defaultStatus =
        data?.status && columns.some((c) => c.id === data.status)
          ? data.status
          : columns.length > 0
            ? columns[0].id
            : "";

      form.reset({
        title: "",
        status: defaultStatus,
        priority: "medium",
        dueDate: "",
        description: "",
        tags: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [isOpen, data, form, columns]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const result = await uploadImage(file, "task");
      if ("error" in result) {
        toast.error(result.error);
        return null;
      }
      return result.url;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);

      // Upload image if a new one was selected
      let imageUrl: string | null | undefined = undefined;

      if (imageFile) {
        // New image selected - upload it
        console.log("Uploading new image...");
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          console.log("Image uploaded successfully:", uploadedUrl);
          imageUrl = uploadedUrl;
        } else {
          console.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
      } else if (imagePreview && !imagePreview.startsWith("data:")) {
        // Existing image from DB (not a data URL) - keep it
        console.log("Keeping existing image:", imagePreview);
        imageUrl = imagePreview;
      } else if (!imagePreview) {
        // No image - set to null for updates, undefined for creates
        console.log("No image to save");
        imageUrl = type === "create" ? undefined : null;
      } else {
        // imagePreview is a data URL (temporary) but no file selected - ignore it
        console.log("Ignoring temporary data URL preview");
        imageUrl = type === "create" ? undefined : null;
      }

      console.log("Final imageUrl to save:", imageUrl);

      // Parse tags from comma-separated string
      let tagsArray: Array<{ label: string; color: string }> = [];
      if (values.tags && values.tags.trim()) {
        const tagLabels = values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        tagsArray = tagLabels.map((label) => ({
          label,
          color: "blue" as const, // Default color, can be enhanced later
        }));
      }

      if (type === "create") {
        const result = await createTask({
          title: values.title,
          status: values.status,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
          description: values.description || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          image: imageUrl ?? undefined,
        });
        if (result.error) {
          toast.error(result.error);
          setIsUploading(false);
          return;
        }
        toast.success("Task created successfully");
      } else {
        // Update
        if (!data?.id) {
          setIsUploading(false);
          return;
        }
        const result = await updateTask(data.id, {
          title: values.title,
          status: values.status,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate) : null,
          description: values.description || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          image: imageUrl !== undefined ? imageUrl : null,
        });
        if (result.error) {
          toast.error(result.error);
          setIsUploading(false);
          return;
        }
        toast.success("Task updated successfully");
      }
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setIsUploading(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === "create" ? "Create Task" : "Edit Task"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="tag1, tag2, tag3 (separated by commas)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-md overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          // Clear the file input
                          const fileInput = document.querySelector(
                            'input[type="file"]'
                          ) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.value = "";
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>

            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Saving..." : type === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
