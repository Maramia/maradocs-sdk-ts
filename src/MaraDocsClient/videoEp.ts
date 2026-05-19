import * as video from "../models/video";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";
import type { RequestOptions } from "../shared/requestOptions";

export class VideoEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Validates an uploaded video file (virus scan + transcode to MP4).
   * Creates a task and polls for the result automatically.
   */
  public async validate(
    req: video.VideoValidateRequest,
    options?: RequestOptions,
  ): Promise<video.VideoValidateResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/video/validate",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/video/validate/${task.job_id}`,
      video.VideoValidateResponseSchema,
      timeout,
    );
  }
}
