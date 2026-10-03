import type { NextConfig } from "next";

// Fully static: the browser calls iNaturalist and Zippopotam.us directly (both send CORS *).
const nextConfig: NextConfig = { output: "export" };

export default nextConfig;
