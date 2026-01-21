import * as email from "../models/email";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";

export class EmailEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Validates an uploaded email file for viruses and encoding errors.
   * Must be called before using the email in any other operation.
   * Creates task and polls for result automatically.
   */
  public async validate(
    req: email.EmailValidateRequest,
  ): Promise<email.EmailValidateResponse> {
    const task = await this.wrap.post(
      "/email/validate",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/email/validate/${task.job_id}`,
      email.EmailValidateResponseSchema,
    );
  }
}
