def calculate_battery_impact(
  hourly_production: list[float],
  capacity_kwh: float,
  annual_use_kwh: float
) -> dict:

  hours = len(hourly_production)

  hourly_consumption = annual_use_kwh / hours

  charge_efficiency = 0.95
  discharge_efficiency = 0.95

  # Calculate results without a battery
  without_battery_used = 0.0
  without_battery_exported = 0.0
  without_battery_imported = 0.0

  # Calculate results with a battery
  battery_level = 0.0
  with_battery_used = 0.0
  with_battery_exported = 0.0
  with_battery_imported = 0.0

  for production in hourly_production:

    # WITHOUT BATTERY
    direct_use = min(production, hourly_consumption)

    without_battery_used += direct_use
    without_battery_exported += production - direct_use
    without_battery_imported += hourly_consumption - direct_use

    # WITH BATTERY
    direct_use = min(production, hourly_consumption)

    surplus = production - direct_use
    deficit = hourly_consumption - direct_use

    with_battery_used += direct_use

    # Charge the battery using surplus solar energy
    available_space = capacity_kwh - battery_level

    energy_to_charge = min(
      surplus,
      available_space / charge_efficiency
    )

    battery_level += energy_to_charge * charge_efficiency

    with_battery_exported += surplus - energy_to_charge

    # Discharge the battery when production is insufficient
    energy_available = battery_level * discharge_efficiency

    energy_from_battery = min(
      deficit,
      energy_available
    )

    battery_level -= energy_from_battery / discharge_efficiency

    with_battery_used += energy_from_battery
    with_battery_imported += deficit - energy_from_battery

  production_total = sum(hourly_production)

  return {
    "productionKwh": round(production_total, 2),
    "consumptionKwh": round(annual_use_kwh, 2),
    "withoutBattery": {
      "selfUsedKwh": round(without_battery_used, 2),
      "gridImportKwh": round(without_battery_imported, 2),
      "exportedKwh": round(without_battery_exported, 2),
      "selfConsumptionPercent": round(
        without_battery_used / production_total * 100, 2
      ) if production_total else 0,
      "selfSufficiencyPercent": round(
        without_battery_used / annual_use_kwh * 100, 2
      ),
    },
    "withBattery": {
      "selfUsedKwh": round(with_battery_used, 2),
      "gridImportKwh": round(with_battery_imported, 2),
      "exportedKwh": round(with_battery_exported, 2),
      "selfConsumptionPercent": round(
        with_battery_used / production_total * 100, 2
      ) if production_total else 0,
      "selfSufficiencyPercent": round(
        with_battery_used / annual_use_kwh * 100, 2
      ),
    },
    "batteryCapacityKwh": capacity_kwh,
    "simulationYear": 2023
  }