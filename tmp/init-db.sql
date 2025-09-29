SELECT 'CREATE DATABASE postgres_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'postgres_test')\gexec
