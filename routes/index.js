'use strict';

const { Router } = require('express');
const router = Router();

router.get('/', (req, res, next) => {
  res.render('home');
});

// pipe all other requests through the route modules
router.use(require('./computers'));
router.use(require('./employees'));
router.use(require('./training-programs'));
router.use(require('./departments'));
// router.use(require('./foo'));

module.exports = router;
