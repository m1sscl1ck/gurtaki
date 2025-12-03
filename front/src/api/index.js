import axios from "axios";

const USE_MOCK = true; // ← вимкнути коли зʼявиться бекенд

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});


const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockResponses = {
  testGet: { message: "Hello from mock GET!", items: [1, 2, 3] },

  testPost: (body) => ({
    message: "Mock POST success!",
    received: body,
  }),

  login: (email) => ({
    success: true,
    token: "mock-jwt-token-12345",
    user: { email },
  }),

  register: (email) => ({
    success: true,
    message: "Mock registration completed",
    user: { email },
  }),
};


export const testGet = async () => {
  if (USE_MOCK) {
    await mockDelay();
    return mockResponses.testGet;
  }

  try {
    const res = await api.get("/test");
    return res.data;
  } catch (err) {
    console.error("testGet error:", err);
    return null;
  }
};

export const testPost = async (body) => {
  if (USE_MOCK) {
    await mockDelay();
    return mockResponses.testPost(body);
  }

  try {
    const res = await api.post("/test-post", body);
    return res.data;
  } catch (err) {
    console.error("testPost error:", err);
    return null;
  }
};

export const login = async (email, password) => {
  if (USE_MOCK) {
    await mockDelay();
    return mockResponses.login(email);
  }

  return api.post("/auth/login", { email, password });
};

export const register = async (formData) => {
  if (USE_MOCK) {
    await mockDelay();
    return mockResponses.register(formData.get('name') || 'user');
  }

  return api.post("/auth/register", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
