export const departmentPlacements = [
  { department: "CSE", placed: 145, total: 160, avgCTC: 8.5 },
  { department: "CSBS", placed: 52, total: 60, avgCTC: 7.2 },
  { department: "IT", placed: 110, total: 130, avgCTC: 7.8 },
  { department: "ECE", placed: 85, total: 120, avgCTC: 6.5 },
  { department: "ME", placed: 45, total: 90, avgCTC: 5.8 },
  { department: "CE", placed: 30, total: 70, avgCTC: 5.2 },
  { department: "EE", placed: 40, total: 80, avgCTC: 6.0 },
];

export const cgpaPlacementData = [
  { cgpa: 6.2, ctc: 3.5, placed: true, name: "Rahul S." },
  { cgpa: 7.1, ctc: 5.0, placed: true, name: "Priya K." },
  { cgpa: 8.5, ctc: 12.0, placed: true, name: "Amit V." },
  { cgpa: 9.2, ctc: 18.5, placed: true, name: "Sneha R." },
  { cgpa: 5.8, ctc: 0, placed: false, name: "Ravi M." },
  { cgpa: 7.8, ctc: 7.5, placed: true, name: "Neha G." },
  { cgpa: 6.5, ctc: 4.2, placed: true, name: "Vikram P." },
  { cgpa: 8.0, ctc: 9.0, placed: true, name: "Ananya D." },
  { cgpa: 5.5, ctc: 0, placed: false, name: "Karan J." },
  { cgpa: 7.5, ctc: 6.8, placed: true, name: "Deepa L." },
  { cgpa: 9.0, ctc: 15.0, placed: true, name: "Arjun N." },
  { cgpa: 6.8, ctc: 4.8, placed: true, name: "Meera T." },
  { cgpa: 8.3, ctc: 10.5, placed: true, name: "Suresh B." },
  { cgpa: 5.2, ctc: 0, placed: false, name: "Pooja H." },
  { cgpa: 7.3, ctc: 6.0, placed: true, name: "Rohit C." },
  { cgpa: 8.8, ctc: 14.0, placed: true, name: "Kavya W." },
  { cgpa: 6.0, ctc: 3.0, placed: true, name: "Arun F." },
  { cgpa: 7.9, ctc: 8.2, placed: true, name: "Divya E." },
  { cgpa: 5.0, ctc: 0, placed: false, name: "Mohan Q." },
  { cgpa: 8.7, ctc: 13.0, placed: true, name: "Lakshmi Z." },
];

export const companyData = [
  { company: "TCS", offers: 45, avgCTC: 4.5, highestCTC: 7.0 },
  { company: "Infosys", offers: 38, avgCTC: 4.8, highestCTC: 8.0 },
  { company: "Wipro", offers: 30, avgCTC: 4.2, highestCTC: 6.5 },
  { company: "Microsoft", offers: 8, avgCTC: 18.0, highestCTC: 24.0 },
  { company: "Google", offers: 3, avgCTC: 22.0, highestCTC: 30.0 },
  { company: "Amazon", offers: 12, avgCTC: 14.5, highestCTC: 20.0 },
  { company: "Deloitte", offers: 20, avgCTC: 7.5, highestCTC: 12.0 },
  { company: "Capgemini", offers: 25, avgCTC: 5.0, highestCTC: 8.5 },
];

export const selectionFunnelData = [
  { stage: "Registered", count: 710 },
  { stage: "Applied", count: 620 },
  { stage: "Shortlisted", count: 380 },
  { stage: "Interviewed", count: 290 },
  { stage: "Offered", count: 210 },
  { stage: "Placed", count: 195 },
];

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  batch: string;
  cgpa: number;
  skills: string[];
  internship: string;
  placementStatus: "Placed" | "Unplaced" | "In Process";
  company?: string;
  ctc?: number;
  eventDate?: string;
  historyOfArrears: number;
  currentArrears: number;
}

export const students: Student[] = [
  { id: "1", name: "Rahul Sharma", rollNo: "CSE2021001", branch: "CSE", batch: "2025", cgpa: 8.5, skills: ["Java", "Python", "ML"], internship: "Google (Summer 2024)", placementStatus: "Placed", company: "Microsoft", ctc: 18.5, eventDate: "2024-12-15", historyOfArrears: 0, currentArrears: 0 },
  { id: "2", name: "Priya Kapoor", rollNo: "CSE2021015", branch: "CSE", batch: "2025", cgpa: 9.1, skills: ["C++", "React", "Node.js"], internship: "Amazon (Summer 2024)", placementStatus: "Placed", company: "Google", ctc: 30.0, eventDate: "2024-11-20", historyOfArrears: 0, currentArrears: 0 },
  { id: "3", name: "Amit Verma", rollNo: "IT2021008", branch: "IT", batch: "2025", cgpa: 7.8, skills: ["Python", "Django", "SQL"], internship: "Infosys (Summer 2024)", placementStatus: "Placed", company: "Deloitte", ctc: 8.0, eventDate: "2025-01-10", historyOfArrears: 1, currentArrears: 0 },
  { id: "4", name: "Sneha Reddy", rollNo: "ECE2021023", branch: "ECE", batch: "2025", cgpa: 8.2, skills: ["VLSI", "Embedded C"], internship: "Texas Instruments", placementStatus: "In Process", historyOfArrears: 0, currentArrears: 0 },
  { id: "5", name: "Vikram Patel", rollNo: "ME2021011", branch: "ME", batch: "2025", cgpa: 7.0, skills: ["AutoCAD", "SolidWorks"], internship: "Tata Motors", placementStatus: "Unplaced", historyOfArrears: 2, currentArrears: 1 },
  { id: "6", name: "Neha Gupta", rollNo: "CSBS2021003", branch: "CSBS", batch: "2025", cgpa: 8.8, skills: ["Data Analytics", "Tableau", "Python"], internship: "Deloitte", placementStatus: "Placed", company: "Amazon", ctc: 14.5, eventDate: "2024-12-22", historyOfArrears: 0, currentArrears: 0 },
  { id: "7", name: "Karan Joshi", rollNo: "CE2021017", branch: "CE", batch: "2025", cgpa: 6.5, skills: ["Civil Design", "AutoCAD"], internship: "L&T", placementStatus: "Unplaced", historyOfArrears: 3, currentArrears: 2 },
  { id: "8", name: "Deepa Lakshmi", rollNo: "CSE2021029", branch: "CSE", batch: "2025", cgpa: 7.5, skills: ["Java", "Spring Boot"], internship: "TCS", placementStatus: "Placed", company: "Infosys", ctc: 5.0, eventDate: "2025-01-05", historyOfArrears: 0, currentArrears: 0 },
  { id: "9", name: "Arjun Nair", rollNo: "IT2021042", branch: "IT", batch: "2025", cgpa: 9.0, skills: ["Full Stack", "AWS", "Docker"], internship: "Microsoft", placementStatus: "Placed", company: "Microsoft", ctc: 24.0, eventDate: "2024-11-28", historyOfArrears: 0, currentArrears: 0 },
  { id: "10", name: "Meera Thomas", rollNo: "EE2021006", branch: "EE", batch: "2025", cgpa: 7.2, skills: ["Power Systems", "MATLAB"], internship: "Siemens", placementStatus: "In Process", historyOfArrears: 1, currentArrears: 0 },
  { id: "11", name: "Suresh Babu", rollNo: "CSE2021033", branch: "CSE", batch: "2024", cgpa: 8.3, skills: ["AI/ML", "TensorFlow"], internship: "NVIDIA", placementStatus: "Placed", company: "Amazon", ctc: 20.0, eventDate: "2024-02-15", historyOfArrears: 0, currentArrears: 0 },
  { id: "12", name: "Kavya Menon", rollNo: "CSBS2021009", branch: "CSBS", batch: "2024", cgpa: 8.7, skills: ["Data Science", "R", "SQL"], internship: "McKinsey", placementStatus: "Placed", company: "Deloitte", ctc: 12.0, eventDate: "2024-01-20", historyOfArrears: 0, currentArrears: 0 },
];

export interface HomeworkTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  assignedTo: string[]; // List of student IDs
  viewedBy: string[]; // List of student IDs who viewed
  completedBy: string[]; // List of student IDs who completed
}

export let mockHomeworkTasks: HomeworkTask[] = [
  {
    id: "hw-1",
    title: "Resume Refinement",
    description: "Please update your resume with recent internships and match the college template.",
    deadline: "2025-05-20",
    assignedTo: ["1", "3", "5"],
    viewedBy: ["1", "3"],
    completedBy: ["1"]
  },
  {
    id: "hw-2",
    title: "DSA Practice Test 1",
    description: "Complete the array and string manipulation questions on LeetCode.",
    deadline: "2025-05-25",
    assignedTo: ["1", "2", "3", "4", "5", "6"],
    viewedBy: ["1", "2"],
    completedBy: []
  }
];

export const addTask = (task: HomeworkTask) => {
  mockHomeworkTasks = [task, ...mockHomeworkTasks];
  window.dispatchEvent(new Event("tasksUpdated"));
};

export const completeTask = (taskId: string, studentId: string) => {
  mockHomeworkTasks = mockHomeworkTasks.map(task => {
    if (task.id === taskId && !task.completedBy.includes(studentId)) {
      return { ...task, completedBy: [...task.completedBy, studentId] };
    }
    return task;
  });
  window.dispatchEvent(new Event("tasksUpdated"));
};
