export default {
  routes: [
    {
      method: 'POST',
      path: '/internal-difficulty/record',
      handler: 'internal-difficulty.record',

    },
    {
      method: 'GET',
      path: '/internal-difficulty/aggregate',
      handler: 'internal-difficulty.aggregate',
    },
    {
      method: 'GET',
      path: '/internal-difficulty/for/:conceptId',
      handler: 'internal-difficulty.getForConcept',
    }
  ]
}
