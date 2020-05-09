
import { Hook, HookContext } from '@feathersjs/feathers'

const createdAt = (): Hook => {
  return async (context: HookContext) => {
    const { time } = context.data
    const dt = new Date()
    dt.setMinutes(dt.getMinutes() + time);
    context.data.startAt = dt
    return Promise.resolve(context)
  }
}

export {
  createdAt
}