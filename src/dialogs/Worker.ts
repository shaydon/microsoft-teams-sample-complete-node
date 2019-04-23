export interface IWorkerDetails {
    casualContract?: boolean;
    employeeContract?: IEmployeeDetails;
}

export interface IEmployeeDetails {
    hours?: number;
    startDate?: Date;
}

export function annualLeaveHoursForWorker(workerDetails: IWorkerDetails, referenceDate: Date): number | undefined {
    if (workerDetails.employeeContract) {
        let employeeDetails = workerDetails.employeeContract;
        if (employeeDetails.hours && employeeDetails.startDate) {
            let wholeYearsService: number;
            if (referenceDate < employeeDetails.startDate) {
                wholeYearsService = 0;
            } else {
                wholeYearsService = wholeYearsBetween(employeeDetails.startDate, referenceDate);
            }
            let employeeMultiplier = employeeDetails.hours / 5;
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
