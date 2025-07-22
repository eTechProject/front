build:
	sudo docker compose build

up:
	sudo docker compose up -d

down:
	sudo docker compose down

restart:
	make down
	make up

logs:
	sudo docker compose logs -f

bash:
	sudo docker compose exec front bash
