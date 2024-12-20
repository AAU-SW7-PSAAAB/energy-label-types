import z from "zod";

/**
 * Statuscodes for a run of a plugin
 * */
export enum StatusCodes {
	Success = 0,
	NoDocument = 1100,
	NoDom = 1101,
	NoCss = 1102,
	NoNetwork = 1200,
	InvalidScore = 2000,
	AnalysisTimeout = 2001,
	FailureNotSpecified = 9999,
	TestRun = 10000,
}

export const statusCodeEnum = z.nativeEnum(StatusCodes);

/**
 * Zod object for validating a run object
 * */
export const run = z.object({
	score: z.number(),
	statusCode: statusCodeEnum,
	errorMessage: z.string().optional(),
	browserName: z.string(),
	browserVersion: z.string(),
	pluginName: z.string(),
	pluginVersion: z.string(),
	extensionVersion: z.string(),
	url: z.string(),
	path: z.string(),
});

/**
 * Zod object for validating a version object
 * */
export const version = z.object({
	version: z.string(),
});

/**
 * Type of a Run
 * */
export type Run = z.infer<typeof run>;

/**
 * Type of a Version
 * */
export type Version = z.infer<typeof version>;

/**
 * Used when calling an endpoint that requires nothing in the body
 * */
export const nodata = undefined;

/**
 * Type of nodata
 */
export type NoData = undefined;

/**
 * Paths exported by the server
 */
export type Paths = keyof typeof callConsts;

export const callConsts = {
	"/log": {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		parse: () => undefined,
	},
	"/version": {
		method: "GET",
		headers: {},
		parse: (r: Response) => r.json().then(version.parse),
	},
};

export interface CallTypes {
	"/log": {
		data: Run | Array<Run>;
		return: void;
	};

	"/version": {
		data: NoData;
		return: Version;
	};
}

/**
 * Creates a connection to the log server
 * */
export class Server {
	domain: string;
	constructor(domain: string) {
		this.domain = domain;
	}

	/**
	 * Calls the log server
	 *   Valid endpoints are:
	 *     /log (data Run) :: for logging a run
	 *     /version nodata :: for getting the version of the server
	 * */
	async call<P extends keyof CallTypes>(
		path: P,
		data: CallTypes[P]["data"],
	): Promise<CallTypes[P]["return"]> {
		const response = await fetch(`http://${this.domain}${path}`, {
			method: callConsts[path].method,
			headers: callConsts[path].headers,
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("An error has occurred: " + response.statusText);
		}

		return callConsts[path].parse(response);
	}
}
