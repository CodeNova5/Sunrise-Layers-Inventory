import { addDays, subDays } from "date-fns";
import { DateRangePreset } from "../../../../components/ui/date-range";

export const overduePresets: DateRangePreset[] = [
  {
    id: "today",
    label: "Today",
    apply: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    apply: () => ({
      from: addDays(new Date(), 1),
      to: addDays(new Date(), 1),
    }),
  },
  {
    id: "this-week",
    label: "This Week",
    apply: () => {
      const today = new Date();
      var startOfWeek = subDays(today, today.getDay());
      var endOfWeek = addDays(startOfWeek, 6);
      return {
        from: startOfWeek,
        to: endOfWeek,
      };
    },
  },
  {
    id: "next-week",
    label: "Next Week",
    apply: () => {
      const today = new Date();
      var startOfWeek = subDays(today, today.getDay() - 7);
      var endOfWeek = addDays(startOfWeek, 6);
      return {
        from: startOfWeek,
        to: endOfWeek,
      };
    },
  },
  {
    id: "this-month",
    label: "This Month",
    apply: () => {
      const today = new Date();
      var startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      var endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        from: startOfMonth,
        to: endOfMonth,
      };
    },
  },
  {
    id: "next-month",
    label: "Next Month",
    apply: () => {
      const today = new Date();
      var startOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      var endOfMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      return {
        from: startOfMonth,
        to: endOfMonth,
      };
    },
  },
];

export const createdAtPresets: DateRangePreset[] = [
  {
    id: "today",
    label: "Today",
    apply: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    id: "yesterday",
    label: "Yesterday",
    apply: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    }),
  },
  {
    id: "this-week",
    label: "This Week",
    apply: () => {
      const today = new Date();
      var startOfWeek = subDays(today, today.getDay());
      var endOfWeek = addDays(startOfWeek, 6);
      return {
        from: startOfWeek,
        to: endOfWeek,
      };
    },
  },
  {
    id: "last-week",
    label: "Last Week",
    apply: () => {
      const today = new Date();
      var startOfWeek = subDays(today, today.getDay() - 7);
      var endOfWeek = addDays(startOfWeek, 6);
      return {
        from: startOfWeek,
        to: endOfWeek,
      };
    },
  },
  {
    id: "this-month",
    label: "This Month",
    apply: () => {
      const today = new Date();
      var startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      var endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        from: startOfMonth,
        to: endOfMonth,
      };
    },
  },
  {
    id: "last-month",
    label: "Last Month",
    apply: () => {
      const today = new Date();
      var startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      var endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        from: startOfMonth,
        to: endOfMonth,
      };
    },
  },
];
