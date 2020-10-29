export type Req = string;
export type Res = string;

const main: FA.Function<Req, Res> = async (params, ctx): Promise<Res> => 'Hello Functional';

export default main;
