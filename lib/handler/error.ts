import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { RequestError, ValidationError } from "../http-errors";
import logger from "../logger";

export type ResponseType = "api" | "server";

type ErrorContent = {
  success: false;
  error: {
    message: string;
    details?: Record<string, string[]>;
  };
};

type ServerErrorResponse = ErrorContent & { status: number };

function formatResponse(
  responseType: "api",
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
): NextResponse<ErrorContent>;
function formatResponse(
  responseType: "server",
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
): ServerErrorResponse;
function formatResponse(
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
): NextResponse<ErrorContent> | ServerErrorResponse;
function formatResponse(
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) {
  const responseContent: ErrorContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
}

function handleError(
  error: unknown,
  responseType: "api"
): NextResponse<ErrorContent>;
function handleError(
  error: unknown,
  responseType?: "server"
): ServerErrorResponse;
function handleError(error: unknown, responseType: ResponseType = "server") {
  if (error instanceof RequestError) {
    logger.error(
      { err: error, statusCode: error.statusCode },
      `${responseType.toUpperCase()} Error: ${error.message}`
    );

    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors
    );
  }
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>
    );

    logger.error(
      { err: error, statusCode: validationError.statusCode },
      `Validation Error: ${validationError.message}`
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors
    );
  }

  if (error instanceof Error) {
    logger.error({ err: error, statusCode: 500 }, error.message);
    return formatResponse(responseType, 500, "Internal server error");
  }

  logger.error({ err: error, statusCode: 500 }, "An unexpected error occurred");
  return formatResponse(responseType, 500, "An unexpected error occurred");
}

export default handleError;
