import * as builder from "botbuilder";
import { TriggerActionDialog } from "../utils/TriggerActionDialog";
import { DialogIds } from "../utils/DialogIds";
import { DialogMatches } from "../utils/DialogMatches";
import { Strings } from "../locale/locale";

interface WorkerDetails {
    casualContract?: boolean;
    employeeContract?: EmployeeDetails;
}

interface EmployeeDetails {
    hours?: number;
    startDate?: Date;
}

export class EnsureWorkerDetailsDialog extends TriggerActionDialog {

    private static async step1(
        session: builder.Session,
        args: WorkerDetails,
        next: (args?: builder.IDialogResult<any>) => void,
        ): Promise<void> {
        session.dialogData.workerDetails = {};
        let casualStatusKnown = "casualContract" in session.dialogData.workerDetails;
        let employeeStatusKnown = "employeeContract" in session.dialogData.workerDetails;
        if (!casualStatusKnown && !employeeStatusKnown) {
            builder.Prompts.choice(
                session,
                "Are you a casual worker or an employee (full or part-time)?",
                "casual worker|employee",
                { listStyle: builder.ListStyle.button },
            );
        } else {
            if (casualStatusKnown && !session.dialogData.workerDetails.casualContract) {
                session.send("I know you're not a casual worker, so please tell me about your employment with us.");
            }
            next();
        }
    }

    private static async step2(
        session: builder.Session,
        args: builder.IDialogResult<any>,
        next: (args?: builder.IDialogResult<any>) => void,
        ): Promise<void> {
        if (args.response) {
            if (args.response.entity === "employee") {
                session.dialogData.workerDetails.employeeContract =
                    session.dialogData.workerDetails.employeeContract || {};
            } else {
                session.dialogData.workerDetails.casualContract = true;
                session.dialogData.workerDetails.employeeContract = null;
            }
        }
        if (session.dialogData.workerDetails.employeeContract) {
            let employeeHoursKnown =
                "hours" in session.dialogData.workerDetails.employeeContract;
            if (!employeeHoursKnown) {
                builder.Prompts.number(session, "How many hours a week are you contracted to work?");
            } else {
                next();
            }
        } else if (session.dialogData.workerDetails.casualContract) {
            session.send("As a casual worker, you receive statuatory holiday pay. Please speak to your manager for details!");
            session.endDialogWithResult({
                response: session.dialogData.workerDetails,
            });
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted,
            });
        }
    }

    private static async promptForStartDate(session: builder.Session, args?: any | builder.IDialogResult<any>, next?: (args?: builder.IDialogResult<any>) => void): Promise<void> {
        session.beginDialog(
            DialogIds.PromptTimeEnGbDialogId,
            {
                prompt: Strings.what_date_did_you_start_working_for_the_action_group,
                retryPrompt: Strings.sorry_i_didnt_understand_that,
            },
        );
    }

    private static async showResult(session: builder.Session, args?: any | builder.IDialogResult<any>, next?: (args?: builder.IDialogResult<any>) => void): Promise<void> {
        if (args.response) {
            let msg = session.gettext(Strings.i_read_that_as, args.response);
            session.send(msg);
            session.endDialogWithResult({
                response: args.response,
            });
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted,
            });
        }
    }

    constructor(
        bot: builder.UniversalBot,
    ) {
        super(bot,
            DialogIds.EnsureWorkerDetailsDialogId,
            DialogMatches.CheckWorkerDetailsDialogMatch,
            [
                EnsureWorkerDetailsDialog.step1,
                EnsureWorkerDetailsDialog.step2,
                EnsureWorkerDetailsDialog.promptForStartDate,
                EnsureWorkerDetailsDialog.showResult,
            ],
        );
    }
}
