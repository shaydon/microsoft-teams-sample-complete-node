import * as builder from "botbuilder";
import { TriggerActionDialog } from "../utils/TriggerActionDialog";
import { DialogIds } from "../utils/DialogIds";
import { DialogMatches } from "../utils/DialogMatches";
import { Strings } from "../locale/locale";
import { IPromptTimeEnGbDialogResult } from "./PromptTimeEnGbDialog";
import { Worker, EmployeeContract, CasualContract } from "./Worker";

export class EnsureWorkerDetailsDialog {

    private static async step1(
        session: builder.Session,
        worker: Worker,
        next: (args?: builder.IPromptChoiceResult) => void,
        ): Promise<void> {
        session.dialogData.worker = worker.serialize();
        if (worker.casualContract === undefined &&
            worker.employeeContract === undefined) {
            builder.Prompts.choice(
                session,
                "Are you a casual worker or an employee (full or part-time)?",
                "casual worker|employee",
                { listStyle: builder.ListStyle.button },
            );
        } else {
            if (worker.casualContract === null) {
                session.send("I know you're not a casual worker, so please tell me about your employment with us.");
            }
            next();
        }
    }

    private static async step2(
        session: builder.Session,
        args: builder.IPromptChoiceResult,
        next: (args?: builder.IPromptNumberResult) => void,
        ): Promise<void> {
        let worker = Worker.deserialize(session.dialogData.worker);
        if (args.response) {
            if (args.response.entity === "employee") {
                worker.employeeContract = worker.employeeContract || new EmployeeContract();
            } else {
                worker.casualContract = worker.casualContract || new CasualContract();
                worker.employeeContract = null;
            }
        }
        session.dialogData.worker = worker.serialize();
        if (worker.employeeContract) {
            if (worker.employeeContract.hours === undefined) {
                builder.Prompts.number(
                    session,
                    "How many hours a week are you contracted to work?",
                    { minValue: 0, maxValue: 39 },
                );
            } else {
                next();
            }
        } else if (worker.casualContract) {
            session.send("As a casual worker, you receive statuatory holiday pay. Please speak to your manager for details!");
            session.endDialogWithResult({
                response: worker,
            });
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted,
            });
        }
    }

    private static async step3(
        session: builder.Session,
        args: builder.IPromptNumberResult,
        next: (args?: IPromptTimeEnGbDialogResult) => void,
    ): Promise<void> {
        let worker = Worker.deserialize(session.dialogData.worker);
        if (args.response) {
            worker.employeeContract.hours = args.response;
        }
        session.dialogData.worker = worker.serialize();
        if (worker.employeeContract.startDate === undefined) {
            session.beginDialog(
                DialogIds.PromptTimeEnGbDialogId,
                {
                    prompt:
`When did you start working for the Action Group?`
/*
If you're not sure of the exact date just tell me the month and year.

If you started as a casual worker or volunteer, tell me when you became a contracted employee.
`*/,
                    retryPrompt: "Sorry I don't understand. Try something like '25/12/02' or 'June 2008'.",
                },
        );
        } else {
            next();
        }
    }

    private static async step4(
        session: builder.Session,
        args: IPromptTimeEnGbDialogResult,
        next: () => void,
    ): Promise<void> {
        let worker = Worker.deserialize(session.dialogData.worker);
        if (args.response) {
            worker.employeeContract.startDate = args.response;
        }
        session.dialogData.worker = worker.serialize();
        session.endDialogWithResult({
            response: worker,
        });
   }

    constructor(
        bot: builder.UniversalBot,
    ) {
        bot.dialog(
            DialogIds.EnsureWorkerDetailsDialogId,
            [
                EnsureWorkerDetailsDialog.step1,
                EnsureWorkerDetailsDialog.step2,
                EnsureWorkerDetailsDialog.step3,
                EnsureWorkerDetailsDialog.step4,
            ],
        );
    }
}
