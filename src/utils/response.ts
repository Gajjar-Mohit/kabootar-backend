export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	timestamp: string;
}

export const createResponse = <T = any>(data?: T, message?: string, success: boolean = true): ApiResponse<T> => ({
	success,
	data,
	message,
	timestamp: new Date().toISOString(),
});

export const createErrorResponse = (error: string, statusCode: number = 500): ApiResponse => ({
	success: false,
	error,
	timestamp: new Date().toISOString(),
});