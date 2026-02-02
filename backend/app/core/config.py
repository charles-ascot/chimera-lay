from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "Tumorra Lay Strategy API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # API
    api_prefix: str = "/api"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://chimera-lay.pages.dev",
    ]
    
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tumorra"
    
    # Google Cloud
    gcp_project_id: str = "tumorra-betting-platform"
    gcp_dataset_id: str = "horse_racing_2024"
    gcp_credentials_path: Optional[str] = None
    
    # BigQuery
    bigquery_races_table: str = "races"
    bigquery_runners_table: str = "runners"
    bigquery_results_table: str = "results"
    
    # Security
    secret_key: str = "change-this-in-production-to-a-secure-random-key"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    
    # Strategy defaults
    default_bankroll: float = 100000.0
    default_base_stake_percent: float = 0.5
    default_max_liability_percent: float = 2.0
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
