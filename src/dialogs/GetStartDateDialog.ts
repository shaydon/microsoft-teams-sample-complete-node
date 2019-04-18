import * as builder from "botbuilder";
import { TriggerActionDialog } from "../utils/TriggerActionDialog";
import { DialogIds } from "../utils/DialogIds";
import { DialogMatches } from "../utils/DialogMatches";
import { Strings } from "../locale/locale";

export class GetStartDateDialog extends TriggerActionDialog {

    private static async promptForStartDate(session: builder.Session, args?: any | builder.IDialogResult<any>, next?: (args?: builder.IDialogResult<any>) => void): Promise<void> {
        builder.Prompts.time(session, Strings.what_date_did_you_start_working_for_the_action_group);
    }

    private static async showResult(session: builder.Session, args?: any | builder.IDialogResult<any>, next?: (args?: builder.IDialogResult<any>) => void): Promise<void> {
        let startDate = builder.EntityRecognizer.resolveTime([args.response]);
        if (startDate) {
            let msg = session.gettext(Strings.i_read_that_as, startDate);
            session.send(msg);
            session.endDialogWithResult({
                response: { startDate: startDate },
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
            DialogIds.GetStartDateDialogId,
            DialogMatches.GetStartDateDialogMatch,
            [
                GetStartDateDialog.promptForStartDate,
                GetStartDateDialog.showResult,
            ],
        );
    }
}
