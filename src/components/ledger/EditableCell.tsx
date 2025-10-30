import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { HeaderType } from "@/contexts/LedgerContext";

interface EditableCellProps {
  value: string;
  headerType: HeaderType;
  options?: string[];
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function EditableCell({
  value,
  headerType,
  options,
  onSave,
  onCancel,
  className
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState("");

  const formatTimeInput = (val: string): string => {
    const clean = val.replace(/[^\d.]/g, "");
    
    // If it's just digits (e.g., "1927"), auto-format
    if (/^\d{3,4}$/.test(clean)) {
      const formatted = clean.length === 3
        ? `${clean[0]}:${clean.slice(1)}`
        : `${clean.slice(0, 2)}:${clean.slice(2)}`;
      return formatted;
    }
    
    // If it has colon, ensure seconds are zero-padded
    if (val.includes(":")) {
      const parts = val.split(":");
      if (parts.length === 2) {
        const [mins, secsWithDec] = parts;
        const [secs, dec] = secsWithDec.split(".");
        const paddedSecs = secs.padStart(2, "0");
        return dec ? `${mins}:${paddedSecs}.${dec}` : `${mins}:${paddedSecs}`;
      }
    }
    
    return val;
  };

  const validateAndSave = () => {
    let validatedValue = editValue.trim();
    
    // Validation based on type
    switch (headerType) {
      case "time":
        // Auto-format first
        validatedValue = formatTimeInput(validatedValue);
        
        // Strict validation
        const timePattern = /^\d{1,2}:\d{2}(\.\d{1,2})?$/;
        if (validatedValue && !timePattern.test(validatedValue)) {
          setError("Format: MM:SS or MM:SS.HH");
          return;
        }
        
        // Check seconds don't exceed 59
        if (validatedValue) {
          const [mins, rest] = validatedValue.split(":");
          const secs = parseInt(rest.split(".")[0]);
          if (secs >= 60) {
            setError("Seconds can't exceed 59");
            return;
          }
        }
        break;
      
      case "number":
        if (validatedValue && isNaN(Number(validatedValue))) {
          setError("Must be a number");
          return;
        }
        break;
      
      case "email":
        if (validatedValue && !validatedValue.includes("@")) {
          setError("Must be a valid email");
          return;
        }
        break;
      
      case "phone":
        const phoneDigits = validatedValue.replace(/\D/g, "");
        if (validatedValue && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
          setError("Phone must be 10-15 digits");
          return;
        }
        break;
      
      case "percentage":
        const num = Number(validatedValue.replace("%", ""));
        if (validatedValue && (isNaN(num) || num < 0 || num > 100)) {
          setError("Must be 0-100");
          return;
        }
        validatedValue = validatedValue.includes("%") ? validatedValue : `${validatedValue}%`;
        break;
      
      case "select":
        if (validatedValue && options && !options.includes(validatedValue)) {
          setError("Must match one of the options");
          return;
        }
        break;
    }

    setError("");
    onSave(validatedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndSave();
    }
    if (e.key === "Escape") {
      setError("");
      onCancel();
    }
  };

  // Render different input types
  switch (headerType) {
    case "checkbox":
      const isChecked = value === "true" || value === "Yes";
      return (
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => onSave(checked ? "true" : "false")}
          className="h-5 w-5"
        />
      );

    case "select":
      if (!options || options.length === 0) {
        return (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={validateAndSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className={cn("h-8 min-h-[44px] sm:min-h-[32px]", error && "border-destructive", className)}
          />
        );
      }
      return (
        <Select value={editValue} onValueChange={onSave}>
          <SelectTrigger className={cn("h-8 min-h-[44px] sm:min-h-[32px] text-base md:text-sm", className)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-[250px]">
            {options.map((option) => (
              <SelectItem 
                key={option} 
                value={option}
                className="min-h-[44px] text-base md:text-sm"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "date":
      return (
        <Input
          type="date"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={validateAndSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className={cn("h-8 min-h-[44px] sm:min-h-[32px]", error && "border-destructive", className)}
        />
      );

    case "time":
      return (
        <div className="space-y-1">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9:.]*"
            placeholder="MM:SS or MM:SS.HH"
            value={editValue}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow numbers, colons, and periods
              if (/^[\d:.]*$/.test(val)) {
                setEditValue(val);
              }
            }}
            onBlur={validateAndSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className={cn("h-8 min-h-[44px] sm:min-h-[32px]", error && "border-destructive", className)}
          />
          {error && <div className="text-xs text-destructive">{error}</div>}
        </div>
      );

    case "number":
    case "percentage":
      return (
        <div className="space-y-1">
          <Input
            type="text"
            inputMode="numeric"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={validateAndSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className={cn("h-8 min-h-[44px] sm:min-h-[32px]", error && "border-destructive", className)}
          />
          {error && <div className="text-xs text-destructive">{error}</div>}
        </div>
      );

    case "email":
    case "phone":
    case "text":
    default:
      return (
        <div className="space-y-1">
          <Input
            type={headerType === "email" ? "email" : headerType === "phone" ? "tel" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={validateAndSave}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={64}
            className={cn("h-8 min-h-[44px] sm:min-h-[32px]", error && "border-destructive", className)}
          />
          {error && <div className="text-xs text-destructive">{error}</div>}
        </div>
      );
  }
}
