import { VoiceCommand, Person } from '../types';

/**
 * Parse natural language voice commands into structured commands
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const text = transcript.toLowerCase().trim();

  // Add todo pattern: "add [X] to [person]'s todo/list"
  const addTodoMatch = text.match(
    /add\s+(.+?)\s+to\s+(chris|christy)(?:'s)?\s*(?:todo|list|todos)/i
  );
  if (addTodoMatch) {
    return {
      type: 'ADD_TODO',
      person: addTodoMatch[2].toLowerCase() as Person,
      text: addTodoMatch[1].trim(),
    };
  }

  // Alternative pattern: "add to [person]'s list [X]"
  const addTodoAltMatch = text.match(
    /add\s+to\s+(chris|christy)(?:'s)?\s*(?:todo|list|todos)\s+(.+)/i
  );
  if (addTodoAltMatch) {
    return {
      type: 'ADD_TODO',
      person: addTodoAltMatch[1].toLowerCase() as Person,
      text: addTodoAltMatch[2].trim(),
    };
  }

  // Show calendar
  if (
    text.includes('show calendar') ||
    text.includes('open calendar') ||
    text.includes('calendar please') ||
    text === 'calendar'
  ) {
    return { type: 'SHOW_CALENDAR' };
  }

  // Hide calendar
  if (
    text.includes('hide calendar') ||
    text.includes('close calendar') ||
    text.includes('dismiss calendar')
  ) {
    return { type: 'HIDE_CALENDAR' };
  }

  // Next slide
  if (
    text.includes('next slide') ||
    text.includes('next image') ||
    text.includes('next photo') ||
    text.includes('next picture') ||
    text === 'next'
  ) {
    return { type: 'NEXT_SLIDE' };
  }

  // Previous slide
  if (
    text.includes('previous slide') ||
    text.includes('previous image') ||
    text.includes('previous photo') ||
    text.includes('last slide') ||
    text.includes('go back') ||
    text === 'previous' ||
    text === 'back'
  ) {
    return { type: 'PREVIOUS_SLIDE' };
  }

  // Show todos for specific person
  const showTodosPersonMatch = text.match(
    /(?:show|open|display)\s+(chris|christy)(?:'s)?\s*(?:todo|list|todos)/i
  );
  if (showTodosPersonMatch) {
    return {
      type: 'SHOW_TODOS',
      person: showTodosPersonMatch[1].toLowerCase() as Person,
    };
  }

  // Show all todos
  if (
    text.includes('show todos') ||
    text.includes('show todo') ||
    text.includes('show the list') ||
    text.includes('show lists') ||
    text.includes('open todos')
  ) {
    return { type: 'SHOW_TODOS' };
  }

  // Complete todo
  const completeTodoMatch = text.match(
    /(?:complete|done|finish|check off|mark done)\s+(.+)/i
  );
  if (completeTodoMatch) {
    return {
      type: 'COMPLETE_TODO',
      todoText: completeTodoMatch[1].trim(),
    };
  }

  // Unknown command
  return {
    type: 'UNKNOWN',
    rawText: transcript,
  };
}

/**
 * Extract the command portion after the wake word
 */
export function extractCommandAfterWakeWord(transcript: string): string {
  const wakeWordPatterns = [
    /hey\s+droid[,.]?\s*/i,
    /hey\s+android[,.]?\s*/i,
    /ok\s+droid[,.]?\s*/i,
  ];

  let command = transcript;
  for (const pattern of wakeWordPatterns) {
    command = command.replace(pattern, '');
  }

  return command.trim();
}
