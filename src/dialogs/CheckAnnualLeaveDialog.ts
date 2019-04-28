import * as builder from "botbuilder";
import { TriggerActionDialog } from "../utils/TriggerActionDialog";
import { DialogIds } from "../utils/DialogIds";
import { DialogMatches } from "../utils/DialogMatches";
import { Strings } from "../locale/locale";
import { Worker } from "./Worker";

export class CheckAnnualLeaveDialog extends TriggerActionDialog {

    private static async step1(
        session: builder.Session,
        args?: any | builder.IDialogResult<any>,
        next?: (args?: builder.IDialogResult<Worker>) => void):
        Promise<void> {
            session.send(
`Your annual leave depends on what type of contract you have, your usual \
hours of work, and how long you have worked for us.`,
            );
            session.beginDialog(
                DialogIds.EnsureWorkerDetailsDialogId,
                session.userData.worker
                    ? Worker.deserialize(session.userData.worker)
                    : new Worker(),
            );
    }

    private static async step2(
        session: builder.Session,
        args: builder.IDialogResult<Worker>,
        next: (args?: builder.IDialogResult<any>) => void,
        ): Promise<void> {
        if (args.response) {
            let worker = args.response;
            session.userData.worker = worker.serialize();
            let now = new Date();
            let startDate = worker.employeeContract.startDate;
            let lastStartAnniversary: Date;
            if (earlierInYear(startDate, now)) {
                lastStartAnniversary = new Date(
                    now.getFullYear(), startDate.getMonth(), startDate.getDate(),
                );
            } else {
                lastStartAnniversary = new Date(
                    now.getFullYear() - 1, startDate.getMonth(), startDate.getDate(),
                );
            }
            let nextStartAnniversary = new Date(
                lastStartAnniversary.getFullYear() + 1,
                lastStartAnniversary.getMonth(),
                lastStartAnniversary.getDate(),
            );
            const msPerDay = 24 * 60 * 60 * 1000;
            let dayBeforeNextAnniversary = new Date(nextStartAnniversary.getTime() - msPerDay);
            let dayBeforeNextAgainAnniversary = new Date(
                dayBeforeNextAnniversary.getFullYear() + 1,
                dayBeforeNextAnniversary.getMonth(),
                dayBeforeNextAnniversary.getDate(),
            );
            let currentLeaveYearHours = worker.annualLeaveHours(lastStartAnniversary);
            let currentLeaveYearWeeks = currentLeaveYearHours / worker.employeeContract.hours;
            let nextLeaveYearHours = worker.annualLeaveHours(nextStartAnniversary);
            let nextLeaveYearWeeks = nextLeaveYearHours / worker.employeeContract.hours;
            session.send(
`You have ${currentLeaveYearHours} hours (${currentLeaveYearWeeks} weeks' worth) annual leave \
to take between ${formatDate(lastStartAnniversary)} and ${formatDate(dayBeforeNextAnniversary)}.`,
            );
            session.send(
`Then you have ${nextLeaveYearHours} hours (${nextLeaveYearWeeks} weeks' worth) annual leave \
to take between ${formatDate(nextStartAnniversary)} and ${formatDate(dayBeforeNextAgainAnniversary)}.`,
            );
        }
    }

    constructor(
        bot: builder.UniversalBot,
    ) {
        super(bot,
            DialogIds.CheckAnnualLeaveDialogId,
            DialogMatches.CheckAnnualLeaveDialogMatch,
            [
                CheckAnnualLeaveDialog.step1,
                CheckAnnualLeaveDialog.step2,
            ],
        );
    }
}

function earlierInYear(date1: Date, date2: Date): boolean {
    let y1 = date1.getFullYear();
    let m1 = date1.getMonth();
    let d1 = date1.getDate();
    let y2 = date2.getFullYear();
    let m2 = date2.getMonth();
    let d2 = date2.getDate();
    return (
        (m1 < m2) ||
        (
            (m1 === m2) &&
            (d1 < d2)
        )
    );
}

function formatDate(date: Date): string {
    return date.toLocaleDateString(
        "en-GB",
        { year: "numeric", month: "long", day: "numeric" },
    );
}
