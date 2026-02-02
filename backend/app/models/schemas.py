from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID


class RaceType(str, Enum):
    FLAT = "flat"
    HURDLE = "hurdle"
    CHASE = "chase"
    NATIONAL_HUNT_FLAT = "national_hunt_flat"
    HUNTERS_CHASE = "hunters_chase"


class GoingCondition(str, Enum):
    FIRM = "firm"
    GOOD_TO_FIRM = "good_to_firm"
    GOOD = "good"
    GOOD_TO_SOFT = "good_to_soft"
    SOFT = "soft"
    HEAVY = "heavy"
    STANDARD = "standard"
    SLOW = "slow"


class Country(str, Enum):
    UK = "UK"
    IRE = "IRE"


class BetStatus(str, Enum):
    PENDING = "pending"
    MATCHED = "matched"
    SETTLED = "settled"
    CANCELLED = "cancelled"
    VOIDED = "voided"


class BetResult(str, Enum):
    WON = "won"
    LOST = "lost"
    VOID = "void"


# Base Models
class RaceBase(BaseModel):
    event_id: str
    market_id: str
    event_name: str
    course_name: str
    race_time: str
    race_date: str
    race_type: RaceType
    race_class: int
    distance: str
    going: GoingCondition
    number_of_runners: int
    country: Country
    track_direction: str
    is_handicap: bool


class Race(RaceBase):
    id: str
    
    class Config:
        from_attributes = True


class RunnerBase(BaseModel):
    race_id: str
    selection_id: int
    horse_name: str
    jockey: str
    trainer: str
    age: int
    weight: str
    draw: Optional[int] = None
    bsp_odds: Optional[float] = None
    position: Optional[int] = None
    is_favorite: bool
    sp: str


class Runner(RunnerBase):
    id: str
    
    class Config:
        from_attributes = True


class StrategyRules(BaseModel):
    min_odds: float = Field(default=2.0, ge=1.01)
    max_odds: float = Field(default=4.5, le=20.0)
    min_runners: int = Field(default=6, ge=2)
    max_runners: int = Field(default=20, le=40)
    allowed_race_types: List[RaceType] = Field(default_factory=lambda: [
        RaceType.FLAT, RaceType.HURDLE, RaceType.CHASE, RaceType.NATIONAL_HUNT_FLAT
    ])
    exclude_handicaps: bool = False
    handicap_stake_multiplier: float = Field(default=0.7, ge=0.0, le=2.0)
    going_adjustments: dict[GoingCondition, float] = Field(default_factory=lambda: {
        GoingCondition.FIRM: 0.8,
        GoingCondition.GOOD_TO_FIRM: 0.9,
        GoingCondition.GOOD: 1.0,
        GoingCondition.GOOD_TO_SOFT: 1.0,
        GoingCondition.SOFT: 1.2,
        GoingCondition.HEAVY: 1.2,
        GoingCondition.STANDARD: 1.0,
        GoingCondition.SLOW: 1.0,
    })
    track_adjustments: dict[str, float] = Field(default_factory=lambda: {
        "figure8": 1.15,
    })
    monthly_adjustments: dict[int, float] = Field(default_factory=lambda: {
        1: 0.9, 2: 0.9, 3: 0.9, 12: 0.85
    })
    exclude_amateur_races: bool = True
    exclude_apprentice_races: bool = True


class StakeManagement(BaseModel):
    base_stake_percent: float = Field(default=0.5, ge=0.01, le=10.0)
    max_liability_percent: float = Field(default=2.0, ge=0.1, le=20.0)
    daily_loss_limit_percent: float = Field(default=5.0, ge=0.5, le=50.0)
    weekly_loss_limit_percent: float = Field(default=10.0, ge=1.0, le=100.0)
    use_kelly_criterion: bool = True
    kelly_fraction: float = Field(default=0.25, ge=0.01, le=1.0)


class StrategyConfigBase(BaseModel):
    name: str
    description: str
    rules: StrategyRules
    stake_management: StakeManagement
    is_active: bool = True


class StrategyConfig(StrategyConfigBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StrategyConfigCreate(StrategyConfigBase):
    pass


class StrategyConfigUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[StrategyRules] = None
    stake_management: Optional[StakeManagement] = None
    is_active: Optional[bool] = None


class BetBase(BaseModel):
    race_id: str
    runner_id: str
    strategy_id: str
    bet_type: str = "lay"
    odds: float
    stake: float
    liability: float


class Bet(BetBase):
    id: str
    status: BetStatus
    result: Optional[BetResult] = None
    profit_loss: Optional[float] = None
    placed_at: datetime
    settled_at: Optional[datetime] = None
    race: Optional[Race] = None
    runner: Optional[Runner] = None
    
    class Config:
        from_attributes = True


class BetCreate(BetBase):
    pass


class DailyPerformance(BaseModel):
    date: str
    total_bets: int
    won_bets: int
    lost_bets: int
    turnover: float
    liability: float
    profit_loss: float
    roi: float
    starting_bank: float
    ending_bank: float


class StrategyPerformance(BaseModel):
    strategy_id: str
    total_bets: int
    won_bets: int
    lost_bets: int
    win_rate: float
    total_turnover: float
    total_liability: float
    total_profit_loss: float
    roi: float
    max_drawdown: float
    sharpe_ratio: float
    daily_performance: List[DailyPerformance]


class BacktestRequest(BaseModel):
    strategy_config: StrategyConfigCreate
    start_date: str
    end_date: str
    initial_bankroll: float = Field(default=100000.0, ge=100.0)


class BacktestResult(BaseModel):
    id: str
    strategy_config: StrategyConfig
    start_date: str
    end_date: str
    initial_bankroll: float
    final_bankroll: float
    performance: StrategyPerformance
    qualifying_races: int
    total_races_analyzed: int
    bets: List[Bet]
    created_at: datetime


class QualifyingRace(Race):
    favorite: Runner
    qualification_score: float
    adjusted_stake_multiplier: float
    suggested_stake: float
    suggested_liability: float
    reasons: List[str]


class DashboardStats(BaseModel):
    current_bankroll: float
    today_pl: float
    week_pl: float
    month_pl: float
    total_pl: float
    active_bets: int
    pending_races: int
    win_rate: float
    roi: float
    streak: dict


class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    country: Optional[str] = None
    race_type: Optional[str] = None
    course: Optional[str] = None
    min_odds: Optional[float] = None
    max_odds: Optional[float] = None
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int


class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
