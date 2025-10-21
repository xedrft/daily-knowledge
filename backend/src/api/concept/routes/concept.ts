/**
 * concept router
 */

module.exports = {
	routes: [
		{
			method: 'POST',
			path: '/concept/get',
			handler: 'concept.getByIdOrTitle',
		},
	],
};
