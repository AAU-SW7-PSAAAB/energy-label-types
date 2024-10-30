import z from 'zod'

/**
 * Statuscodes for a run of a plugin
 * */
export enum StatusCodes {
	Success = 0,
	FailureNotSpecified = 999,
}

export const statusCodeEnum = z.nativeEnum(StatusCodes)

/**
 * Zod object for validating a run object
 * */
export const run = z.object({
	score: z.number(),
	statusCode: statusCodeEnum,
	browserName: z.string(),
	browserVersion: z.string(),
	pluginName: z.string(),
	pluginVersion: z.string(),
	extensionVersion: z.string(),
	url: z.string(),
	path: z.string(),
})

/**
 * Zod object for validating a version object
 * */
export const version = z.object({
	version: z.string(),
})

/**
 * Type of a Run
 * */
export type Run = z.infer<typeof run>

/**
 * Type of a Version
 * */
export type Version = z.infer<typeof version>

/**
 * Used when calling an endpoint that requires nothing in the body
 * */
export const nodata = undefined

/**
 * Type of nodata
 */
export type NoData = undefined

/**
 * Paths exported by the server
 */
export type Paths = keyof typeof callConsts

export const callConsts = {
	'/log': {
		method: 'POST',
		parse: () => undefined,
	},
	'/version': {
		method: 'GET',
		parse: (r: Response) => r.json().then(version.parse),
	},
}

export interface CallTypes {
	'/log': {
		data: Run | Array<Run>
		return: void
	}

	'/version': {
		data: NoData
		return: Version
	}
}

/**
 * Creates a connection to the log server
 * */
export class Server {
	domain: string
	constructor(domain: string) {
		this.domain = domain
	}

	/**
	 * Calls the log server
	 *   Valid endpoints are:
	 *     /log (data Run) :: for logging a run
	 *     /version nodata :: for getting the version of the server
	 * */
	async call<P extends keyof CallTypes>(
		path: P,
		data: CallTypes[P]['data']
	): Promise<CallTypes[P]['return']> {
		return await fetch(`http://${this.domain}${path}`, {
			method: callConsts[path].method,
			body: JSON.stringify(data),
		}).then(callConsts[path].parse)
	}
}
