import * as html from "../models/html";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";

export class HtmlEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Validates an uploaded HTML file for viruses and encoding errors.
   * Must be called before using the HTML in any other operation.
   * Creates task and polls for result automatically.
   */
  public async validate(
    req: html.HtmlValidateRequest,
  ): Promise<html.HtmlValidateResponse> {
    const task = await this.wrap.post(
      "/html/validate",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/html/validate/${task.job_id}`,
      html.HtmlValidateResponseSchema,
    );
  }

  /**
   * Converts an HTML file to PDF format.
   * Creates task and polls for result automatically.
   */
  public async toPdf(
    req: html.HtmlToPdfRequest,
  ): Promise<html.HtmlToPdfResponse> {
    const task = await this.wrap.post(
      "/html/to/pdf",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/html/to/pdf/${task.job_id}`,
      html.HtmlToPdfResponseSchema,
    );
  }
}
