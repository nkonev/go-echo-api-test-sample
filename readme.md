```bash
env GOCACHE=off go test ./...
```

```bash
curl -v -X POST -H "Content-Type: application/json" -d '{"username": "root", "password": "password"}' http://127.0.0.1:1234/auth2/login
```

env can override value from config
```
GO_EXAMPLE_POSTGRESQL.CONNECTSTRING=host=172.24.0.2 user=postgres password=postgresqlPassword dbname=postgres connect_timeout=2 statement_timeout=2000 sslmode=disable
```

```bash
curl -v -X POST -H "Content-Type: application/json" -d '{"username": "nikit.cpp@yandex.ru", "password": "password"}' http://127.0.0.1:1234/auth2/register
```