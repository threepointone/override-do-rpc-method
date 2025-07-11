import { DurableObject } from "cloudflare:workers";

type Env = {
  MyDO: DurableObjectNamespace<MyDO>;
};

export class MyDO extends DurableObject {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    const _something = this.something.bind(this);
    this.something = (message: string) => {
      console.log("overriding something");
      return _something(message);
    };
  }
  async something(message: string) {
    return `asked ${message}: hello world`;
  }
}

export default {
  async fetch(_request: Request, env: Env, _ctx: ExecutionContext) {
    const id = env.MyDO.idFromName("my-durable-object");
    const myDO = env.MyDO.get(id);
    const res = await myDO.something("anyone there?");
    return new Response(res);
  },
};
