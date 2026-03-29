.PHONY: setup dev build-backend dev-frontend clean docker

# --- 1-Click Docker ---
docker:
	docker compose up --build

# --- Local Development ---
setup: build-backend
	cd frontend && npm install

dev:
	@echo "Starting backend and frontend..."
	@$(MAKE) -j2 run-backend dev-frontend

run-backend:
	cd backend/build && ./server

dev-frontend:
	cd frontend && npm run dev

build-backend:
	cd backend && cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build

check:
	cd frontend && npm run check

lint:
	cd frontend && npm run lint

clean:
	rm -rf backend/build frontend/node_modules frontend/dist
