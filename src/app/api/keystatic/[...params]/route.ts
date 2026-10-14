import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { cmsEnabled } from "@/lib/cms";

const handler = makeRouteHandler({ config });
const notFound = () => new Response("Not found", { status: 404 });

export const GET = cmsEnabled ? handler.GET : notFound;
export const POST = cmsEnabled ? handler.POST : notFound;
