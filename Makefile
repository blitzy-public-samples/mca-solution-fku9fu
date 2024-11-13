# REQ-4.1 High-Level Architecture: Build automation for all microservices
# Required tool versions:
# - docker v24.x
# - docker-compose v2.x
# - kubectl v1.27.x
# - helm v3.x
# - terraform v1.5.x

# Global variables
DOCKER_REGISTRY ?= your-aws-ecr-url
VERSION ?= 1.0.0
ENV ?= dev

# Service directories
CORE_SERVICE_DIR = src/backend/core-service
DOC_SERVICE_DIR = src/backend/document-service
EMAIL_SERVICE_DIR = src/backend/email-service
NOTIFY_SERVICE_DIR = src/backend/notification-service
WEB_DIR = src/web

# REQ-4.1 High-Level Architecture: Service-specific build targets
.PHONY: install build test dev deploy clean

# REQ-4.1 High-Level Architecture: Install dependencies for all services
install:
	@echo "Installing dependencies for all services..."
	cd $(CORE_SERVICE_DIR) && ./gradlew dependencies
	cd $(DOC_SERVICE_DIR) && pip install -r requirements.txt
	cd $(EMAIL_SERVICE_DIR) && npm install
	cd $(NOTIFY_SERVICE_DIR) && npm install
	cd $(WEB_DIR) && npm install

# REQ-4.1 High-Level Architecture: Build all service containers
build:
	@echo "Building service containers with version $(VERSION)..."
	docker build -t $(DOCKER_REGISTRY)/core-service:$(VERSION) $(CORE_SERVICE_DIR)
	docker build -t $(DOCKER_REGISTRY)/document-service:$(VERSION) $(DOC_SERVICE_DIR)
	docker build -t $(DOCKER_REGISTRY)/email-service:$(VERSION) $(EMAIL_SERVICE_DIR)
	docker build -t $(DOCKER_REGISTRY)/notification-service:$(VERSION) $(NOTIFY_SERVICE_DIR)
	docker build -t $(DOCKER_REGISTRY)/web:$(VERSION) $(WEB_DIR)

# REQ-4.1 High-Level Architecture: Run all service tests
test:
	@echo "Running tests in test environment..."
	docker-compose -f docker-compose.test.yml up -d
	cd $(CORE_SERVICE_DIR) && ./gradlew test
	cd $(DOC_SERVICE_DIR) && python -m pytest
	cd $(EMAIL_SERVICE_DIR) && npm test
	cd $(NOTIFY_SERVICE_DIR) && npm test
	cd $(WEB_DIR) && npm test
	docker-compose -f docker-compose.test.yml down -v

# REQ-4.1 High-Level Architecture: Start development environment
dev:
	@echo "Starting development environment..."
	export ENV=dev
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Initializing development databases and services..."
	./scripts/init-dev-db.sh
	./scripts/init-minio.sh
	./scripts/init-rabbitmq.sh

# REQ-4.1 High-Level Architecture: Deploy services to target environment
deploy:
	@echo "Deploying to $(ENV) environment..."
	# Push images to registry
	docker push $(DOCKER_REGISTRY)/core-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/document-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/email-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/notification-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/web:$(VERSION)
	
	# Update Helm values
	helm upgrade --install -f helm/values-$(ENV).yaml mca-system helm/mca-system
	
	# Verify deployment
	kubectl wait --for=condition=available deployment -l app=mca-system --timeout=300s
	./scripts/smoke-tests.sh

# REQ-4.1 High-Level Architecture: Clean up resources
clean:
	@echo "Cleaning up resources..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.test.yml down -v
	cd $(CORE_SERVICE_DIR) && ./gradlew clean
	cd $(DOC_SERVICE_DIR) && find . -type d -name "__pycache__" -exec rm -r {} +
	cd $(EMAIL_SERVICE_DIR) && rm -rf node_modules
	cd $(NOTIFY_SERVICE_DIR) && rm -rf node_modules
	cd $(WEB_DIR) && rm -rf node_modules build
	rm -rf logs/*.log tmp/*

# Helper targets for individual services
.PHONY: core-service document-service email-service notification-service web

core-service:
	cd $(CORE_SERVICE_DIR) && ./gradlew build

document-service:
	cd $(DOC_SERVICE_DIR) && docker build -t $(DOCKER_REGISTRY)/document-service:$(VERSION) .

email-service:
	cd $(EMAIL_SERVICE_DIR) && docker build -t $(DOCKER_REGISTRY)/email-service:$(VERSION) .

notification-service:
	cd $(NOTIFY_SERVICE_DIR) && docker build -t $(DOCKER_REGISTRY)/notification-service:$(VERSION) .

web:
	cd $(WEB_DIR) && docker build -t $(DOCKER_REGISTRY)/web:$(VERSION) .

# Development helper targets
.PHONY: logs restart status

logs:
	docker-compose -f docker-compose.$(ENV).yml logs -f

restart:
	docker-compose -f docker-compose.$(ENV).yml restart

status:
	docker-compose -f docker-compose.$(ENV).yml ps

# Infrastructure management targets
.PHONY: infra-plan infra-apply infra-destroy

infra-plan:
	cd terraform && terraform plan -var-file=$(ENV).tfvars

infra-apply:
	cd terraform && terraform apply -var-file=$(ENV).tfvars -auto-approve

infra-destroy:
	cd terraform && terraform destroy -var-file=$(ENV).tfvars -auto-approve

# Database management targets
.PHONY: db-migrate db-rollback db-seed

db-migrate:
	cd $(CORE_SERVICE_DIR) && ./gradlew flywayMigrate

db-rollback:
	cd $(CORE_SERVICE_DIR) && ./gradlew flywayClean

db-seed:
	cd $(CORE_SERVICE_DIR) && ./gradlew seedData

# Default target
.DEFAULT_GOAL := help

# Help target
help:
	@echo "MCA Application Processing System - Make Targets"
	@echo "----------------------------------------"
	@echo "install         - Install all dependencies"
	@echo "build          - Build all service containers"
	@echo "test           - Run all tests"
	@echo "dev            - Start development environment"
	@echo "deploy         - Deploy to target environment"
	@echo "clean          - Clean up resources"
	@echo "logs           - View service logs"
	@echo "restart        - Restart services"
	@echo "status         - Check service status"
	@echo "infra-plan     - Plan infrastructure changes"
	@echo "infra-apply    - Apply infrastructure changes"
	@echo "infra-destroy  - Destroy infrastructure"
	@echo "db-migrate     - Run database migrations"
	@echo "db-rollback    - Rollback database migrations"
	@echo "db-seed        - Seed database with test data"