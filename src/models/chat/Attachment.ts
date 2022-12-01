/**
 * An Attachment is a file that is attached to a message and uploaded to cloud storage.
 * @date 1/12/2022 - 18:49:13
 *
 * @export
 * @typedef {Attachment}
 */
export type Attachment = {
  mimeType: string;
  /**
   * The path to the file in cloud storage.
   */
  storageSourcePath: string;
  /**
   * The name of the file.
   */
  fileName: string;
  /**
   * The final url of the file after it has been uploaded to cloud storage.
   */
  uri: string;
};
