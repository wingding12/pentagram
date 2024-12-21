declare module "modal" {
  export function run(
    functionName: string,
    params: Record<string, any>
  ): Promise<{ imageUrl: string }>;
}
