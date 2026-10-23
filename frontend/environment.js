const server =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://golfgamebackend.onrender.com";

export default server;