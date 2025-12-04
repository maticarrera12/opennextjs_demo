"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { useTaskModal } from "@/hooks/use-task-modal";
import { createTask, updateTask } from "@/lib/actions/task-actions";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.string(),
  priority: z.string(),
  dueDate: z.string().optional(),
});

export function TaskModal() {
  const { isOpen, onClose, type, data } = useTaskModal();
  const t = useTranslations("admin"); // Assuming you have translations, or fallback strings

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (isOpen && data) {
      form.reset({
        title: data.title,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "",
      });
    } else {
      form.reset({
        title: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
    }
  }, [isOpen, data, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (type === "create") {
        const result = await createTask({
          title: values.title,
          status: values.status,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Task created successfully");
      } else {
        // Update
        if (!data?.id) return;
        const result = await updateTask(data.id, {
          title: values.title,
          status: values.status,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate) : null,
        });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Task updated successfully");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
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

            <DialogFooter>
              <Button type="submit">{type === "create" ? "Create" : "Save"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
