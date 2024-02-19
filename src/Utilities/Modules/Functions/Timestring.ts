/**
 * TypeScript Version of the Timestring Parser
 */

// Interface for Options
interface Options {
    hoursPerDay: number;
    daysPerWeek: number;
    weeksPerMonth: number;
    monthsPerYear: number;
    daysPerYear: number;
}

// Default options to use when parsing a timestring
const DEFAULT_OPTS: Options = {
    hoursPerDay: 24,
    daysPerWeek: 7,
    weeksPerMonth: 4,
    monthsPerYear: 12,
    daysPerYear: 365.25,
};

// Map of accepted strings to unit
const UNIT_MAP: { [unit: string]: string[] } = {
    ms: ["ms", "milli", "millisecond", "milliseconds"],
    s: ["s", "sec", "secs", "second", "seconds"],
    m: ["min", "mins", "minute", "minutes"],
    h: ["h", "hr", "hrs", "hour", "hours"],
    d: ["d", "day", "days"],
    w: ["w", "week", "weeks"],
    mth: ["m", "mon", "mth", "mths", "month", "months"],
    y: ["y", "yr", "yrs", "year", "years"],
};

// Interface for Unit Values
interface UnitValues {
    [unit: string]: number;
}

// Parse a timestring
function parseTimestring(value: string | number, returnUnit: string, opts?: Partial<Options>): number {
    const options: Options = { ...DEFAULT_OPTS, ...opts };
    let valueStr: string;

    if (typeof value === "number" || /^[-+]?[0-9.]+$/g.test(value.toString())) {
        valueStr = parseInt(value.toString(), 10) + "ms";
    } else {
        valueStr = value as string;
    }

    let totalSeconds = 0;
    const unitValues: UnitValues = getUnitValues(options);
    const groups = valueStr
        .toLowerCase()
        .replace(/[^.\w+-]+/g, "")
        .match(/[-+]?[0-9.]+[a-z]+/g);

    if (!groups) {
        throw new Error(`The value [${valueStr}] could not be parsed by timestring`);
    }

    groups.forEach((group) => {
        const valueMatch = group.match(/[0-9.]+/g);
        const unitMatch = group.match(/[a-z]+/g);
        if (!valueMatch || !unitMatch) return;

        const numValue = parseFloat(valueMatch[0]);
        const unit = unitMatch[0];

        totalSeconds += getSeconds(numValue, unit, unitValues);
    });

    if (returnUnit) {
        return convert(totalSeconds, returnUnit, unitValues);
    }

    return totalSeconds;
}

// Get unit values based on the passed options
function getUnitValues(opts: Options): UnitValues {
    const unitValues: UnitValues = {
        ms: 0.001,
        s: 1,
        m: 60,
        h: 3600,
    };

    unitValues.d = opts.hoursPerDay * unitValues.h;
    unitValues.w = opts.daysPerWeek * unitValues.d;
    unitValues.mth = (opts.daysPerYear / opts.monthsPerYear) * unitValues.d;
    unitValues.y = opts.daysPerYear * unitValues.d;

    return unitValues;
}

// Get the key for a unit
function getUnitKey(unit: string): string {
    for (const key in UNIT_MAP) {
        if (UNIT_MAP[key].includes(unit)) {
            return key;
        }
    }

    throw new Error(`The unit [${unit}] is not supported by timestring`);
}

// Get the number of seconds for a value, based on the unit
function getSeconds(value: number, unit: string, unitValues: UnitValues): number {
    return value * unitValues[getUnitKey(unit)];
}

// Convert a value from its existing unit to a new unit
function convert(value: number, unit: string, unitValues: UnitValues): number {
    return value / unitValues[getUnitKey(unit)];
}

export default parseTimestring;
