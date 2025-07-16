import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response DTO
 * 
 * This DTO demonstrates:
 * 1. How to use Swagger decorators for documentation
 * 2. Generic response structure
 * 3. TypeScript generic types
 * 
 * @ApiProperty() decorator documents properties in Swagger UI
 */
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Error details (present when success is false)',
    required: false,
  })
  error?: {
    code: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;
}

/**
 * Error Response DTO
 * Used for documenting error responses
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Always false for error responses',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message',
    example: 'Resource not found',
  })
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: {
      code: 'NOT_FOUND',
      details: 'User with ID 123 not found',
    },
  })
  error: {
    code: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Error timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;
}
