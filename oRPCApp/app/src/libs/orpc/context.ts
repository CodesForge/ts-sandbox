import type {RequestHeadersPluginContext, ResponseHeadersPluginContext} from "@orpc/server/plugins";

export interface AppContext extends ResponseHeadersPluginContext, RequestHeadersPluginContext {}