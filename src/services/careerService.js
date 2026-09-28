import { careers, getCareerById } from "../data/careers";
import { mockDelay } from "./api";

// Mirrors GET /api/careers
export async function fetchCareers() {
  return mockDelay(careers);
}

// Mirrors GET /api/careers/:id
export async function fetchCareerById(id) {
  return mockDelay(getCareerById(id));
}
