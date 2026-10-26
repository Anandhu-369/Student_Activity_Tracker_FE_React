
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export const getActivities = () => api.get("/activities/");

export const addActivity = (data) =>
  api.post("/activities/", data);

export const getSummary = () =>
  api.get("/activities/summary/");
