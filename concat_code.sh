#!/bin/bash

# Script to concatenate all code files (excluding tests) into a single file
# Usage: ./concat_code.sh [output_file]

# Set default output file if not provided
OUTPUT_FILE="${1:-concatenated_code.txt}"

# Remove output file if it exists
rm -f "$OUTPUT_FILE"

echo "Concatenating code files (excluding tests) into: $OUTPUT_FILE"
echo "========================================================"

# Function to add file content with header
add_file_content() {
    local file_path="$1"
    local relative_path="${file_path#./}"
    
    echo "" >> "$OUTPUT_FILE"
    echo "=================================================================================" >> "$OUTPUT_FILE"
    echo "File: $relative_path" >> "$OUTPUT_FILE"
    echo "=================================================================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    cat "$file_path" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Add header to output file
echo "FP-Way Core - Concatenated Source Code" > "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "=================================================================================" >> "$OUTPUT_FILE"

# Find and process TypeScript/JavaScript source files, excluding:
# - node_modules directory
# - test files (*.test.ts, *.test.js, *.spec.ts, *.spec.js)
# - build/dist directories
# - hidden files/directories
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" \) \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./lib/*" \
    ! -path "./.vscode/*" \
    ! -path "./dist/*" \
    ! -path "./build/*" \
    ! -path "./coverage/*" \
    ! -name "*.test.*" \
    ! -name "*.spec.*" \
    ! -name "*.d.ts" \
    ! -name "jest.config.js" \
    ! -name "*.config.js" \
    ! -name "*.config.ts" \
    | sort | while read -r file; do
    
    echo "Adding: $file"
    add_file_content "$file"
done

# Also include important configuration files
echo "Adding configuration files..."

# Add package.json if it exists
if [ -f "./package.json" ]; then
    echo "Adding: ./package.json"
    add_file_content "./package.json"
fi

# Add tsconfig.json if it exists
if [ -f "./tsconfig.json" ]; then
    echo "Adding: ./tsconfig.json"
    add_file_content "./tsconfig.json"
fi

# Add README.md if it exists
if [ -f "./README.md" ]; then
    echo "Adding: ./README.md"
    add_file_content "./README.md"
fi

echo ""
echo "Concatenation complete!"
echo "Output file: $OUTPUT_FILE"
echo "Total lines: $(wc -l < "$OUTPUT_FILE")"
echo ""
