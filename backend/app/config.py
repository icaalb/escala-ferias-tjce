from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://ferias:ferias@db:5432/ferias"
    jwt_secret: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 480
    admin_username: str = "admin"
    admin_password: str = "CHANGE_ME_NOW"
    cors_origins: str = "http://localhost,http://127.0.0.1"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
