import { sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
    { duration: "5m", target: 100 }, // stay at 100 users for 10 minutes
    { duration: "30s", target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
    // "logged in successfully": ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = "http://localhost:3000";

export default () => {
  //   const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
  //     username: USERNAME,
  //     password: PASSWORD,
  //   });

  //   check(loginRes, {
  //     "logged in successfully": (resp) => resp.json("access") !== "",
  //   });

  //   const authHeaders = {
  //     headers: {
  //       Authorization: `Bearer ${loginRes.json("access")}`,
  //     },
  //   };

  http.get(`${BASE_URL}`);
  sleep(1);
};
