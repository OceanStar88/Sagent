from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

UUID_TYPE_BY_DIALECT = {
    "postgresql": "UUID",
    "sqlite": "CHAR(32)",
}


def ensure_user_owned_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    table_columns = {
        table_name: {column["name"] for column in inspector.get_columns(table_name)}
        for table_name in ("agent_configs", "contacts", "calls", "users")
        if inspector.has_table(table_name)
    }

    uuid_sql = UUID_TYPE_BY_DIALECT.get(engine.dialect.name, "UUID")

    with engine.begin() as connection:
        for table_name in ("agent_configs", "contacts", "calls"):
            columns = table_columns.get(table_name, set())
            if not columns or "user_id" in columns:
                continue
            connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN user_id {uuid_sql}"))

        if inspector.has_table("agent_configs"):
            connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_agent_configs_user_id ON agent_configs (user_id)"))

        backfill_user_owned_tables(connection)


def backfill_user_owned_tables(connection) -> None:

    connection.execute(
        text(
            """
            UPDATE agent_configs
            SET user_id = (SELECT users.id FROM users ORDER BY users.created_at ASC LIMIT 1)
            WHERE user_id IS NULL
            """
        )
    )
    connection.execute(
        text(
            """
            UPDATE contacts
            SET user_id = (SELECT users.id FROM users ORDER BY users.created_at ASC LIMIT 1)
            WHERE user_id IS NULL
            """
        )
    )
    connection.execute(
        text(
            """
            UPDATE calls
            SET user_id = (SELECT users.id FROM users ORDER BY users.created_at ASC LIMIT 1)
            WHERE user_id IS NULL
            """
        )
    )