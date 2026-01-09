import { DEFAULT_GRADING_SCALE } from '../config/constants';

export interface GradingScale {
  grade: string;
  minMarks: number;
  maxMarks: number;
  description?: string;
}

export function calculateGrade(marks: number, totalMarks: number, gradingScale: GradingScale[] = DEFAULT_GRADING_SCALE): string {
  const percentage = (marks / totalMarks) * 100;
  
  for (const scale of gradingScale) {
    if (percentage >= scale.minMarks && percentage <= scale.maxMarks) {
      return scale.grade;
    }
  }
  
  return 'F'; // Default to fail if no match
}

export function calculatePercentage(marks: number, totalMarks: number): number {
  return Math.round((marks / totalMarks) * 100 * 100) / 100; // Round to 2 decimal places
}


