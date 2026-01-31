type ParamName<S extends string> = S extends `...${infer P}` ? P : S;

type RouteParams<Path extends string> =
  Path extends `${string}[${infer Param}]${infer Rest}`
    ? { [K in ParamName<Param> | keyof RouteParams<Rest>]: string }
    : Record<string, never>;

export type RouteContext<Path extends string> = {
  params: Promise<RouteParams<Path>>;
};
