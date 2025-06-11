
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimePickerInput({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
}: TimePickerInputProps) {
  const [inputValue, setInputValue] = useState(value || '');

  // Update internal state when the value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate time format (HH:MM)
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newValue)) {
      onChange(newValue);
    }
  };

  // When input loses focus, format the time or clear if invalid
  const handleBlur = () => {
    if (inputValue && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(inputValue)) {
      setInputValue('');
      onChange('');
    }
  };

  return (
    <Input
      type="time"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full"
    />
  );
}
