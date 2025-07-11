This is a repro for a bug where overriding a method on a Durable Object inside its constructor prevents RPC calls to that method.

The setup: A Durable Object class that has a method that is overridden inside its constructor.

```ts
class MyDO extends DurableObject {
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
```

Nothing fancy, we see that `::something()` is overridden inside its constructor.

Let's call it from a worker:

```ts
export default {
  async fetch(_request: Request, env: Env, _ctx: ExecutionContext) {
    const id = env.MyDO.idFromName("my-durable-object");
    const myDO = env.MyDO.get(id);
    const res = await myDO.something("anyone there?");
    return new Response(res);
  },
};
```

Without the override, we get the expected response: `asked anyone there?: hello world`.

However, with the override, the request doesn't reach the Durable Object, and we get this error:

`The RPC receiver does not implement the method "something".`
