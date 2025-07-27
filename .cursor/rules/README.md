# Cursor Rules for Madar API

This directory contains Cursor rules that provide AI guidance for the NestJS project. Based on the [Cursor documentation](https://docs.cursor.com/context/rules), these rules use the modern MDC format with metadata and content.

## Rules Overview

### 1. **nestjs-architecture.mdc** - Always Applied
- Module structure patterns
- File organization guidelines
- Naming conventions
- Import organization

### 2. **api-patterns.mdc** - Always Applied
- Pagination standards
- Filtering patterns
- DTO validation
- CRUD operation templates

### 3. **database-patterns.mdc** - Always Applied
- Mongoose schema patterns
- Query optimization
- ObjectId validation
- Database best practices

### 4. **security-auth.mdc** - Always Applied
- Authentication patterns
- Security best practices
- Guard usage
- User context extraction

### 5. **error-handling.mdc** - Always Applied
- Exception handling patterns
- Error response standards
- Validation error handling
- Try-catch best practices

### 6. **crm-modules.mdc** - Auto Attached
- CRM-specific patterns
- Feature module structure
- Service and controller templates

## Rule Types

- **Always Applied**: Automatically included in model context
- **Auto Attached**: Applied when files matching glob patterns are referenced
- **Agent Requested**: Available to AI, which decides whether to include
- **Manual**: Only included when explicitly mentioned using @ruleName

## Usage

These rules will automatically guide Cursor's AI when:
- Writing new code
- Refactoring existing code
- Providing code suggestions
- Analyzing the codebase

## Migration from Legacy

The old `.cursorrules` file has been removed in favor of this modular approach, which provides:
- Better organization
- Scoped application
- Version control
- Easier maintenance

## Best Practices

- Keep rules focused and actionable
- Provide concrete examples
- Use proper glob patterns for scoping
- Update rules as patterns evolve 