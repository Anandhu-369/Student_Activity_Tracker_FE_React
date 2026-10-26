
import axios from "axios";

const api = axios.create({
  baseURL: "https://student-activity-tracker-be.onrender.com/api",
});

export const getActivities = () => api.get("/activities/");

export const addActivity = (data) =>
  api.post("/activities/", data);

export const getSummary = () =>
  api.get("/activities/summary/");