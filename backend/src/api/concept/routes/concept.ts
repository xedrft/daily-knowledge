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
		{
			method: 'POST',
			path: '/concept/regenerate',
			handler: 'concept.regenerate',
		},
	],
};
