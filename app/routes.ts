import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/teams", "routes/teams.tsx"),
  route("/teams/:id", "routes/teams.$id.tsx"),
  route("/applications/:id", "routes/applications.$id.tsx")
] satisfies RouteConfig;
