import z from "zod";

export const hitpayCredentialKeysSchema = z.object({
  prod: z
    .object({
      apiKey: z.string(),
      saltKey: z.string(),
      defaultLink: z.string().optional(),
    })
    .optional(),
  sandbox: z
    .object({
      apiKey: z.string(),
      saltKey: z.string(),
      defaultLink: z.string().optional(),
    })
    .optional(),
  isSandbox: z.boolean(),
});
