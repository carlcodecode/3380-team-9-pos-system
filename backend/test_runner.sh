#!/bin/bash
# Run all test scripts matching test-*.js in the current directory, with test-cleaner.js running last

set -e  # stop on first error

# Ensure test-cleaner.js runs on exit, even if a test fails
trap 'if [ -f "test-cleaner.js" ]; then echo "------------------------------------"; echo " Running: test-cleaner.js (cleanup)"; node test-cleaner.js; echo " Finished: test-cleaner.js"; fi' EXIT

echo "Running all test scripts..."

# Run all test files except test-cleaner.js first
for file in test-*.js; do
  if [ -f "$file" ] && [ "$file" != "test-cleaner.js" ]; then
    echo "------------------------------------"
    echo " Running: $file"
    node "$file"
    echo " Finished: $file"
  fi
done

echo "All tests completed successfully!"

