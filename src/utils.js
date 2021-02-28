/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Passar upp á að það sé innskráður notandi í request. Skilar næsta middleware
 * ef svo er, annars redirect á /login
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {funcion} next Næsta middleware
 */
export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}
