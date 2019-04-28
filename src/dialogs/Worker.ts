export class EmployeeContract {
    public hours?: number;
    public startDate?: Date;
}

export class CasualContract {
}

export class Worker {

    public employeeContract?: EmployeeContract | null;

    public casualContract?: CasualContract | null;

    public static deserialize(text: string): Worker {
        return Object.assign(new Worker(), JSON.parse(text, (key, val) => {
            switch (key) {
                case "employeeContract":
                    return val ? Object.assign(new EmployeeContract(), val) : val;
                case "casualContract":
                    return val ? Object.assign(new CasualContract(), val) : val;
                case "startDate":
                    return (new Date(val));
                default:
                    return val;
            }
        }));
    }

    public serialize(): string {
        return JSON.stringify(this);
    }

    public annualLeaveHours(referenceDate: Date): number | undefined {
        if (this.employeeContract) {
            if (this.employeeContract.hours &&
                this.employeeContract.startDate) {
                let wholeYearsService: number;
                if (referenceDate < this.employeeContract.startDate) {
                    wholeYearsService = 0;
                } else {
                    wholeYearsService =
                        wholeYearsBetween(this.employeeContract.startDate, referenceDate);
                }
                let employeeMultiplier = this.employeeContract.hours / 5;
                if (wholeYearsService <= 2) {
                    return 29 * employeeMultiplier;
                } else if (wholeYearsService <= 3) {
                    return 31 * employeeMultiplier;
                } else if (wholeYearsService <= 6) {
                    return 34 * employeeMultiplier;
                } else if (wholeYearsService <= 8) {
                    return 38 * employeeMultiplier;
                } else {
                    return 43 * employeeMultiplier;
                }
            } else {
                return undefined;
            }
        }
    }
}

function wholeYearsBetween(date1: Date, date2: Date): number {
    let [olderDate, newerDate] = date1 <= date2 ? [date1, date2] : [date2, date1];
    let yearDiff = newerDate.getFullYear() - olderDate.getFullYear();
    if ((newerDate.getMonth() < olderDate.getMonth()) ||
        ((newerDate.getMonth() === olderDate.getMonth()) &&
            (newerDate.getDate() < olderDate.getDate()))) {
        return yearDiff - 1;
    }
    else {
        return yearDiff;
    }
}
