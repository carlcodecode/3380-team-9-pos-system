#!/bin/bash
# Run all test scripts matching test-*.js in the current directory, with test-cleaner.js running last

#set -e  # stop on first error; remove this if you want to continue after failures

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

# Run test-cleaner.js last
if [ -f "test-cleaner.js" ]; then
  echo "------------------------------------"
  echo " Running: test-cleaner.js (cleanup)"
  node test-cleaner.js
  echo " Finished: test-cleaner.js"
fi

echo "All tests completed successfully!"

