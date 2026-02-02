"""
Strategy Service - Core lay betting strategy logic

This module contains the implementation of the "Smart Favorite Lay" strategy
for UK & Ireland horse racing.
"""

from datetime import datetime
from typing import List, Tuple, Optional
import random

from app.models.schemas import (
    Race,
    Runner,
    StrategyRules,
    StakeManagement,
    QualifyingRace,
    Bet,
    BetStatus,
    BetResult,
    DailyPerformance,
    StrategyPerformance,
)


class StrategyService:
    """Service class implementing the lay betting strategy logic."""
    
    def __init__(self, rules: StrategyRules, stake_management: StakeManagement):
        self.rules = rules
        self.stake_management = stake_management
    
    def check_race_qualification(
        self,
        race: Race,
        favorite: Runner
    ) -> Tuple[bool, List[str], float]:
        """
        Check if a race qualifies for the strategy.
        
        Returns:
            Tuple of (qualifies, reasons, score)
        """
        reasons = []
        score = 100.0
        
        # Check odds range
        if favorite.bsp_odds is None:
            reasons.append("No BSP odds available")
            return False, reasons, 0
        
        if favorite.bsp_odds < self.rules.min_odds:
            reasons.append(
                f"Odds {favorite.bsp_odds:.2f} below minimum {self.rules.min_odds}"
            )
            score -= 30
        
        if favorite.bsp_odds > self.rules.max_odds:
            reasons.append(
                f"Odds {favorite.bsp_odds:.2f} above maximum {self.rules.max_odds}"
            )
            score -= 30
        
        # Check runner count
        if race.number_of_runners < self.rules.min_runners:
            reasons.append(
                f"Only {race.number_of_runners} runners (minimum: {self.rules.min_runners})"
            )
            score -= 25
        
        if race.number_of_runners > self.rules.max_runners:
            reasons.append(
                f"{race.number_of_runners} runners exceeds maximum of {self.rules.max_runners}"
            )
            score -= 15
        
        # Check race type
        if race.race_type not in self.rules.allowed_race_types:
            reasons.append(f"Race type {race.race_type.value} not allowed")
            score -= 40
        
        # Check handicap
        if race.is_handicap and self.rules.exclude_handicaps:
            reasons.append("Handicap races excluded")
            score -= 35
        
        qualifies = len(reasons) == 0
        
        if qualifies:
            reasons.append("All criteria met")
            
            # Add positive notes
            if race.going in ["soft", "heavy"]:
                reasons.append(f"{race.going.value.replace('_', ' ').title()} going (+20% stake)")
            
            if race.track_direction == "figure8":
                reasons.append("Figure-8 track (+15% stake)")
        
        return qualifies, reasons, max(0, score)
    
    def calculate_stake_multiplier(self, race: Race) -> float:
        """Calculate the stake multiplier based on race conditions."""
        multiplier = 1.0
        
        # Going adjustment
        going_adj = self.rules.going_adjustments.get(race.going, 1.0)
        multiplier *= going_adj
        
        # Track adjustment
        if race.track_direction in self.rules.track_adjustments:
            track_adj = self.rules.track_adjustments[race.track_direction]
            multiplier *= track_adj
        
        # Monthly adjustment
        race_month = datetime.strptime(race.race_date, "%Y-%m-%d").month
        if race_month in self.rules.monthly_adjustments:
            month_adj = self.rules.monthly_adjustments[race_month]
            multiplier *= month_adj
        
        # Handicap adjustment
        if race.is_handicap and not self.rules.exclude_handicaps:
            multiplier *= self.rules.handicap_stake_multiplier
        
        return multiplier
    
    def calculate_stake(
        self,
        bankroll: float,
        odds: float,
        multiplier: float = 1.0
    ) -> Tuple[float, float]:
        """
        Calculate the stake and liability for a lay bet.
        
        Returns:
            Tuple of (stake, liability)
        """
        base_stake = bankroll * (self.stake_management.base_stake_percent / 100) * multiplier
        liability = base_stake * (odds - 1)
        max_liability = bankroll * (self.stake_management.max_liability_percent / 100)
        
        if liability > max_liability:
            # Adjust stake to stay within liability limit
            base_stake = max_liability / (odds - 1)
            liability = max_liability
        
        return round(base_stake, 2), round(liability, 2)
    
    def evaluate_race(
        self,
        race: Race,
        favorite: Runner,
        bankroll: float
    ) -> Optional[QualifyingRace]:
        """
        Evaluate a race and return qualifying race info if it passes.
        """
        qualifies, reasons, score = self.check_race_qualification(race, favorite)
        
        if not qualifies:
            return None
        
        multiplier = self.calculate_stake_multiplier(race)
        stake, liability = self.calculate_stake(
            bankroll, favorite.bsp_odds, multiplier
        )
        
        return QualifyingRace(
            **race.model_dump(),
            favorite=favorite,
            qualification_score=score,
            adjusted_stake_multiplier=multiplier,
            suggested_stake=stake,
            suggested_liability=liability,
            reasons=reasons,
        )
    
    def simulate_bet_result(self, odds: float) -> BetResult:
        """
        Simulate the result of a lay bet based on historical probabilities.
        
        In reality, favorites win approximately 30-35% of the time in
        qualifying races, meaning lay bets win 65-70% of the time.
        """
        # Base win probability for lay bet (favorite loses)
        base_lay_win_prob = 0.67
        
        # Adjust based on odds - lower odds = more likely favorite wins
        # Higher odds = less likely favorite wins
        odds_adjustment = (odds - 2.0) * 0.02  # +2% per 0.1 odds increase
        lay_win_prob = min(0.75, max(0.55, base_lay_win_prob + odds_adjustment))
        
        if random.random() < lay_win_prob:
            return BetResult.WON
        return BetResult.LOST
    
    def calculate_profit_loss(
        self,
        stake: float,
        liability: float,
        result: BetResult
    ) -> float:
        """Calculate profit or loss from a bet."""
        if result == BetResult.WON:
            # Lay bet wins - we keep the backer's stake
            return stake
        elif result == BetResult.LOST:
            # Lay bet loses - we pay out the liability
            return -liability
        return 0.0  # Void


def run_backtest(
    races: List[Race],
    runners: List[Runner],
    strategy_rules: StrategyRules,
    stake_management: StakeManagement,
    initial_bankroll: float
) -> Tuple[List[Bet], StrategyPerformance]:
    """
    Run a backtest of the strategy against historical data.
    
    Args:
        races: List of historical races
        runners: List of runners (linked to races)
        strategy_rules: The strategy rules to test
        stake_management: Stake management settings
        initial_bankroll: Starting bankroll
    
    Returns:
        Tuple of (bets, performance)
    """
    service = StrategyService(strategy_rules, stake_management)
    
    bets = []
    daily_results = {}
    bankroll = initial_bankroll
    
    # Group runners by race
    race_runners = {}
    for runner in runners:
        if runner.race_id not in race_runners:
            race_runners[runner.race_id] = []
        race_runners[runner.race_id].append(runner)
    
    for race in races:
        if race.id not in race_runners:
            continue
        
        race_runners_list = race_runners[race.id]
        
        # Find favorite
        favorites = [r for r in race_runners_list if r.is_favorite]
        if not favorites:
            continue
        
        favorite = favorites[0]
        
        # Check qualification
        qualifying_race = service.evaluate_race(race, favorite, bankroll)
        if qualifying_race is None:
            continue
        
        # Simulate bet
        result = service.simulate_bet_result(favorite.bsp_odds)
        profit_loss = service.calculate_profit_loss(
            qualifying_race.suggested_stake,
            qualifying_race.suggested_liability,
            result
        )
        
        # Update bankroll
        bankroll += profit_loss
        
        # Create bet record
        bet = Bet(
            id=f"bt_{len(bets) + 1}",
            race_id=race.id,
            runner_id=favorite.id,
            strategy_id="backtest",
            bet_type="lay",
            odds=favorite.bsp_odds,
            stake=qualifying_race.suggested_stake,
            liability=qualifying_race.suggested_liability,
            status=BetStatus.SETTLED,
            result=result,
            profit_loss=profit_loss,
            placed_at=datetime.strptime(f"{race.race_date} {race.race_time}", "%Y-%m-%d %H:%M"),
            settled_at=datetime.strptime(f"{race.race_date} {race.race_time}", "%Y-%m-%d %H:%M"),
            race=race,
            runner=favorite,
        )
        bets.append(bet)
        
        # Track daily results
        date = race.race_date
        if date not in daily_results:
            daily_results[date] = {
                "bets": 0,
                "won": 0,
                "lost": 0,
                "turnover": 0,
                "liability": 0,
                "profit_loss": 0,
            }
        
        daily_results[date]["bets"] += 1
        daily_results[date]["turnover"] += qualifying_race.suggested_stake
        daily_results[date]["liability"] += qualifying_race.suggested_liability
        daily_results[date]["profit_loss"] += profit_loss
        if result == BetResult.WON:
            daily_results[date]["won"] += 1
        else:
            daily_results[date]["lost"] += 1
    
    # Calculate performance metrics
    total_bets = len(bets)
    won_bets = sum(1 for b in bets if b.result == BetResult.WON)
    lost_bets = total_bets - won_bets
    total_turnover = sum(b.stake for b in bets)
    total_liability = sum(b.liability for b in bets)
    total_pl = bankroll - initial_bankroll
    
    # Calculate equity curve for drawdown
    equity_curve = [initial_bankroll]
    running_total = initial_bankroll
    for bet in bets:
        running_total += bet.profit_loss
        equity_curve.append(running_total)
    
    max_drawdown = calculate_max_drawdown(equity_curve)
    
    # Build daily performance list
    daily_performance = []
    running_bank = initial_bankroll
    sorted_dates = sorted(daily_results.keys())
    
    for date in sorted_dates:
        day = daily_results[date]
        starting_bank = running_bank
        running_bank += day["profit_loss"]
        
        daily_performance.append(DailyPerformance(
            date=date,
            total_bets=day["bets"],
            won_bets=day["won"],
            lost_bets=day["lost"],
            turnover=day["turnover"],
            liability=day["liability"],
            profit_loss=day["profit_loss"],
            roi=(day["profit_loss"] / day["turnover"] * 100) if day["turnover"] > 0 else 0,
            starting_bank=starting_bank,
            ending_bank=running_bank,
        ))
    
    performance = StrategyPerformance(
        strategy_id="backtest",
        total_bets=total_bets,
        won_bets=won_bets,
        lost_bets=lost_bets,
        win_rate=(won_bets / total_bets * 100) if total_bets > 0 else 0,
        total_turnover=total_turnover,
        total_liability=total_liability,
        total_profit_loss=total_pl,
        roi=(total_pl / total_turnover * 100) if total_turnover > 0 else 0,
        max_drawdown=max_drawdown,
        sharpe_ratio=calculate_sharpe_ratio(bets),
        daily_performance=daily_performance,
    )
    
    return bets, performance


def calculate_max_drawdown(equity_curve: List[float]) -> float:
    """Calculate maximum drawdown from equity curve."""
    if len(equity_curve) < 2:
        return 0.0
    
    max_dd = 0.0
    peak = equity_curve[0]
    
    for value in equity_curve:
        if value > peak:
            peak = value
        
        dd = (peak - value) / peak * 100
        if dd > max_dd:
            max_dd = dd
    
    return round(max_dd, 2)


def calculate_sharpe_ratio(bets: List[Bet]) -> float:
    """Calculate Sharpe ratio from bet results."""
    if len(bets) < 2:
        return 0.0
    
    returns = [b.profit_loss / b.stake for b in bets if b.stake > 0]
    if len(returns) < 2:
        return 0.0
    
    import numpy as np
    mean_return = np.mean(returns)
    std_return = np.std(returns)
    
    if std_return == 0:
        return 0.0
    
    # Annualize assuming ~7 bets per day, 300 days per year
    annualization_factor = np.sqrt(7 * 300)
    
    return round((mean_return / std_return) * annualization_factor, 2)
