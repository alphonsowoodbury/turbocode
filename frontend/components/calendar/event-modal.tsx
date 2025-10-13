"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent, EventType } from "@/lib/types";

interface EventModalProps {
  event: CalendarEvent | null;
  initialDate: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => Promise<void>;
}

type FormData = {
  title: string;
  description: string;
  date: string;
  time: string;
  event_type: EventType;
  priority: "low" | "medium" | "high" | "critical" | "";
  status: string;
  project_id: string;
};

export function EventModal({ event, initialDate, isOpen, onClose, onSave }: EventModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    event_type: "issue",
    priority: "",
    status: "open",
    project_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (event) {
      // Edit mode
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title,
        description: event.description || "",
        date: format(eventDate, "yyyy-MM-dd"),
        time: format(eventDate, "HH:mm"),
        event_type: event.event_type,
        priority: (event.priority as any) || "",
        status: event.status || "open",
        project_id: event.project_id || "",
      });
    } else if (initialDate) {
      // Create mode with initial date
      setFormData({
        title: "",
        description: "",
        date: format(initialDate, "yyyy-MM-dd"),
        time: format(initialDate, "HH:mm"),
        event_type: "issue",
        priority: "",
        status: "open",
        project_id: "",
      });
    } else {
      // Create mode with current date
      const now = new Date();
      setFormData({
        title: "",
        description: "",
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm"),
        event_type: "issue",
        priority: "",
        status: "open",
        project_id: "",
      });
    }
  }, [event, initialDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const eventData: Partial<CalendarEvent> = {
        title: formData.title,
        description: formData.description || null,
        date: dateTime.toISOString(),
        event_type: formData.event_type,
        priority: formData.priority || null,
        status: formData.status,
        project_id: formData.project_id || null,
      };

      if (event) {
        eventData.id = event.id;
      }

      await onSave(eventData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Event Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <select
              value={formData.event_type}
              onChange={(e) => handleChange("event_type", e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="issue">Issue</option>
              <option value="milestone">Milestone</option>
              <option value="initiative">Initiative</option>
              <option value="podcast_episode">Podcast Episode</option>
              <option value="literature">Literature</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter event title..."
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-y"
              placeholder="Enter event description..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Status (conditional based on event type) */}
          {(formData.event_type === "issue" || formData.event_type === "milestone" || formData.event_type === "initiative") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {formData.event_type === "issue" && (
                  <>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="testing">Testing</option>
                    <option value="closed">Closed</option>
                  </>
                )}
                {formData.event_type === "milestone" && (
                  <>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
                {formData.event_type === "initiative" && (
                  <>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Project ID (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Project ID <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.project_id}
              onChange={(e) => handleChange("project_id", e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter project UUID..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                "px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium",
                "hover:bg-primary/90 transition-colors",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading}
            >
              {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
