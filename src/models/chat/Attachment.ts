/**
 * An Attachment is a file that is attached to a message and uploaded to cloud storage.
 */
export type Attachment = {
  /**
   * The mime type of the attachment.
   */
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
