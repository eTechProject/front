build:
	sudo docker compose build

up:
	sudo docker compose up -d --build

down:
	sudo docker compose down

restart: sudo docker compose down && sudo docker compose up -d --build

logs:
	sudo docker compose logs -f

bash:
	sudo docker compose exec front bash
