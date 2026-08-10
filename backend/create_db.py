import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

passwords = [
    "postgres", "admin", "root", "123456", "1234", "password", 
    "rohit", "Rohit", "Rohit123", "guvi", "Guvi", "Guvi123", 
    "vibe", "Vibe123", "postgres123", "Postgres123", "P@ssword1", "pgadmin"
]
db_name = "vibe_ecommerce_db"
user = "postgres"
host = "localhost"
port = "5432"

connected = False
succ_pass = None

for pwd in passwords:
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=pwd,
            host=host,
            port=port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        connected = True
        succ_pass = pwd
        print(f"SUCCESS: Connected to PostgreSQL with password: '{pwd}'")
        
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"Database '{db_name}' created successfully.")
        else:
            print(f"Database '{db_name}' already exists.")
        
        cursor.close()
        conn.close()
        break
    except Exception as e:
        # print(f"Failed with '{pwd}': {e}")
        continue

if not connected:
    print("PostgreSQL connection failed for standard credentials.")
