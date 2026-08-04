"""
Generate Synthetic Vehicle Fuel Efficiency Dataset
===================================================
Generates ~8000 rows of realistic vehicle data for Indonesian daily-use vehicles.
Covers motorcycles (Roda2) and cars (Roda4) with realistic fuel efficiency values.

Output: vehicle_fuel_dataset.csv
"""

import numpy as np
import pandas as pd
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

np.random.seed(42)

# =============================================================================
# Vehicle Type Configurations
# =============================================================================
VEHICLE_CONFIGS = {
    # --- RODA 2 (Motorcycles) ---
    "Bebek": {
        "category": "Roda2",
        "engine_cc": (100, 150),
        "cylinders": 1,
        "horsepower": (7, 12),
        "weight_kg": (90, 110),
        "transmissions": ["Manual"],
        "fuel_types": ["Bensin"],
        "cooling_systems": ["Air-cooled"],
        "base_kmpl": 55,  # Motor bebek sangat irit
        "kmpl_range": (42, 65),
        "threshold_kmpl": 48,  # Di bawah ini = boros untuk bebek
        "count": 800,
    },
    "Matic": {
        "category": "Roda2",
        "engine_cc": (110, 160),
        "cylinders": 1,
        "horsepower": (9, 16),
        "weight_kg": (95, 125),
        "transmissions": ["CVT"],
        "fuel_types": ["Bensin"],
        "cooling_systems": ["Air-cooled", "Liquid-cooled"],
        "base_kmpl": 48,
        "kmpl_range": (35, 58),
        "threshold_kmpl": 42,
        "count": 1500,  # Paling populer di Indonesia
    },
    "Sport": {
        "category": "Roda2",
        "engine_cc": (150, 250),
        "cylinders": (1, 2),
        "horsepower": (15, 30),
        "weight_kg": (120, 170),
        "transmissions": ["Manual"],
        "fuel_types": ["Bensin"],
        "cooling_systems": ["Liquid-cooled"],
        "base_kmpl": 38,
        "kmpl_range": (28, 48),
        "threshold_kmpl": 33,
        "count": 800,
    },
    "Sport Besar": {
        "category": "Roda2",
        "engine_cc": (250, 650),
        "cylinders": (2, 4),
        "horsepower": (25, 70),
        "weight_kg": (160, 250),
        "transmissions": ["Manual"],
        "fuel_types": ["Bensin"],
        "cooling_systems": ["Liquid-cooled"],
        "base_kmpl": 25,
        "kmpl_range": (16, 32),
        "threshold_kmpl": 22,
        "count": 700,
    },
    # --- RODA 4 (Cars) ---
    "City Car": {
        "category": "Roda4",
        "engine_cc": (1000, 1500),
        "cylinders": (3, 4),
        "horsepower": (65, 105),
        "weight_kg": (800, 1100),
        "transmissions": ["Manual", "Automatic", "CVT"],
        "fuel_types": ["Bensin"],
        "cooling_systems": ["Liquid-cooled"],
        "base_kmpl": 18,
        "kmpl_range": (13, 22),
        "threshold_kmpl": 15,
        "count": 1200,
    },
    "MPV": {
        "category": "Roda4",
        "engine_cc": (1300, 1800),
        "cylinders": 4,
        "horsepower": (85, 130),
        "weight_kg": (1100, 1500),
        "transmissions": ["Manual", "Automatic", "CVT"],
        "fuel_types": ["Bensin", "Diesel"],
        "cooling_systems": ["Liquid-cooled"],
        "base_kmpl": 14,
        "kmpl_range": (9, 18),
        "threshold_kmpl": 12,
        "count": 1500,
    },
    "SUV": {
        "category": "Roda4",
        "engine_cc": (1500, 2000),
        "cylinders": 4,
        "horsepower": (100, 150),
        "weight_kg": (1200, 1600),
        "transmissions": ["Manual", "Automatic", "CVT", "DCT"],
        "fuel_types": ["Bensin", "Diesel", "Hybrid"],
        "cooling_systems": ["Liquid-cooled"],
        "base_kmpl": 12,
        "kmpl_range": (8, 16),
        "threshold_kmpl": 11,
        "count": 1500,
    },
}

# Fuel prices (Rp per liter) - Indonesia 2024-2026 range
FUEL_PRICES = {
    "Bensin": (10000, 13900),   # Pertalite - Pertamax
    "Diesel": (6800, 13200),    # Solar subsidi - Dexlite
    "Hybrid": (13900, 14500),   # Pertamax (hybrid still uses gasoline)
}

# Daily income simulation ranges (Rp) based on usage pattern
USAGE_PATTERNS = {
    "Roda2": {
        "daily_distance_km": (10, 80),
        "daily_income": (50000, 300000),  # Ojol, kurir, pribadi
    },
    "Roda4": {
        "daily_distance_km": (15, 100),
        "daily_income": (100000, 600000),  # Taksi online, pribadi, bisnis
    },
}


def generate_vehicle_data(vehicle_type: str, config: dict) -> pd.DataFrame:
    """Generate synthetic data for a single vehicle type."""
    n = config["count"]
    rows = []

    for _ in range(n):
        # Engine CC
        cc = np.random.uniform(*config["engine_cc"])

        # Cylinders
        if isinstance(config["cylinders"], tuple):
            cyl = np.random.choice(range(config["cylinders"][0], config["cylinders"][1] + 1))
        else:
            cyl = config["cylinders"]

        # Horsepower (correlated with CC)
        hp_min, hp_max = config["horsepower"]
        cc_ratio = (cc - config["engine_cc"][0]) / (config["engine_cc"][1] - config["engine_cc"][0])
        hp_base = hp_min + cc_ratio * (hp_max - hp_min)
        hp = np.clip(hp_base + np.random.normal(0, (hp_max - hp_min) * 0.1), hp_min, hp_max)

        # Weight (correlated with CC)
        wt_min, wt_max = config["weight_kg"]
        wt_base = wt_min + cc_ratio * (wt_max - wt_min)
        wt = np.clip(wt_base + np.random.normal(0, (wt_max - wt_min) * 0.1), wt_min, wt_max)

        # Transmission
        trans = np.random.choice(config["transmissions"])

        # Fuel type
        fuel = np.random.choice(config["fuel_types"])

        # Cooling system
        if isinstance(config["cooling_systems"], list) and len(config["cooling_systems"]) > 1:
            # Liquid-cooled more common for higher CC
            lc_prob = 0.3 + 0.5 * cc_ratio
            cool = np.random.choice(config["cooling_systems"],
                                     p=[1 - lc_prob, lc_prob] if config["cooling_systems"][0] == "Air-cooled" else [lc_prob, 1 - lc_prob])
        else:
            cool = config["cooling_systems"][0]

        # Year (2015-2026)
        year = np.random.randint(2015, 2027)

        # Daily distance & income
        usage = USAGE_PATTERNS[config["category"]]
        daily_dist = np.random.uniform(*usage["daily_distance_km"])
        daily_income = np.random.uniform(*usage["daily_income"])

        # Fuel price
        fuel_price = np.random.uniform(*FUEL_PRICES[fuel])

        # =====================================================================
        # Calculate fuel efficiency (km/L) using heuristic formula
        # =====================================================================
        base = config["base_kmpl"]

        # CC penalty: larger engine = less efficient
        cc_norm = (cc - config["engine_cc"][0]) / max(config["engine_cc"][1] - config["engine_cc"][0], 1)
        cc_penalty = -cc_norm * base * 0.25

        # HP penalty: more power = less efficient
        hp_norm = (hp - hp_min) / max(hp_max - hp_min, 1)
        hp_penalty = -hp_norm * base * 0.15

        # Weight penalty: heavier = less efficient
        wt_norm = (wt - wt_min) / max(wt_max - wt_min, 1)
        wt_penalty = -wt_norm * base * 0.20

        # Transmission bonus
        trans_bonus = {
            "Manual": 0,
            "CVT": base * 0.05,       # CVT sedikit lebih irit
            "Automatic": -base * 0.03,  # AT sedikit lebih boros
            "DCT": base * 0.03,         # DCT cukup efisien
        }.get(trans, 0)

        # Fuel type bonus
        fuel_bonus = {
            "Bensin": 0,
            "Diesel": base * 0.12,    # Diesel lebih irit per liter
            "Hybrid": base * 0.20,    # Hybrid paling irit
        }.get(fuel, 0)

        # Cooling system effect (motor only)
        cool_bonus = {
            "Air-cooled": base * 0.02,     # Sedikit lebih irit (lebih ringan)
            "Liquid-cooled": -base * 0.02,  # Sedikit lebih boros (lebih berat)
        }.get(cool, 0)

        # Year bonus (newer = more efficient, fuel injection, better tech)
        year_bonus = (year - 2015) * base * 0.008

        # Distance penalty (very long daily distance = slightly less efficient due to fatigue/traffic)
        dist_mid = (usage["daily_distance_km"][0] + usage["daily_distance_km"][1]) / 2
        dist_penalty = -abs(daily_dist - dist_mid) / dist_mid * base * 0.05

        # Calculate raw km/L
        kmpl = base + cc_penalty + hp_penalty + wt_penalty + trans_bonus + fuel_bonus + cool_bonus + year_bonus + dist_penalty

        # Add Gaussian noise for realism
        noise = np.random.normal(0, base * 0.08)
        kmpl = np.clip(kmpl + noise, config["kmpl_range"][0], config["kmpl_range"][1])

        # Label: Boros / Hemat (per-type threshold)
        label = "Hemat" if kmpl >= config["threshold_kmpl"] else "Boros"

        rows.append({
            "vehicle_category": config["category"],
            "vehicle_type": vehicle_type,
            "engine_cc": round(cc, 1),
            "cylinders": int(cyl),
            "horsepower": round(hp, 1),
            "weight_kg": round(wt, 1),
            "transmission": trans,
            "fuel_type": fuel,
            "cooling_system": cool,
            "daily_distance_km": round(daily_dist, 1),
            "daily_income": round(daily_income, 0),
            "fuel_price_per_liter": round(fuel_price, 0),
            "year": int(year),
            "fuel_efficiency_kmpl": round(kmpl, 2),
            "label": label,
        })

    return pd.DataFrame(rows)


def main():
    print("🚗 Generating synthetic vehicle fuel dataset...")
    print(f"   Target: {sum(c['count'] for c in VEHICLE_CONFIGS.values())} rows\n")

    all_data = []
    for vtype, config in VEHICLE_CONFIGS.items():
        df = generate_vehicle_data(vtype, config)
        all_data.append(df)
        hemat_pct = (df["label"] == "Hemat").mean() * 100
        print(f"   ✅ {vtype:15s} — {len(df):5d} rows | avg kmpl: {df['fuel_efficiency_kmpl'].mean():.1f} | Hemat: {hemat_pct:.0f}%")

    dataset = pd.concat(all_data, ignore_index=True)

    # Shuffle
    dataset = dataset.sample(frac=1, random_state=42).reset_index(drop=True)

    # Save
    output_path = os.path.join(os.path.dirname(__file__), "vehicle_fuel_dataset.csv")
    dataset.to_csv(output_path, index=False)

    print(f"\n📊 Dataset Summary:")
    print(f"   Total rows: {len(dataset)}")
    print(f"   Columns: {list(dataset.columns)}")
    print(f"   Roda2: {len(dataset[dataset['vehicle_category'] == 'Roda2'])} ({len(dataset[dataset['vehicle_category'] == 'Roda2']) / len(dataset) * 100:.0f}%)")
    print(f"   Roda4: {len(dataset[dataset['vehicle_category'] == 'Roda4'])} ({len(dataset[dataset['vehicle_category'] == 'Roda4']) / len(dataset) * 100:.0f}%)")
    print(f"   Hemat: {len(dataset[dataset['label'] == 'Hemat'])} | Boros: {len(dataset[dataset['label'] == 'Boros'])}")
    print(f"\n💾 Saved to: {output_path}")


if __name__ == "__main__":
    main()
