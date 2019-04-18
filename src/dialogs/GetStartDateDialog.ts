import * as builder from "botbuilder";
import { TriggerActionDialog } from "../utils/TriggerActionDialog";
import { DialogIds } from "../utils/DialogIds";
import { DialogMatches } from "../utils/DialogMatches";
import { Strings } from "../locale/locale";

export class GetStartDateDialog extends TriggerActionDialog {

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
            DialogIds.GetStartDateDialogId,
            DialogMatches.GetStartDateDialogMatch,
            [
                GetStartDateDialog.promptForStartDate,
                GetStartDateDialog.showResult,
            ],
        );
    }
}
