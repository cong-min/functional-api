export type Req = string;
export type Res = string;

const main: FA.Function<Req, Res> = (params, ctx): Res => 'Hello Functional';

export default main;
