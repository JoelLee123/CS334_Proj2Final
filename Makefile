# Makefile for React Project

# Variables
INSTALL = npm install
START = npm start
BUILD = npm run build
TEST = npm test
CHECK_DEPENDENCIES = npm ls --depth=0

# Default target
all: install start

# Target to install dependencies
install:
	@echo "Checking for dependencies..."
	@if ! $(CHECK_DEPENDENCIES) >/dev/null 2>&1; then \
		echo "Installing dependencies..."; \
		$(INSTALL); \
	else \
		echo "All dependencies are already installed."; \
	fi

# Target to run the project
start:
	@echo "Starting the React application..."
	$(START)

# Target to build the project
build:
	@echo "Building the React application..."
	$(BUILD)

# Target to run tests
test:
	@echo "Running tests..."
	$(TEST)

# Target to clean node_modules (optional)
clean:
	@echo "Removing node_modules..."
	rm -rf node_modules

# Help target to display available commands
help:
	@echo "Available commands:"
	@echo "  make install   - Install project dependencies"
	@echo "  make start     - Start the React application"
	@echo "  make build     - Build the React application"
	@echo "  make test      - Run tests"
	@echo "  make clean     - Remove node_modules"
	@echo "  make           - Install dependencies and start the application"
