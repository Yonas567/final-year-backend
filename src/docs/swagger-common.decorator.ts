import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from './swagger-models';

/** Standard error envelopes from `ApiExceptionFilter` + validation. */
export function ApiStandardErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Validation failed or bad request',
      type: ErrorResponseDto,
      content: {
        'application/json': {
          examples: {
            validation: {
              summary: 'Validation (class-validator)',
              value: {
                ok: false,
                error: 'deviceId must be a string, x must not be greater than 50',
              },
            },
            badRequest: {
              summary: 'Bad request message',
              value: { ok: false, error: 'Request failed' },
            },
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Unexpected server error',
      type: ErrorResponseDto,
      content: {
        'application/json': {
          examples: {
            internal: {
              summary: 'Internal error',
              value: { ok: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
            },
          },
        },
      },
    }),
  );
}
