import { apiGet, apiPost, mockDelay } from "./api";
import {
  initialCourses,
  initialProjects,
  initialCertifications,
  initialActivityTimeline,
} from "../data/learningHistory";

// Service layer for Student Learning History (Courses, Projects, Certifications, Activity Feed).
// Backed directly by SQLite database with automatic fallback.

export async function fetchLearningHistory() {
  try {
    const data = await apiGet("/learning-history");
    return {
      courses: data.courses || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
    };
  } catch {
    return mockDelay({
      courses: initialCourses,
      projects: initialProjects,
      certifications: initialCertifications,
    });
  }
}

export async function addCourseRecord(course) {
  try {
    const res = await apiPost("/learning-history/course", course);
    return res.course;
  } catch {
    const newCourse = {
      id: `course_${Date.now()}`,
      ...course,
      verified: false,
      addedAt: new Date().toISOString(),
    };
    return mockDelay(newCourse);
  }
}

export async function addProjectRecord(project) {
  try {
    const res = await apiPost("/learning-history/sync-github", { repos: [project] });
    return res.projects ? res.projects[0] : project;
  } catch {
    const newProject = {
      id: `proj_${Date.now()}`,
      ...project,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    return mockDelay(newProject);
  }
}

export async function addCertificationRecord(cert) {
  try {
    const res = await apiPost("/learning-history/certification", cert);
    return res.certification;
  } catch {
    const newCert = {
      id: `cert_${Date.now()}`,
      ...cert,
      verified: false,
      addedAt: new Date().toISOString(),
    };
    return mockDelay(newCert);
  }
}

export async function fetchActivityTimeline(filters = {}) {
  try {
    const res = await apiGet("/learning-history/timeline");
    let list = res.timeline || [];
    if (filters.skill && filters.skill !== "all") {
      list = list.filter((item) => item.skillId === filters.skill || item.skill?.toLowerCase() === filters.skill.toLowerCase());
    }
    if (filters.activityType && filters.activityType !== "all") {
      list = list.filter((item) => item.activityType === filters.activityType);
    }
    return list;
  } catch {
    let list = [...initialActivityTimeline];
    if (filters.skill && filters.skill !== "all") {
      list = list.filter((item) => item.skillId === filters.skill || item.skill?.toLowerCase() === filters.skill.toLowerCase());
    }
    if (filters.activityType && filters.activityType !== "all") {
      list = list.filter((item) => item.activityType === filters.activityType);
    }
    return mockDelay(list);
  }
}
