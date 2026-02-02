"""
API Routes - FastAPI endpoints for the Tumorra platform.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import JSONResponse

from app.models.schemas import (
    Race,
    Runner,
    Bet,
    StrategyConfig,
    StrategyConfigCreate,
    StrategyConfigUpdate,
    StrategyRules,
    StakeManagement,
    BacktestRequest,
    BacktestResult,
    DashboardStats,
    StrategyPerformance,
    QualifyingRace,
    FilterParams,
    PaginatedResponse,
    ApiResponse,
    RaceType,
    GoingCondition,
    Country,
)
from app.services.strategy import StrategyService, run_backtest

router = APIRouter()


# ============== Dashboard ==============

@router.get("/dashboard/stats", response_model=ApiResponse)
async def get_dashboard_stats():
    """Get dashboard statistics."""
    # In production, this would query the database
    stats = DashboardStats(
        current_bankroll=126800.0,
        today_pl=540.0,
        week_pl=2850.0,
        month_pl=7900.0,
        total_pl=26800.0,
        active_bets=3,
        pending_races=12,
        win_rate=68.5,
        roi=5.2,
        streak={"type": "winning", "count": 4},
    )
    
    return ApiResponse(
        success=True,
        data=stats.model_dump(),
        timestamp=datetime.utcnow(),
    )


# ============== Races ==============

@router.get("/races", response_model=ApiResponse)
async def get_races(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    race_type: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    min_odds: Optional[float] = Query(None),
    max_odds: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get paginated list of races."""
    # Mock data - in production would query BigQuery
    races = generate_mock_races(10)
    
    return ApiResponse(
        success=True,
        data={
            "items": [r.model_dump() for r in races],
            "total": 100,
            "page": page,
            "page_size": page_size,
            "total_pages": 5,
        },
        timestamp=datetime.utcnow(),
    )


@router.get("/races/{race_id}", response_model=ApiResponse)
async def get_race(race_id: str):
    """Get a single race by ID."""
    races = generate_mock_races(1)
    races[0].id = race_id
    
    return ApiResponse(
        success=True,
        data=races[0].model_dump(),
        timestamp=datetime.utcnow(),
    )


@router.get("/races/qualifying/{strategy_id}", response_model=ApiResponse)
async def get_qualifying_races(
    strategy_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get races that qualify for a strategy."""
    qualifying = generate_mock_qualifying_races(5)
    
    return ApiResponse(
        success=True,
        data={
            "items": [r.model_dump() for r in qualifying],
            "total": 20,
            "page": page,
            "page_size": page_size,
            "total_pages": 1,
        },
        timestamp=datetime.utcnow(),
    )


# ============== Bets ==============

@router.get("/bets", response_model=ApiResponse)
async def get_bets(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get paginated list of bets."""
    # Mock data
    return ApiResponse(
        success=True,
        data={
            "items": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 0,
        },
        timestamp=datetime.utcnow(),
    )


@router.post("/bets", response_model=ApiResponse)
async def place_bet(bet_data: dict):
    """Place a new lay bet."""
    return ApiResponse(
        success=True,
        data={"id": "bet_new", "status": "pending"},
        timestamp=datetime.utcnow(),
    )


@router.delete("/bets/{bet_id}", response_model=ApiResponse)
async def cancel_bet(bet_id: str):
    """Cancel a pending bet."""
    return ApiResponse(
        success=True,
        data={"id": bet_id, "status": "cancelled"},
        timestamp=datetime.utcnow(),
    )


# ============== Strategies ==============

@router.get("/strategies", response_model=ApiResponse)
async def get_strategies():
    """Get all strategies."""
    default_strategy = StrategyConfig(
        id="default",
        name="Smart Favorite Lay",
        description="Lay favorites at BSP 2.0-4.5 with modified Kelly staking",
        rules=StrategyRules(),
        stake_management=StakeManagement(),
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    return ApiResponse(
        success=True,
        data=[default_strategy.model_dump()],
        timestamp=datetime.utcnow(),
    )


@router.get("/strategies/{strategy_id}", response_model=ApiResponse)
async def get_strategy(strategy_id: str):
    """Get a strategy by ID."""
    strategy = StrategyConfig(
        id=strategy_id,
        name="Smart Favorite Lay",
        description="Lay favorites at BSP 2.0-4.5 with modified Kelly staking",
        rules=StrategyRules(),
        stake_management=StakeManagement(),
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    return ApiResponse(
        success=True,
        data=strategy.model_dump(),
        timestamp=datetime.utcnow(),
    )


@router.post("/strategies", response_model=ApiResponse)
async def create_strategy(strategy: StrategyConfigCreate):
    """Create a new strategy."""
    new_strategy = StrategyConfig(
        id="new_strategy",
        **strategy.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    return ApiResponse(
        success=True,
        data=new_strategy.model_dump(),
        timestamp=datetime.utcnow(),
    )


@router.put("/strategies/{strategy_id}", response_model=ApiResponse)
async def update_strategy(strategy_id: str, strategy: StrategyConfigUpdate):
    """Update a strategy."""
    return ApiResponse(
        success=True,
        data={"id": strategy_id, "updated": True},
        timestamp=datetime.utcnow(),
    )


@router.delete("/strategies/{strategy_id}", response_model=ApiResponse)
async def delete_strategy(strategy_id: str):
    """Delete a strategy."""
    return ApiResponse(
        success=True,
        data={"id": strategy_id, "deleted": True},
        timestamp=datetime.utcnow(),
    )


# ============== Performance ==============

@router.get("/performance/{strategy_id}", response_model=ApiResponse)
async def get_strategy_performance(
    strategy_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Get performance metrics for a strategy."""
    performance = StrategyPerformance(
        strategy_id=strategy_id,
        total_bets=2580,
        won_bets=1670,
        lost_bets=910,
        win_rate=64.7,
        total_turnover=1250000.0,
        total_liability=1875000.0,
        total_profit_loss=26800.0,
        roi=2.14,
        max_drawdown=8.2,
        sharpe_ratio=1.85,
        daily_performance=[],
    )
    
    return ApiResponse(
        success=True,
        data=performance.model_dump(),
        timestamp=datetime.utcnow(),
    )


# ============== Backtest ==============

@router.post("/backtest", response_model=ApiResponse)
async def run_backtest_endpoint(request: BacktestRequest):
    """Run a strategy backtest."""
    # Generate mock data for backtest
    races = generate_mock_races(100)
    runners = generate_mock_runners_for_races(races)
    
    # Run backtest
    bets, performance = run_backtest(
        races=races,
        runners=runners,
        strategy_rules=request.strategy_config.rules,
        stake_management=request.strategy_config.stake_management,
        initial_bankroll=request.initial_bankroll,
    )
    
    result = BacktestResult(
        id="bt_" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        strategy_config=StrategyConfig(
            id="backtest",
            **request.strategy_config.model_dump(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        start_date=request.start_date,
        end_date=request.end_date,
        initial_bankroll=request.initial_bankroll,
        final_bankroll=request.initial_bankroll + performance.total_profit_loss,
        performance=performance,
        qualifying_races=len(bets),
        total_races_analyzed=len(races),
        bets=bets,
        created_at=datetime.utcnow(),
    )
    
    return ApiResponse(
        success=True,
        data=result.model_dump(),
        timestamp=datetime.utcnow(),
    )


@router.get("/backtest/results", response_model=ApiResponse)
async def get_backtest_results():
    """Get all backtest results."""
    return ApiResponse(
        success=True,
        data=[],
        timestamp=datetime.utcnow(),
    )


# ============== Data Import ==============

@router.post("/data/import", response_model=ApiResponse)
async def import_data(file: UploadFile = File(...)):
    """Import Betfair historical data."""
    # In production, this would process the file and load to BigQuery
    return ApiResponse(
        success=True,
        data={"imported": 45892, "errors": 0},
        timestamp=datetime.utcnow(),
    )


@router.get("/courses", response_model=ApiResponse)
async def get_courses():
    """Get list of all courses."""
    courses = [
        "Ascot", "Cheltenham", "Epsom", "Goodwood", "Kempton",
        "Leopardstown", "Newmarket", "Sandown", "York", "Aintree",
        "Chepstow", "Doncaster", "Haydock", "Lingfield", "Newbury",
        "Punchestown", "Curragh", "Fairyhouse", "Galway", "Naas",
    ]
    
    return ApiResponse(
        success=True,
        data=courses,
        timestamp=datetime.utcnow(),
    )


# ============== Mock Data Generators ==============

def generate_mock_races(count: int) -> List[Race]:
    """Generate mock race data."""
    import random
    
    courses_uk = ["Cheltenham", "Ascot", "Newmarket", "York", "Sandown", "Kempton", "Newbury"]
    courses_ire = ["Leopardstown", "Curragh", "Punchestown", "Fairyhouse", "Galway"]
    
    races = []
    for i in range(count):
        country = random.choice([Country.UK, Country.IRE])
        courses = courses_uk if country == Country.UK else courses_ire
        
        race = Race(
            id=f"race_{i+1}",
            event_id=f"evt_{i+1}",
            market_id=f"mkt_{i+1}",
            event_name=f"{random.choice(courses)} {14 + (i % 8)}:{(i * 15) % 60:02d}",
            course_name=random.choice(courses),
            race_time=f"{14 + (i % 8)}:{(i * 15) % 60:02d}",
            race_date="2024-12-16",
            race_type=random.choice(list(RaceType)),
            race_class=random.randint(1, 5),
            distance=f"{random.randint(1, 3)}m {random.randint(0, 7)}f",
            going=random.choice(list(GoingCondition)),
            number_of_runners=random.randint(6, 16),
            country=country,
            track_direction=random.choice(["left", "right", "straight"]),
            is_handicap=random.random() < 0.3,
        )
        races.append(race)
    
    return races


def generate_mock_runners_for_races(races: List[Race]) -> List[Runner]:
    """Generate mock runners for races."""
    import random
    
    horse_names = [
        "Desert Crown", "Kinross", "Baaeed", "Inspiral", "Energumene",
        "Constitution Hill", "Shishkin", "Allaho", "Honeysuckle", "Envoi Allen",
        "Appreciate It", "Bob Olinger", "Galopin Des Champs", "State Man", "Facile Vega",
    ]
    
    jockeys = [
        "P. Townend", "N. de Boinville", "O. Murphy", "W. Buick", "F. Dettori",
        "R. Moore", "J. Doyle", "T. Marquand", "D. Russell", "R. Walsh",
    ]
    
    trainers = [
        "W.P. Mullins", "N. Henderson", "P. Nicholls", "G. Elliott", "A. O'Brien",
        "J. Gosden", "C. Appleby", "W. Haggas", "R. Varian", "A. Balding",
    ]
    
    runners = []
    for race in races:
        num_runners = race.number_of_runners
        favorite_idx = 0
        
        for j in range(num_runners):
            odds = round(random.uniform(2.0, 15.0), 2) if j > 0 else round(random.uniform(2.0, 4.5), 2)
            
            runner = Runner(
                id=f"runner_{race.id}_{j+1}",
                race_id=race.id,
                selection_id=random.randint(100000, 999999),
                horse_name=random.choice(horse_names),
                jockey=random.choice(jockeys),
                trainer=random.choice(trainers),
                age=random.randint(4, 10),
                weight=f"11-{random.randint(0, 12)}",
                draw=random.randint(1, num_runners) if race.race_type == RaceType.FLAT else None,
                bsp_odds=odds,
                position=None,
                is_favorite=(j == favorite_idx),
                sp=f"{int(odds-1)}/1" if odds > 2 else "Evs",
            )
            runners.append(runner)
    
    return runners


def generate_mock_qualifying_races(count: int) -> List[QualifyingRace]:
    """Generate mock qualifying race data."""
    races = generate_mock_races(count)
    runners = generate_mock_runners_for_races(races)
    
    qualifying = []
    for race in races:
        race_runners = [r for r in runners if r.race_id == race.id]
        favorite = next((r for r in race_runners if r.is_favorite), race_runners[0])
        
        qr = QualifyingRace(
            **race.model_dump(),
            favorite=favorite,
            qualification_score=round(70 + 30 * (1 - (favorite.bsp_odds - 2.0) / 2.5), 1),
            adjusted_stake_multiplier=1.0,
            suggested_stake=634.0,
            suggested_liability=round(634.0 * (favorite.bsp_odds - 1), 2),
            reasons=["All criteria met", "Standard conditions"],
        )
        qualifying.append(qr)
    
    return qualifying
