export type OutputType = "formula" | "vba" | "chart";

export interface Query {
  id: string;
  input: string;
  output: string;
  outputType: OutputType;
  rating?: number;
  createdAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  paystackCustomerId?: string;
  trialUses: number;
  subscription?: string;
  subscriptionStart?: Date;
}
