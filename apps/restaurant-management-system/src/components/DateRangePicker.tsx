'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns';

import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/button';
import { Calendar } from '@repo/ui/components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { useTranslations } from 'next-intl';

export interface DateRangeValue {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
}

type PresetKey = 'today' | 'thisWeek' | 'thisMonth' | 'custom';

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const t = useTranslations('reports');
  const [open, setOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] =
    React.useState<PresetKey>('today');

  // Determine current preset based on value
  React.useEffect(() => {
    const today = startOfToday();
    const todayEnd = endOfToday();

    if (
      value.start.getTime() === today.getTime() &&
      value.end.getTime() === todayEnd.getTime()
    ) {
      setSelectedPreset('today');
    } else if (
      value.start.getTime() === startOfWeek(today).getTime() &&
      value.end.getTime() === endOfWeek(today).getTime()
    ) {
      setSelectedPreset('thisWeek');
    } else if (
      value.start.getTime() === startOfMonth(today).getTime() &&
      value.end.getTime() === endOfMonth(today).getTime()
    ) {
      setSelectedPreset('thisMonth');
    } else {
      setSelectedPreset('custom');
    }
  }, [value]);

  const handlePresetChange = (preset: PresetKey) => {
    setSelectedPreset(preset);

    const today = new Date();

    switch (preset) {
      case 'today':
        onChange({ start: startOfToday(), end: endOfToday() });
        break;
      case 'thisWeek':
        onChange({ start: startOfWeek(today), end: endOfWeek(today) });
        break;
      case 'thisMonth':
        onChange({ start: startOfMonth(today), end: endOfMonth(today) });
        break;
      case 'custom':
        // Keep current selection
        break;
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ start: range.from, end: range.to });
      setSelectedPreset('custom');
    }
  };

  const formatDateDisplay = () => {
    if (selectedPreset !== 'custom') {
      return t(selectedPreset);
    }
    return `${format(value.start, 'MMM d')} - ${format(value.end, 'MMM d, yyyy')}`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Preset selector */}
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">{t('today')}</SelectItem>
          <SelectItem value="thisWeek">{t('thisWeek')}</SelectItem>
          <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
          <SelectItem value="custom">{t('custom')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Date range picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={value.start}
            selected={{ from: value.start, to: value.end }}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            captionLayout="dropdown-months"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
