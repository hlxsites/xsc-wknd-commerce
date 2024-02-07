#!/bin/bash


# Remove existing dropins folder
rm -rf scripts/__dropins__

# Create scripts/__dropins__ directory if not exists
mkdir -p scripts/__dropins__

# Copy specified files from node_modules/@dropins to scripts/__dropins__/dropins
cp -R node_modules/@dropins/* scripts/__dropins__/

# Remove package.json files inside dropins
find scripts/__dropins__ -type f -name "package.json" -exec rm {} \;

echo "🫡 Vendors installed successfully!"