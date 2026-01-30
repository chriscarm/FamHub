import { SlideImage, CalendarEvent, TodoItem } from '../types';

// Dummy images - beautiful high-res photos for the slideshow
export const mockImages: SlideImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1200&fit=crop',
    title: 'Mountain Sunrise',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1200&fit=crop',
    title: 'Ocean Waves',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1200&fit=crop',
    title: 'Foggy Forest',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1200&fit=crop',
    title: 'Sunlit Path',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1200&fit=crop',
    title: 'Valley View',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&h=1200&fit=crop',
    title: 'Autumn Forest',
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&h=1200&fit=crop',
    title: 'Waterfall',
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=1200&fit=crop',
    title: 'Lake Reflection',
  },
];

// Get current month dates for demo events
const getDateString = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Dummy calendar events
export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: getDateString(1),
    person: 'chris',
    time: '10:00',
  },
  {
    id: '2',
    title: 'Dentist Appointment',
    date: getDateString(2),
    person: 'christy',
    time: '14:30',
  },
  {
    id: '3',
    title: 'Gym Session',
    date: getDateString(3),
    person: 'chris',
    time: '07:00',
  },
  {
    id: '4',
    title: 'Lunch with Sarah',
    date: getDateString(3),
    person: 'christy',
    time: '12:00',
  },
  {
    id: '5',
    title: 'Project Deadline',
    date: getDateString(5),
    person: 'chris',
  },
  {
    id: '6',
    title: 'Book Club',
    date: getDateString(7),
    person: 'christy',
    time: '19:00',
  },
  {
    id: '7',
    title: 'Date Night',
    date: getDateString(7),
    person: 'chris',
    time: '19:00',
  },
  {
    id: '8',
    title: 'Doctor Checkup',
    date: getDateString(10),
    person: 'christy',
    time: '09:00',
  },
  {
    id: '9',
    title: 'Conference Call',
    date: getDateString(12),
    person: 'chris',
    time: '15:00',
  },
  {
    id: '10',
    title: 'Yoga Class',
    date: getDateString(14),
    person: 'christy',
    time: '18:00',
  },
];

// Dummy todo items
export const mockTodos: TodoItem[] = [
  {
    id: '1',
    text: 'Pick up groceries',
    person: 'chris',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    text: 'Call mom',
    person: 'christy',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    text: 'Schedule car maintenance',
    person: 'chris',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    text: 'Order birthday gift',
    person: 'christy',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    text: 'Review budget spreadsheet',
    person: 'chris',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];
