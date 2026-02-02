"""
BigQuery Service - Data warehouse integration

Handles all BigQuery operations for loading and querying historical racing data.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging

from google.cloud import bigquery
from google.cloud.exceptions import NotFound

from app.core.config import settings
from app.models.schemas import Race, Runner, RaceType, GoingCondition, Country


logger = logging.getLogger(__name__)


class BigQueryService:
    """Service for BigQuery data operations."""
    
    def __init__(self):
        self.client = bigquery.Client(project=settings.gcp_project_id)
        self.dataset_id = f"{settings.gcp_project_id}.{settings.gcp_dataset_id}"
    
    def _get_table_id(self, table_name: str) -> str:
        return f"{self.dataset_id}.{table_name}"
    
    async def get_races(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        country: Optional[str] = None,
        race_type: Optional[str] = None,
        course: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Race]:
        """Fetch races from BigQuery with optional filters."""
        
        table_id = self._get_table_id(settings.bigquery_races_table)
        
        where_clauses = []
        params = []
        
        if start_date:
            where_clauses.append("race_date >= @start_date")
            params.append(bigquery.ScalarQueryParameter("start_date", "STRING", start_date))
        
        if end_date:
            where_clauses.append("race_date <= @end_date")
            params.append(bigquery.ScalarQueryParameter("end_date", "STRING", end_date))
        
        if country and country != "all":
            where_clauses.append("country = @country")
            params.append(bigquery.ScalarQueryParameter("country", "STRING", country))
        
        if race_type and race_type != "all":
            where_clauses.append("race_type = @race_type")
            params.append(bigquery.ScalarQueryParameter("race_type", "STRING", race_type))
        
        if course:
            where_clauses.append("course_name = @course")
            params.append(bigquery.ScalarQueryParameter("course", "STRING", course))
        
        where_clause = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        query = f"""
            SELECT *
            FROM `{table_id}`
            {where_clause}
            ORDER BY race_date DESC, race_time DESC
            LIMIT {limit}
            OFFSET {offset}
        """
        
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        
        try:
            query_job = self.client.query(query, job_config=job_config)
            results = query_job.result()
            
            races = []
            for row in results:
                race = Race(
                    id=row.id,
                    event_id=row.event_id,
                    market_id=row.market_id,
                    event_name=row.event_name,
                    course_name=row.course_name,
                    race_time=row.race_time,
                    race_date=row.race_date,
                    race_type=RaceType(row.race_type),
                    race_class=row.race_class,
                    distance=row.distance,
                    going=GoingCondition(row.going),
                    number_of_runners=row.number_of_runners,
                    country=Country(row.country),
                    track_direction=row.track_direction,
                    is_handicap=row.is_handicap,
                )
                races.append(race)
            
            return races
            
        except Exception as e:
            logger.error(f"Error querying races: {e}")
            raise
    
    async def get_runners_for_races(self, race_ids: List[str]) -> List[Runner]:
        """Fetch runners for given race IDs."""
        
        if not race_ids:
            return []
        
        table_id = self._get_table_id(settings.bigquery_runners_table)
        
        # Build IN clause
        race_ids_str = ", ".join([f"'{rid}'" for rid in race_ids])
        
        query = f"""
            SELECT *
            FROM `{table_id}`
            WHERE race_id IN ({race_ids_str})
            ORDER BY race_id, is_favorite DESC, bsp_odds ASC
        """
        
        try:
            query_job = self.client.query(query)
            results = query_job.result()
            
            runners = []
            for row in results:
                runner = Runner(
                    id=row.id,
                    race_id=row.race_id,
                    selection_id=row.selection_id,
                    horse_name=row.horse_name,
                    jockey=row.jockey,
                    trainer=row.trainer,
                    age=row.age,
                    weight=row.weight,
                    draw=row.draw,
                    bsp_odds=row.bsp_odds,
                    position=row.position,
                    is_favorite=row.is_favorite,
                    sp=row.sp,
                )
                runners.append(runner)
            
            return runners
            
        except Exception as e:
            logger.error(f"Error querying runners: {e}")
            raise
    
    async def get_courses(self) -> List[str]:
        """Get list of all unique courses."""
        
        table_id = self._get_table_id(settings.bigquery_races_table)
        
        query = f"""
            SELECT DISTINCT course_name
            FROM `{table_id}`
            ORDER BY course_name
        """
        
        try:
            query_job = self.client.query(query)
            results = query_job.result()
            return [row.course_name for row in results]
            
        except Exception as e:
            logger.error(f"Error querying courses: {e}")
            raise
    
    async def count_races(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        country: Optional[str] = None,
        race_type: Optional[str] = None,
    ) -> int:
        """Count races matching filters."""
        
        table_id = self._get_table_id(settings.bigquery_races_table)
        
        where_clauses = []
        params = []
        
        if start_date:
            where_clauses.append("race_date >= @start_date")
            params.append(bigquery.ScalarQueryParameter("start_date", "STRING", start_date))
        
        if end_date:
            where_clauses.append("race_date <= @end_date")
            params.append(bigquery.ScalarQueryParameter("end_date", "STRING", end_date))
        
        if country and country != "all":
            where_clauses.append("country = @country")
            params.append(bigquery.ScalarQueryParameter("country", "STRING", country))
        
        if race_type and race_type != "all":
            where_clauses.append("race_type = @race_type")
            params.append(bigquery.ScalarQueryParameter("race_type", "STRING", race_type))
        
        where_clause = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        query = f"""
            SELECT COUNT(*) as count
            FROM `{table_id}`
            {where_clause}
        """
        
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        
        try:
            query_job = self.client.query(query, job_config=job_config)
            results = list(query_job.result())
            return results[0].count if results else 0
            
        except Exception as e:
            logger.error(f"Error counting races: {e}")
            raise
    
    async def load_betfair_data(
        self,
        data: List[Dict[str, Any]],
        table_name: str
    ) -> int:
        """Load data into BigQuery table."""
        
        table_id = self._get_table_id(table_name)
        
        try:
            errors = self.client.insert_rows_json(table_id, data)
            
            if errors:
                logger.error(f"Errors loading data: {errors}")
                raise Exception(f"Failed to insert rows: {errors}")
            
            return len(data)
            
        except NotFound:
            logger.error(f"Table {table_id} not found")
            raise
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise


# Singleton instance
bigquery_service = BigQueryService()
