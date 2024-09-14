export default async function () {
  console.log('Connection with Shrek established')
}

export const lifecycleEvent = 'onServerConnectionOpen'
export const channels = ['/chat']