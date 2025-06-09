// routes.tsx
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("projects", "routes/projects.tsx"),
    route("contact", "routes/contact.tsx"),
    route("projects/rps", "projects/RockPaperScissors.tsx"),
    route("projects/xo", "projects/xo.tsx"),
    route("projects/wifi-qr", "projects/wifi-qr.tsx")
] satisfies RouteConfig;
