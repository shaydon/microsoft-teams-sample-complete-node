import * as builder from "botbuilder";

// Collapse all whitespace to a single space character
export class NormalizeWhitespace implements builder.IMiddlewareMap {

    public readonly botbuilder = (session: builder.Session, next: Function): void => {
        let message = session.message;
        if (message && message.text) {
            message.text = message.text.replace(/\s+/, " ");
        }
        next();
    }
}
