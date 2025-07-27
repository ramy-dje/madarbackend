# Tender Module - Submission Instructions Update

## Overview
The `submissionInstructions` field in the tender module has been updated to use key-value pairs instead of a simple string. This provides more structured and flexible submission instruction data.

## Changes Made

### 1. Schema Update (`tender.schema.ts`)
- Changed `submissionInstructions` from `string` to `Map<string, string>`
- This allows storing structured key-value pairs in MongoDB

### 2. DTO Update (`create-tender.dto.ts`)
- Changed `submissionInstructions` from `string` to `Record<string, string>`
- Updated validation from `@IsString()` to `@IsObject()`

### 3. Service Updates (`tenders.service.ts`)
- Added conversion logic to transform between DTO format and MongoDB Map format
- Added `convertMapToObject()` helper method to convert Map back to plain object
- Updated all CRUD operations to handle the new format

## Usage Examples

### Creating a Tender with Key-Value Submission Instructions

```typescript
const createTenderDto = {
  title: "Website Development Tender",
  location: "Remote",
  submissionInstructions: {
    "documentation": "Submit technical documentation in PDF format",
    "portfolio": "Include 3 recent project examples",
    "timeline": "Provide detailed project timeline",
    "budget": "Submit detailed cost breakdown",
    "team": "List team members and their roles"
  },
  submissionDeadline: new Date("2024-12-31"),
  projectOverview: {
    description: "Develop a modern e-commerce website",
    objectives: ["User-friendly interface", "Mobile responsive"],
    requirements: ["React.js", "Node.js", "MongoDB"],
    deliverables: ["Source code", "Documentation", "Deployment guide"]
  }
};
```

### API Response Format

The API will return the submissionInstructions as a plain object:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Website Development Tender",
  "location": "Remote",
  "submissionInstructions": {
    "documentation": "Submit technical documentation in PDF format",
    "portfolio": "Include 3 recent project examples",
    "timeline": "Provide detailed project timeline",
    "budget": "Submit detailed cost breakdown",
    "team": "List team members and their roles"
  },
  "submissionDeadline": "2024-12-31T00:00:00.000Z",
  "status": "DRAFT",
  "projectOverview": {
    "description": "Develop a modern e-commerce website",
    "objectives": ["User-friendly interface", "Mobile responsive"],
    "requirements": ["React.js", "Node.js", "MongoDB"],
    "deliverables": ["Source code", "Documentation", "Deployment guide"]
  }
}
```

### Updating Submission Instructions

```typescript
const updateTenderDto = {
  submissionInstructions: {
    "documentation": "Submit technical documentation in PDF format",
    "portfolio": "Include 5 recent project examples", // Updated
    "timeline": "Provide detailed project timeline",
    "budget": "Submit detailed cost breakdown",
    "team": "List team members and their roles",
    "references": "Provide 2 client references" // New field
  }
};
```

## Benefits

1. **Structured Data**: Submission instructions are now organized in a structured format
2. **Flexibility**: Easy to add, remove, or modify specific instruction categories
3. **Frontend Integration**: Key-value pairs are easier to display in forms and UI components
4. **Validation**: Better validation and type safety with structured data
5. **Extensibility**: Easy to add new instruction types without schema changes

## Migration Notes

- Existing tenders with string-based submissionInstructions will need to be migrated
- The API automatically converts between Map (database) and plain object (API response) formats
- No breaking changes to the API interface - the response format remains the same 