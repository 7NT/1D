// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (context: HookContext) => {
    // const { data } = context;
    const { to, text, request } = context.data;

    // Throw an error if we didn't get a text
    if (!text && !request) {
      throw new Error('A message must have a text');
    }

    // The authenticated user
    const user = context.params.user;
    // The actual message text
    //const text = data.text.substring(0, 400);
    // Messages can't be longer than 400 characters

    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      request,
      text: text.substring(0, 400),
      to,
      // Set the user id
      userId: user._id,
      // Add the current date
      created: new Date().getTime()
    };

    // Best practice: hooks should always return the context
    return context;
  };
}
