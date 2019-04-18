import * as builder from "botbuilder";
import * as chrono from "chrono-node";
import { DialogIds } from "../utils/DialogIds";

export class PromptTimeEnGbDialog {

    private static async showPrompt(
        session: builder.Session,
        args: { prompt: string, retryPrompt: string },
    ): Promise<void> {
        session.dialogData.args = args;
        builder.Prompts.text(session, args.prompt);
    }

    private static async interpretResponse(
        session: builder.Session,
        result: builder.IDialogResult<any>,
    ): Promise<void> {
        if (result.response) {
            let date = chrono.en_GB.parseDate(result.response);
            if (date) {
                session.endDialogWithResult({ response: date });
            } else {
                let args = session.dialogData.args;
                args.prompt = args.retryPrompt;
                session.replaceDialog(DialogIds.PromptTimeEnGbDialogId, args);
            }
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted,
            });
        }
    }

    constructor(bot: builder.UniversalBot) {
        bot.dialog(
            DialogIds.PromptTimeEnGbDialogId,
            [
                PromptTimeEnGbDialog.showPrompt,
                PromptTimeEnGbDialog.interpretResponse,
            ],
        );
    }
}
