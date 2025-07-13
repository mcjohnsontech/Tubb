import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
    index("routes/dashboard.tsx"),
    route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
