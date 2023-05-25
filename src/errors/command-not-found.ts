import {Hook} from '@oclif/core'

const hook: Hook<'command-not-found'> = async function () {
  console.log(`example init hook running before `)
}

export default hook