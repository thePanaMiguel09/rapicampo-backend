
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
    timestamp?: string;
    path?: string;
}


export const successResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
});


export const errorResponse = (
    error: string,
    errors?: Record<string, string[]>,
    path?: string
): ApiResponse => ({
    success: false,
    error,
    errors,
    timestamp: new Date().toISOString(),
    path,
});