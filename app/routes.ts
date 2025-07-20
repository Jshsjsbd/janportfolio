// routes.tsx
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("banned", "routes/banned.tsx"),
    route("about", "routes/about.tsx"),
    route("projects", "routes/projects.tsx"),
    route("contact", "routes/contact.tsx"),
    route("projects/rps", "projects/RockPaperScissors.tsx"),
    route("projects/xo", "projects/xo.tsx"),
    route("projects/wifi-qr", "projects/wifi-qr.tsx"),
    route("projects/stopcomplete", "projects/stopcomplete.tsx"),
    route("noturbusiness", "routes/noturbusiness.tsx"),
    route("noturbusiness1", "routes/noturbusiness1.tsx")
] satisfies RouteConfig;
