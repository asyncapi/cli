export default async function (event) {
  const { id, lumens, sentAt } = event.payload
  console.log(`Streetlight with id "${id}" updated its lighting information to ${lumens} lumens at ${sentAt}.`)
}
