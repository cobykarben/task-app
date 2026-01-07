import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Upload, CalendarIcon } from "lucide-react";
import { labels } from "@/lib/labels";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/types/models";
import { useDropzone } from "react-dropzone";

interface CreateTaskFormProps {
  onSubmit: (
    title: string,
    description: string,
    label: Task["label"] | null,
    priority: "low" | "medium" | "high" | "urgent" | null,
    estimatedDuration: number | null,
    dueDate: Date | undefined,
    imageFile: File | null
  ) => Promise<void>;
  onImageUpload?: (imageFile: File) => Promise<void>;
}

export function CreateTaskForm({ onSubmit, onImageUpload }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState<Task["label"] | null>(null);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent" | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useImageMode, setUseImageMode] = useState(false);
  const [ocrImageFile, setOcrImageFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        if (useImageMode) {
          setOcrImageFile(acceptedFiles[0]);
        } else {
          setImageFile(acceptedFiles[0]);
        }
      }
    },
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxFiles: 1,
  });

  const handleImageToTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrImageFile || !onImageUpload) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await onImageUpload(ocrImageFile);
      setOcrImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task from image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(title, description, label, priority, estimatedDuration, dueDate, imageFile);
      setTitle("");
      setDescription("");
      setLabel(null);
      setPriority(null);
      setEstimatedDuration(null);
      setDueDate(undefined);
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle between manual entry and image mode */}
      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => {
            setUseImageMode(false);
            setOcrImageFile(null);
          }}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t transition-colors",
            !useImageMode
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => {
            setUseImageMode(true);
            setImageFile(null);
          }}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t transition-colors",
            useImageMode
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          📸 Upload Image
        </button>
      </div>

      {useImageMode ? (
        <form onSubmit={handleImageToTask} className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Handwritten Task Image</Label>
            <p className="text-xs text-gray-500">
              Take a photo or upload an image of a handwritten sticky note with task details
            </p>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-md p-6 text-center cursor-pointer",
                isDragActive ? "border-blue-500" : "border-gray-300"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm text-blue-500">Drop the image here...</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-400">Supports: JPEG, PNG</p>
                  {ocrImageFile && (
                    <p className="text-xs text-blue-500 mt-2">
                      Selected: {ocrImageFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !ocrImageFile}
            className="w-full"
          >
            {isSubmitting ? "Processing Image..." : "Create Task from Image"}
          </Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Label</Label>
        <Select
          value={label || ""}
          onValueChange={(value) =>
            setLabel(value ? (value as Task["label"]) : null)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a label" />
          </SelectTrigger>
          <SelectContent>
            {labels.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Priority</Label>
        <Select
          value={priority || ""}
          onValueChange={(value) =>
            setPriority(value ? (value as "low" | "medium" | "high" | "urgent") : null)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Estimated Duration (minutes)</Label>
        <Input
          type="number"
          min="0"
          placeholder="e.g., 30, 120"
          value={estimatedDuration || ""}
          onChange={(e) =>
            setEstimatedDuration(e.target.value ? parseInt(e.target.value) : null)
          }
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Attach Image</Label>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-md p-6 text-center cursor-pointer",
            isDragActive ? "border-blue-500" : "border-gray-300"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-blue-500">Drop the image here...</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-gray-400">Supports: JPEG, PNG</p>
              {imageFile && (
                <p className="text-xs text-blue-500 mt-2">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
