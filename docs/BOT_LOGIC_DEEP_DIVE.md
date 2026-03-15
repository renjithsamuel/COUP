# Bot Logic Deep Dive — Decision-Making Under Uncertainty

## The Core Problem

In Coup, each turn a bot must decide among **7 possible actions** (Income, Foreign Aid, Coup, Tax, Steal, Assassinate, Exchange), and during other players' turns, it must decide whether to **challenge**, **block**, or **accept**. The game is one of **incomplete information** — the bot knows its own cards but not opponents' cards, and crucially, *bluffing* is legal.

The bot has a **god-like advantage**: it knows the full `GameState` (its own cards, revealed cards, coin counts). A naive bot that always plays optimally would be unfun. The design here solves both problems — decision-making under combinatorial possibilities, **and** mimicking human-like vulnerability.

---

## Architecture: Weighted Stochastic Decision Trees

Rather than solving the game tree (which would be intractable and unfun), the bot uses **weighted random selection** — a pattern used extensively in game AI. Here's how each decision point works.

### 1. Action Selection — `choose_bot_turn_action()`

The bot builds a **candidate list** of `(action, target, weight)` tuples, then picks one via weighted random choice:

```python
candidates = [(INCOME, None, 1.0)]   # always available, baseline weight

if coins >= 7:  candidates += [(COUP, target, 4.4)]     # strong preference
if has Duke:    candidates += [(TAX, None, 2.8)]         # honest play, high weight
elif bluff:     candidates += [(TAX, None, 1.5)]         # bluff, lower weight
# ... and so on for every possible action
```

The function `_weighted_choice()` then rolls a random number across the total weight space. If TAX has weight 2.8 and INCOME has weight 1.0, TAX is chosen ~74% of the time — but not always. This creates **unpredictable but rational** behavior.

**Key insight**: The weights encode *strategic knowledge* without needing tree search. The Duke is the best card (weight 2.2 in `_card_value()`), Assassinate targets with 1 influence get a +1.2 bonus, etc.

### 2. Bluffing — `bluff_chance`

This is how vulnerability is mimicked. The bot uses a **difficulty-scaled bluff probability**:

| Difficulty | Bluff Chance | Effect |
|---|---|---|
| Easy | 34% | Frequently claims cards it doesn't have → easily caught |
| Medium | 22% | Moderate bluffing |
| Hard | 12% | Rarely bluffs → hard to catch in a lie |

When the bot *doesn't* hold the required character, it only *considers* that action with probability `bluff_chance`. And even then, the weight is lower (e.g., Tax with Duke = 2.8, Tax bluffing = 1.5). So bluffs happen less often **and** are chosen less often when they do enter the pool.

### 3. Challenging — `should_bot_challenge()`

The bot uses **card counting** via `_known_character_count()`:

```python
known_count = (cards bot holds of that character) + (revealed cards of that character)
if known_count >= 3:  # out of 3 total copies in the deck
    # challenge with 72-93% probability (difficulty-scaled)
```

If the bot can see that 3 Dukes are accounted for (in its hand + revealed), it *knows* the opponent is bluffing Tax → high challenge rate. Otherwise, it uses a low base probability (5-15%) modified by context:

- Is the bot the target of the action? → +12%
- Is it an assassination? → +14%
- Is it a steal? → +8%
- Is it a tax? → +3%

### 4. Blocking — `choose_bot_block()`

Similar structure: if the bot holds the blocking character, it blocks with ~88-95% probability (not 100% — mimicking human hesitation). If bluffing a block, the probability drops to `bluff_chance * scaling_factor`, scaled by how *critical* blocking is:

| Action Being Blocked | Bluff Scaling | Rationale |
|---|---|---|
| Assassinate | 95% of bluff chance | Life-or-death, even a bluff is worth trying |
| Steal | 70% of bluff chance | Losing coins hurts but isn't fatal |
| Foreign Aid | 45% of bluff chance | Low stakes, risky to bluff-block |

### 5. Influence Loss — `choose_influence_loss_index()`

When forced to lose a card, the bot scores each card via `_card_value()` with situational bonuses, then discards the **lowest-scored** card — but adds random noise scaled by difficulty:

| Difficulty | Noise Range | Result |
|---|---|---|
| Easy | 0–1.4 | Often picks suboptimally |
| Medium | 0–0.75 | Moderate accuracy |
| Hard | 0–0.25 | Nearly optimal |

#### Card Values (base)

| Character | Base Value | Notes |
|---|---|---|
| Duke | 2.2 | Best income generator |
| Assassin | 1.8 | Strong offensive threat |
| Captain | 1.6 | Flexible (steal + block steal) |
| Contessa | 1.2 | Purely defensive, +0.45 if opponents can assassinate |
| Ambassador | 1.0 | Lowest base, but +0.35 for exchange utility |

### 6. Exchange Selection — `choose_exchange_keep_indices()`

During an Exchange, the bot sees its alive cards plus exchange cards from the deck. It scores all cards using the same `_card_value()` function with difficulty-scaled noise, then keeps the highest-scoring ones. This means:

- **Hard bots** almost always pick the objectively best cards
- **Easy bots** sometimes keep suboptimal cards due to noise

### 7. Target Selection — `_choose_target()`

When an action requires a target, the bot computes a **threat score** for each opponent:

```python
threat_score = (influence_count * 3.2) + coins + (0.75 if human) + random(0, 0.8)
```

This means:
- Players with more influences are bigger threats (×3.2 multiplier)
- Richer players are more dangerous
- Humans get a slight targeting bias (+0.75)
- Random jitter prevents completely predictable targeting

### 8. Personality System

Each bot has a deterministic **personality** derived from hashing its `profile_id`:

```python
def _personality_trait(bot, offset):
    seed = sum(ord(c) for c in bot.profile_id) + offset
    return ((seed % 21) - 10) / 100  # range: -0.10 to +0.10
```

Different offsets create independent "traits" (aggression at offset 7, caution at offset 11, challenge tendency at offset 23) that shift weights by ±10%. This means two bots with the same difficulty play *differently* — one might favor stealing, another might prefer taxing — without any explicit personality configuration.

---

## How the Bot Loop Runs

The bot doesn't run in a separate thread. Instead, `game_service.py` has a **polling loop** (`process_bot_turns`) that iterates over all active games and checks if any bot needs to act:

```
process_bot_turns()
  └─ for each game:
       └─ process_bot_step(game_id)
            ├─ TURN_START → choose_bot_turn_action()
            ├─ CHALLENGE_WINDOW → should_bot_challenge()
            ├─ BLOCK_WINDOW → choose_bot_block()
            ├─ BLOCK_CHALLENGE_WINDOW → should_bot_challenge()
            ├─ AWAITING_INFLUENCE_LOSS → choose_influence_loss_index()
            └─ AWAITING_EXCHANGE → choose_exchange_keep_indices()
```

Each phase maps to exactly one bot decision function — no recursion, no tree search.

---

## How This Avoids the NP-Hard Problem

A full game tree for Coup has branching factor ~7 actions × ~4 responses × 2–6 players, with hidden information. Solving this is intractable. The bot **doesn't try to solve it**. Instead, it uses:

1. **Heuristic evaluation** ("Duke is worth 2.2, Assassin is worth 1.8") instead of minimax search
2. **Weighted random choice** instead of optimal play
3. **Card counting** for the one tractable sub-problem (challenge decisions)
4. **Situational adjustments** (target players with fewer influences, block assassinations more aggressively)

This is essentially a **rule-based expert system with stochastic noise** — not search-based AI.

---

## How Other Games Handle This

### Chess/Go — Tree Search + Neural Evaluation

Games with **perfect information** but enormous state spaces use **MCTS (Monte Carlo Tree Search)** or **minimax with alpha-beta pruning**.

**AlphaGo** combined a neural network evaluator with MCTS:
1. The NN evaluates a board position → outputs a score (replaces hand-coded heuristics like `_card_value()`)
2. MCTS samples thousands of random future games from the current position
3. The action leading to the best average outcome is selected

This is tractable because chess/Go have **perfect information** — no hidden cards, no bluffing.

**Example**: In chess, instead of "Duke=2.2", the NN examines the board and outputs something like "White has 62% winning probability." MCTS validates this by playing out random games. In Coup's bot, `_card_value()` serves the same purpose as the NN — just hand-coded.

### Poker — Counterfactual Regret Minimization (CFR)

Poker shares Coup's core challenge: **incomplete information + bluffing**. Libratus (the AI that beat professional poker players) used **CFR**:

1. Simulate billions of games
2. At each decision point, compute "regret" — how much better you could have done with a different choice
3. Iteratively adjust strategy to minimize total regret
4. The strategy converges to a **Nash equilibrium** (no opponent can exploit it)

**Why Coup doesn't use this**: CFR requires pre-computing a strategy table for every possible game state. Coup's state space is smaller than poker's, but:
- It would produce a **perfectly optimal** bot, which isn't fun for a casual game
- The weighted-random approach is simpler, tunable, and *intentionally imperfect*
- CFR requires significant computational resources during the pre-computation phase

### Hearthstone / MTG — Simulation-Based Planning

Card games with huge action spaces use **forward simulation**:
1. Generate 100+ random possible game states (sampling unknown cards)
2. For each possible action, simulate it across all sampled states
3. Pick the action with the best average outcome

This is essentially lightweight MCTS without a neural network. It handles hidden information by **sampling** possible opponent hands.

**Comparison to Coup**: This approach could work for Coup but is overkill for 5 characters and at most 7 actions. The heuristic weights achieve similar quality with zero simulation cost.

### Board Games (Catan, Risk) — Utility Functions

Similar to this Coup bot. Each action gets a **utility score** based on heuristics (resource value, territory control), then the AI picks the highest-scoring or uses weighted random. The key difference from Coup is that these games have less bluffing, so the "vulnerability mimicking" problem is smaller.

**Example in Catan**: Building a settlement might score `resource_value * 2.5 + port_bonus + expansion_potential`. The AI picks the highest-scoring location. This is almost identical to how `_card_value()` works in Coup.

---

## The Vulnerability-Mimicking Problem

This is the hardest part. The bot **knows every card** it holds, so it could:
- Never bluff (always play honestly → never get caught)
- Always challenge bluffs it can prove (via card counting)
- Always block when it has the right card

This would make it invincible. The solution here uses **three layers of imperfection**:

| Layer | Mechanism | Effect |
|---|---|---|
| **Deliberate inaction** | 88-95% block rate even with correct card | Sometimes "forgets" to block |
| **Stochastic noise** | Random noise added to card valuations | Sometimes discards the wrong card |
| **Difficulty-scaled bluffing** | Easy bots bluff 34% of the time | Creates exploitable behavior for humans |
| **Personality variance** | ±10% weight shifts per bot | Different bots have different blind spots |
| **Non-deterministic targets** | Random jitter in threat scoring | Doesn't always target the optimal player |

### How Professional AI Handles This

**Libratus** (poker AI) handles vulnerability differently: it plays the **Nash equilibrium strategy**, which is unexploitable but not maximally exploitative. It doesn't "pretend to be bad" — it plays the mathematically balanced strategy, which *naturally* includes bluffing at specific frequencies.

This Coup bot approximates the same idea but with hand-tuned knobs instead of computed equilibria. The `_BLUFF_CHANCE` constants serve the same role as Nash-equilibrium bluffing frequencies — they make the bot "honest enough to be exploitable but deceptive enough to be threatening."

---

## Summary: Design Patterns for Game AI Decision-Making

| Pattern | When to Use | Coup Example |
|---|---|---|
| **Weighted random choice** | Finite action set, need unpredictability | `_weighted_choice()` for action selection |
| **Heuristic scoring** | Evaluating cards/positions without search | `_card_value()` for influence loss/exchange |
| **Card counting** | Known information narrows hidden state | `_known_character_count()` for challenges |
| **Difficulty-scaled noise** | Same AI with adjustable strength | Random noise in `choose_influence_loss_index()` |
| **Personality seeds** | Same difficulty, different play styles | `_personality_trait()` hash-based traits |
| **Deliberate imperfection** | Bot knows too much, must appear human | 88-95% action rates instead of 100% |
| **Contextual weight modifiers** | Strategy should adapt to game state | Contessa value rises when opponents have 3+ coins |

The key takeaway: **you don't need to solve the game tree to build a good bot**. A well-tuned heuristic system with calibrated randomness produces believable, fun, and difficulty-adjustable AI — at a fraction of the complexity of search-based approaches.
