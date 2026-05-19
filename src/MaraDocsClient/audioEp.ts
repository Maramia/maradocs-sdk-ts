import * as audio from "../models/audio";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";
import type { RequestOptions } from "../shared/requestOptions";

export class AudioEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Validates an uploaded audio file (virus scan + transcode to FLAC).
   * Creates a task and polls for the result automatically.
   */
  public async validate(
    req: audio.AudioValidateRequest,
    options?: RequestOptions,
  ): Promise<audio.AudioValidateResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/audio/validate",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/audio/validate/${task.job_id}`,
      audio.AudioValidateResponseSchema,
      timeout,
    );
  }
}
